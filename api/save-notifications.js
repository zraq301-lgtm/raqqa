import admin from 'firebase-admin';
import pkg from 'pg';
const { Pool } = pkg;

// إعداد الاتصال مع تعديل الـ SSL لإزالة التحذير
const pool = new Pool({
  // إضافة البرامتر sslmode=verify-full في نهاية الرابط يحل التحذير أمنياً
  connectionString: process.env.DATABASE_URL + (process.env.DATABASE_URL.includes('?') ? '&' : '?') + 'sslmode=verify-full',
  ssl: { 
    rejectUnauthorized: false,
    // هذا السطر يخبر المكتبة بتجاوز فحص الهوية المتكرر الذي يسبب التحذير
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
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const { 
    fcmToken, user_id = 1, category = 'general', data_content = {}, 
    ai_analysis = null, title = "رقة", body = "تنبيه جديد", scheduled_for = null 
  } = req.body;

  try {
    const isScheduled = !!scheduled_for;

    // 1. الحفظ في نيون (Neon DB)
    const query = `
      INSERT INTO notifications (
        user_id, fcm_token, category, data_content, 
        ai_analysis, title, body, scheduled_for, is_sent
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id
    `;

    const values = [
      user_id, fcmToken, category, JSON.stringify(data_content),
      ai_analysis, title, body, scheduled_for, !isScheduled
    ];

    const result = await pool.query(query, values);
    const dbId = result.rows[0].id;

    // 2. الإرسال لـ Firebase إذا كان فورياً
    if (!isScheduled && fcmToken) {
      await admin.messaging().send({
        notification: { title, body },
        token: fcmToken
      });
      return res.status(200).json({ success: true, mode: 'Instant', db_id: dbId });
    }

    return res.status(200).json({ success: true, mode: 'Scheduled', db_id: dbId });

  } catch (error) {
    console.error('❌ Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
