import admin from 'firebase-admin';
import pkg from 'pg';
const { Pool } = pkg;

// إعداد الاتصال مع نيون وإصلاح تحذير SSL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { 
    rejectUnauthorized: false,
    checkServerIdentity: () => undefined 
  }
});

const serviceAccount = {
  "type": "service_account",
  "project_id": "raqqa-43dc8",
  "client_email": "firebase-adminsdk-fbsvc@raqqa-43dc8.iam.gserviceaccount.com",
  "private_key": process.env.FIREBASE_PRIVATE_KEY 
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') 
    : undefined,
};

if (!admin.apps.length) {
  try {
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  } catch (error) {
    console.error('❌ خطأ في تهيئة Firebase:', error.message);
  }
}

export default async function handler(req, res) {
  try {
    // 1. جلب الإشعارات المستحقة (تعديل بسيط لضمان دقة التوقيت)
    const query = `
      SELECT id, fcm_token, title, body 
      FROM notifications 
      WHERE is_sent = false 
      AND scheduled_for <= NOW() 
      AND fcm_token IS NOT NULL
      LIMIT 50;
    `;

    const result = await pool.query(query);
    const pendingNotes = result.rows;

    if (pendingNotes.length === 0) {
      return res.status(200).json({ message: "لا توجد إشعارات مجدولة حالياً." });
    }

    const sentIds = [];

    // 2. حلقة الإرسال
    for (const note of pendingNotes) {
      try {
        await admin.messaging().send({
          token: note.fcm_token,
          notification: {
            title: note.title || "تنبيه رقة",
            body: note.body || "لديك موعد جديد الآن"
          }
        });
        sentIds.push(note.id);
      } catch (fcmError) {
        console.error(`❌ فشل إرسال الإشعار رقم ${note.id}:`, fcmError.message);
      }
    }

    // 3. تحديث الحالة في نيون
    if (sentIds.length > 0) {
      await pool.query(
        "UPDATE notifications SET is_sent = true WHERE id = ANY($1)", 
        [sentIds]
      );
    }

    return res.status(200).json({
      success: true,
      sent_count: sentIds.length
    });

  } catch (dbError) {
    console.error('❌ خطأ:', dbError.message);
    return res.status(500).json({ error: dbError.message });
  }
}
