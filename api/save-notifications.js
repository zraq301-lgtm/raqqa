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

  // استلام البيانات من الواجهة (تأكد أن التطبيق يرسلstartDate و endDate)
  let { 
    fcmToken, 
    user_id, 
    category, 
    title, 
    body, 
    scheduled_for,
    startDate, // التاريخ الذي اخترته في "تاريخ البدء"
    endDate,   // التاريخ الذي اخترته في "تاريخ الانتهاء"
    isFromMake = false 
  } = req.body;

  try {
    // 1. تحديد القوالب التلقائية
    const templates = {
      'period': { t: "رقة: تذكير رقيق 🌸", b: "سيدتي، أذكركِ باقتراب موعد دورتكِ الشهرية." },
      'beauty': { t: "وقت التدليل ✨", b: "سيدتي، لا تنسي روتين العناية بجمالكِ اليوم." }
    };

    if (templates[category]) {
      title = templates[category].t;
      body = templates[category].b;
    }

    // 2. الحل الجذري لمشكلة التاريخ:
    // نتحقق أولاً: هل أرسلت الواجهة startDate؟ إذا نعم نستخدمه، وإلا نستخدم تاريخ الإدخال الحالي.
    const finalStartDate = startDate ? new Date(startDate) : new Date();
    const finalEndDate = endDate ? new Date(endDate) : null;
    
    // تاريخ الجدولة للإشعار (يتبع تاريخ البدء المختار)
    const finalScheduledFor = scheduled_for ? new Date(scheduled_for) : finalStartDate;

    // فحص هل التاريخ المختار "مستقبلي" أم "قديم/حالي"
    const isFuture = finalScheduledFor > new Date(Date.now() + 60000);
    const isSentStatus = isFuture ? false : true;

    // 3. الحفظ في قاعدة البيانات (الأعمدة الإنجليزية كما في صورتك الأخيرة)
    const query = `
      INSERT INTO notifications (
        user_id, fcm_token, category, title, body, is_sent, 
        scheduled_for, period_start_date, period_end_date
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id
    `;

    const values = [
      isNaN(parseInt(user_id)) ? 1 : parseInt(user_id),
      fcmToken,
      category,
      title,
      body,
      isSentStatus,
      finalScheduledFor, // تاريخ الجدولة
      finalStartDate,    // تاريخ البدء المختار (بدلاً من تاريخ اللحظة)
      finalEndDate       // تاريخ الانتهاء المختار
    ];

    const result = await pool.query(query, values);

    // 4. إرسال إشعار فوري فقط إذا كان التاريخ "الآن" أو "ماضي"
    if (!isFuture && fcmToken) {
      await admin.messaging().send({
        notification: { title: title || "رقة", body: body || "تحديث جديد" },
        token: fcmToken
      });
    }

    return res.status(200).json({ 
        success: true, 
        db_id: result.rows[0].id,
        saved_data: {
            start: finalStartDate.toISOString(),
            end: finalEndDate ? finalEndDate.toISOString() : null,
            mode: isFuture ? "Scheduled" : "Recorded in History"
        }
    });

  } catch (error) {
    console.error('❌ Database/FCM Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
