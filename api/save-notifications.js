import admin from 'firebase-admin';
import pkg from 'pg';
const { Pool } = pkg;

/**
 * إعداد الاتصال بقاعدة بيانات نيون مع حل مشكلة تحذير SSL
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { 
    rejectUnauthorized: false, // مطلوب للاتصال بـ Neon من Vercel
    checkServerIdentity: () => undefined // حل مشكلة SECURITY WARNING في إصدارات pg الحديثة
  }
});

/**
 * تهيئة Firebase Admin
 */
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
    console.log("✅ Firebase Admin initialized successfully.");
  } catch (error) {
    console.error("❌ Firebase Initialization Error:", error.message);
  }
}

export default async function handler(req, res) {
  // السماح بطلبات POST فقط لضمان أمان البيانات
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  // استخراج البيانات مع تأمين القيم الافتراضية
  const { 
    fcmToken, 
    user_id = 1, 
    category = 'general', 
    data_content = {}, 
    ai_analysis = null,
    title = "رقة", 
    body = "تنبيه جديد من تطبيق رقة", 
    scheduled_for = null 
  } = req.body;

  try {
    // تحديد ما إذا كان الطلب مجدولاً للمستقبل أم فورياً
    const isScheduledRequest = !!scheduled_for;

    /**
     * الوظيفة الأولى: الحفظ في نيون (Neon DB)
     * يتم حفظ البيانات في جميع الحالات (سواء فورية أو مجدولة)
     */
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
      !isScheduledRequest // true إذا كان الإرسال فورياً الآن، false إذا كان سينتظر الـ Cron
    ];

    const dbResult = await pool.query(insertQuery, values);
    const dbId = dbResult.rows[0].id;
    console.log(`✅ Data saved in Neon. Record ID: ${dbId}`);

    /**
     * الوظيفة الثانية: الإرسال الفوري عبر Firebase
     * يتم التنفيذ فقط إذا لم يكن هناك تاريخ مجدول (scheduled_for = null)
     */
    if (!isScheduledRequest) {
      if (fcmToken) {
        const message = {
          notification: { title, body },
          token: fcmToken
        };
        const firebaseResponse = await admin.messaging().send(message);
        console.log("🚀 Instant Notification Sent via Firebase:", firebaseResponse);
        
        return res.status(200).json({ 
          success: true, 
          mode: 'Instant', 
          db_id: dbId, 
          firebase_id: firebaseResponse 
        });
      } else {
        console.warn("⚠️ fcmToken missing for instant notification.");
      }
    }

    // في حالة الجدولة، نكتفي بالرد بنجاح الحفظ في قاعدة البيانات
    console.log(`📅 Notification scheduled for: ${scheduled_for}`);
    return res.status(200).json({ 
      success: true, 
      mode: 'Scheduled', 
      db_id: dbId 
    });

  } catch (error) {
    console.error('❌ Server Error:', error.message);
    return res.status(500).json({ 
      error: 'Operation Failed', 
      details: error.message 
    });
  }
}
