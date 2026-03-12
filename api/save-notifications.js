import pkg from 'pg';
const { Pool } = pkg;

// --- الإصلاح: استخدام WHATWG URL API لتجنب تحذير [DEP0169] ---
const dbUrl = new URL(process.env.DATABASE_URL);

// إعداد الاتصال بقاعدة بيانات نيون بطريقة مجزأة وأكثر أماناً
const pool = new Pool({
  host: dbUrl.hostname,
  port: dbUrl.port,
  user: dbUrl.username,
  password: dbUrl.password,
  database: dbUrl.pathname.split('/')[1],
  // إضافة معايير SSL المطلوبة لنيون
  ssl: { 
    rejectUnauthorized: false 
  },
  // إعدادات إضافية للأداء في بيئة Serverless
  max: 1, 
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000
});

export default async function handler(req, res) {
  // السماح بطلبات POST فقط
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  // استلام البيانات من الواجهة
  let { 
    fcmToken, 
    user_id, 
    category, 
    title, 
    body, 
    scheduled_for, 
    startDate, 
    endDate 
  } = req.body;

  try {
    // 1. معالجة التواريخ
    const finalStartDate = startDate ? new Date(startDate) : new Date();
    const finalEndDate = endDate ? new Date(endDate) : null;
    const finalScheduledFor = scheduled_for ? new Date(scheduled_for) : finalStartDate;

    // 2. الحالة دائماً false لخدمة منصة Make
    const isSentStatus = false; 

    // 3. استعلام الإدخال
    const query = `
      INSERT INTO notifications (
        user_id, 
        fcm_token, 
        category, 
        title, 
        body, 
        is_sent, 
        scheduled_for, 
        period_start_date, 
        period_end_date
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
      RETURNING id
    `;

    // 4. ترتيب القيم
    const values = [
      isNaN(parseInt(user_id)) ? 1 : parseInt(user_id),
      fcmToken || null,
      category || 'general',
      title || 'تحديث من رقة',
      body || '',
      isSentStatus,
      finalScheduledFor,
      finalStartDate,
      finalEndDate
    ];

    const result = await pool.query(query, values);

    // الرد بنجاح
    return res.status(200).json({ 
      success: true, 
      db_id: result.rows[0].id,
      message: "تم الحفظ بنجاح والحالة FALSE لانتظار معالجة منصة Make",
      tracking_info: {
        category: category,
        start_date: finalStartDate.toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Neon Insertion Error:', error.message);
    return res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
}
