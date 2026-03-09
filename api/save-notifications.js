import admin from 'firebase-admin';
import { Pool } from 'pg';

// إعداد الاتصال مع قاعدة البيانات نيون
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // ضروري لضمان الاتصال الآمن مع نيون من فيرسل
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
  // 1. التأكد من نوع الطلب وتوفر البيانات
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  // استلام البيانات مع قيم افتراضية لمنع الأخطاء
  const { 
    fcmToken, user_id = 1, category = 'general', data_content = {}, 
    ai_analysis = null, title = "رقة", body = "تنبيه جديد", scheduled_for = null 
  } = req.body;

  console.log("📥 استلام طلب جديد لـ:", category);

  try {
    const isScheduledRequest = !!scheduled_for;

    // 2. محاولة الحفظ في نيون (Neon DB)
    const insertQuery = `
      INSERT INTO notifications (
        user_id, fcm_token, category, data_content, 
        ai_analysis, title, body, scheduled_for, is_sent
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id
    `;

    const values = [
      user_id,
      fcmToken,
      category,
      JSON.stringify(data_content),
      ai_analysis,
      title,
      body,
      scheduled_for,
      !isScheduledRequest // true إذا كان فورياً، false إذا كان مجدولاً
    ];

    const dbResult = await pool.query(insertQuery, values);
    const newId = dbResult.rows[0].id;
    console.log("✅ تم الحفظ في نيون بنجاح، الرقم التعريفى:", newId);

    // 3. إدارة الإرسال لـ Firebase
    if (!isScheduledRequest) {
      if (fcmToken) {
        await admin.messaging().send({
          notification: { title, body },
          token: fcmToken
        });
        console.log("🚀 تم إرسال الإشعار الفوري لـ Firebase");
        return res.status(200).json({ success: true, mode: 'Instant_Sent', db_id: newId });
      } else {
        throw new Error("fcmToken مفقود للإرسال الفوري");
      }
    } else {
      console.log("📅 تم الجدولة للمستقبل:", scheduled_for);
      return res.status(200).json({ success: true, mode: 'Scheduled_Only', db_id: newId });
    }

  } catch (error) {
    console.error('❌ خطأ تفصيلي:', error.message);
    // إرجاع الخطأ لمعرفة السبب (هل هو من نيون أم من فيربيس؟)
    return res.status(500).json({ 
      error: 'فشل في تنفيذ العملية', 
      details: error.message,
      stack: error.stack 
    });
  }
}
