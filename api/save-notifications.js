import admin from 'firebase-admin';
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL + (process.env.DATABASE_URL.includes('?') ? '&' : '?') + 'sslmode=verify-full',
  ssl: { rejectUnauthorized: false, checkServerIdentity: () => undefined }
});

const serviceAccount = {
  "type": "service_account",
  "project_id": "raqqa-43dc8",
  "client_email": "firebase-adminsdk-fbsvc@raqqa-43dc8.iam.gserviceaccount.com",
  "private_key": process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
};

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  // التقاط البيانات بناءً على صورة الواجهة (سجل التواريخ)
  let { 
    fcmToken, 
    user_id, 
    category, 
    title, 
    body, 
    scheduled_for, // تاريخ الإشعار المجدول
    startDate,     // تاريخ البدء من الواجهة
    endDate,       // تاريخ الانتهاء من الواجهة
    isFromMake = false 
  } = req.body;

  try {
    // 🧠 منطق القوالب
    const templates = {
      'period': { t: "رقة: تذكير رقيق 🌸", b: "سيدتي، أذكركِ باقتراب موعد دورتكِ الشهرية." },
      'beauty': { t: "وقت التدليل ✨", b: "سيدتي، لا تنسي روتين العناية بجمالكِ اليوم." }
    };

    if (templates[category]) {
      title = templates[category].t;
      body = templates[category].b;
    }

    // تجهيز تاريخ الحفظ (نستخدم تاريخ البدء إذا لم يوجد تاريخ جدولة صريح)
    const saveDate = scheduled_for ? new Date(scheduled_for) : (startDate ? new Date(startDate) : new Date());
    const isFuture = saveDate > new Date(Date.now() + 60000);

    const query = `
      INSERT INTO notifications (
        user_id, fcm_token, category, title, body, scheduled_for, is_sent, 
        period_start_date, period_end_date
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id
    `;

    const values = [
      isNaN(parseInt(user_id)) ? 1 : parseInt(user_id),
      fcmToken,
      category,
      title,
      body,
      saveDate,
      isFuture ? false : true,
      startDate ? new Date(startDate) : null,
      endDate ? new Date(endDate) : null
    ];

    const result = await pool.query(query, values);

    // إرسال الإشعار فوراً إذا كان التاريخ حالياً أو قديماً
    if (!isFuture && fcmToken) {
      const messagePayload = {
        notification: { title: title || "رقة", body: body || "تحديث جديد" },
        token: fcmToken
      };
      await admin.messaging().send(messagePayload);
    }

    return res.status(200).json({ 
        success: true, 
        db_id: result.rows[0].id,
        received_dates: { start: startDate, end: endDate } // للتأكد في سجلات فيرسل
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    return res.status(500).json({ error: error.message });
  } finally {
    await pool.end();
  }
}
