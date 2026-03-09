import admin from 'firebase-admin';
import pkg from 'pg';
const { Pool } = pkg;

// 1. الاتصال بـ نيون باستخدام DATABASE_URL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { 
    rejectUnauthorized: false,
    checkServerIdentity: () => undefined 
  }
});

// 2. إعداد Firebase باستخدام FIREBASE_PRIVATE_KEY
const serviceAccount = {
  "type": "service_account",
  "project_id": "raqqa-43dc8",
  "client_email": "firebase-adminsdk-fbsvc@raqqa-43dc8.iam.gserviceaccount.com",
  "private_key": process.env.FIREBASE_PRIVATE_KEY 
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') 
    : undefined,
};

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

export default async function handler(req, res) {
  // استخدام السر الخاص بك للتأكد من هوية الطلب
  const expectedSecret = "zazo.tona.25sond.12"; 
  const authHeader = req.headers['authorization'];

  if (authHeader !== `Bearer ${expectedSecret}`) {
    return res.status(401).json({ error: 'Unauthorized access' });
  }

  try {
    // 3. سحب الإشعارات المستحقة من نيون
    const { rows } = await pool.query(`
      SELECT id, fcm_token, title, body 
      FROM notifications 
      WHERE is_sent = false 
      AND scheduled_for <= NOW() 
      AND fcm_token IS NOT NULL
      LIMIT 50
    `);

    if (rows.length === 0) {
      return res.status(200).json({ message: "لا توجد مواعيد حالياً" });
    }

    const sentIds = [];

    // 4. إرسال الإشعارات إلى Firebase
    for (const note of rows) {
      try {
        await admin.messaging().send({
          token: note.fcm_token,
          notification: {
            title: note.title || "رقة",
            body: note.body
          }
        });
        sentIds.push(note.id);
      } catch (err) {
        console.error(`❌ فشل الإرسال للسجل ${note.id}:`, err.message);
      }
    }

    // 5. تحديث حالة الإرسال في نيون
    if (sentIds.length > 0) {
      await pool.query("UPDATE notifications SET is_sent = true WHERE id = ANY($1)", [sentIds]);
    }

    return res.status(200).json({ 
      success: true, 
      processed_count: sentIds.length 
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
