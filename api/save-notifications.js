import admin from 'firebase-admin';
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL + (process.env.DATABASE_URL.includes('?') ? '&' : '?') + 'sslmode=verify-full',
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
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const { 
    fcmToken, 
    user_id = 1, 
    category = 'general', 
    data_content = {}, 
    ai_analysis = null, 
    title = "رقة", 
    body = "تنبيه جديد", 
    scheduled_for = null,
    isFromMake = false 
  } = req.body;

  try {
    if (isFromMake === true) {
      if (!fcmToken) throw new Error("Missing fcmToken from Make");
      await admin.messaging().send({
        notification: { title, body },
        token: fcmToken
      });
      return res.status(200).json({ success: true, message: 'Sent via Make', source: 'Make' });
    }

    // --- تعديل ذكي لملء عمود التاريخ (الحل المطلوب) ---
    // إذا أرسلت الواجهة تاريخاً (مثل تاريخ الدورة) نستخدمه، وإلا نستخدم تاريخ اللحظة الحالية فوراً
    const finalDate = scheduled_for || new Date().toISOString();
    
    // نعتبره "مجدول" فقط إذا كان التاريخ في المستقبل، وإلا نعتبره تاريخاً تم تخزينه الآن
    const isScheduled = scheduled_for && new Date(scheduled_for) > new Date();

    const query = `
      INSERT INTO notifications (
        user_id, fcm_token, category, data_content, 
        ai_analysis, title, body, scheduled_for, is_sent
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id
    `;

    const values = [
      user_id, fcmToken, category, 
      typeof data_content === 'object' ? JSON.stringify(data_content) : data_content,
      ai_analysis, title, body, 
      finalDate, // هنا العمود لن يكون NULL أبداً
      !isScheduled // إذا كان التاريخ قديماً أو حالياً، نعتبره مرسلاً (TRUE)
    ];

    const result = await pool.query(query, values);
    const dbId = result.rows[0].id;

    if (!isScheduled && fcmToken) {
      await admin.messaging().send({
        notification: { title, body },
        token: fcmToken
      });
    }

    return res.status(200).json({ success: true, db_id: dbId, stored_date: finalDate });

  } catch (error) {
    console.error('❌ Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
