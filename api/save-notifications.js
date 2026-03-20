import pkg from 'pg';
const { Pool } = pkg;

// إعداد الاتصال بقاعدة بيانات نيون
const dbUrl = new URL(process.env.DATABASE_URL);
const pool = new Pool({
  host: dbUrl.hostname,
  port: dbUrl.port,
  user: dbUrl.username,
  password: dbUrl.password,
  database: dbUrl.pathname.split('/')[1],
  ssl: { rejectUnauthorized: false },
  max: 1
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  let { user_id, fcmToken, category, title, body, scheduled_for, extra_data } = req.body;

  try {
    let finalDate = null;

    if (scheduled_for) {
      // 1. تحويل القيمة القادمة إلى كائن تاريخ
      const dateObj = new Date(scheduled_for);

      if (!isNaN(dateObj.getTime())) {
        // 2. المعادلة المطلوبة: طرح يومين (48 ساعة) من التاريخ المدخل
        // لضمان التذكير قبل الموعد بفترة كافية
        dateObj.setDate(dateObj.getDate() - 2);
        
        // تحويله لصيغة ISO للحفظ في نيون
        finalDate = dateObj.toISOString();
      }
    }

    // إذا لم يتم إرسال تاريخ، أو فشل التحويل، نضع تاريخ اللحظة الحالية كاحتياطي
    if (!finalDate) {
      finalDate = new Date().toISOString();
    }

    // الاستعلام الخاص بإدخال البيانات في جدول الإشعارات
    const query = `
      INSERT INTO notifications (user_id, fcm_token, category, title, body, scheduled_for, extra_data, is_sent)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `;

    const values = [
      parseInt(user_id) || 1,
      fcmToken || null,
      category || 'medical',
      title || 'تذكير طبي',
      body || '',
      finalDate, // التاريخ المسجل هو (الموعد القادم - يومين)
      JSON.stringify(extra_data || {}),
      false
    ];

    const result = await pool.query(query, values);

    return res.status(200).json({ 
      success: true, 
      id: result.rows[0].id, 
      scheduled_at: finalDate,
      message: "تمت جدولة التذكير قبل الموعد بيومين"
    });

  } catch (error) {
    console.error('❌ Database Error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
}
