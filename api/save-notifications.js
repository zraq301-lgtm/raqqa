import pkg from 'pg';
const { Pool } = pkg;

// إعداد الاتصال بقاعدة بيانات نيون (Neon)
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
  // التأكد من أن الطريقة هي POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // استخراج البيانات من الكودين
  const { 
    user_id, 
    fcmToken, 
    category, 
    title, 
    body, 
    scheduled_for, 
    extra_data, 
    note 
  } = req.body;

  try {
    let finalDate;

    // --- منطق معالجة التاريخ (الموعد - يومين) ---
    if (scheduled_for) {
      const dateObj = new Date(scheduled_for);

      if (!isNaN(dateObj.getTime())) {
        dateObj.setDate(dateObj.getDate() - 2);
        finalDate = dateObj.toISOString();
      } else {
        finalDate = new Date().toISOString();
      }
    } else {
      finalDate = new Date().toISOString();
    }

    // --- منطق دمج البيانات الإضافية ---
    const mergedExtraData = extra_data || { note: note || '' };

    // الاستعلام للحفظ في جدول notifications
    const query = `
      INSERT INTO notifications (
        user_id, 
        fcm_token, 
        category, 
        title, 
        body, 
        scheduled_for, 
        extra_data, 
        is_sent
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `;

    // التعديل المطلوب في المسميات العربية والقيم الافتراضية
    const values = [
      parseInt(user_id) || 1,
      fcmToken || null,
      category || 'حيض', // تم تغيير الافتراضي من munst إلى حيض
      title || 'استشارات الطبيب', // تم تغيير الافتراضي من تذكير طبي إلى استشارات الطبيب
      body || '',
      finalDate,
      JSON.stringify(mergedExtraData),
      false
    ];

    const result = await pool.query(query, values);

    return res.status(200).json({ 
      success: true, 
      id: result.rows[0].id,
      scheduled_at: finalDate, 
      message: "تمت جدولة التذكير بنجاح"
    });

  } catch (error) {
    console.error('❌ Database Error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
}
