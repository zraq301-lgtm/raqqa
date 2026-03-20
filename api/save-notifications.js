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
  // التأكد من أن الطريقة هي POST كما هو مرسل من الواجهة
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // استخراج البيانات بنفس المسميات القادمة من الواجهة (Body)
  const { 
    user_id, 
    fcmToken, 
    category, 
    title, 
    body, 
    scheduled_for, // هذا هو التاريخ المستقبلي القادم من الواجهة
    note 
  } = req.body;

  try {
    let finalDate;

    // المنطق: إذا وصل تاريخ، اطرح منه يومين. إذا لم يصل، استخدم تاريخ اللحظة.
    if (scheduled_for) {
      const dateObj = new Date(scheduled_for);

      if (!isNaN(dateObj.getTime())) {
        // --- العملية الحسابية المطلوبة: طرح يومين (48 ساعة) ---
        dateObj.setDate(dateObj.getDate() - 2);
        finalDate = dateObj.toISOString();
      } else {
        finalDate = new Date().toISOString();
      }
    } else {
      finalDate = new Date().toISOString();
    }

    // الاستعلام للحفظ في جدول notifications في نيون
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

    // ترتيب القيم للتأكد من مطابقتها لجدول قاعدة البيانات
    const values = [
      parseInt(user_id) || 1,
      fcmToken || null,
      category || 'medical_report',
      title || 'تذكير طبي',
      body || '',
      finalDate, // التاريخ المحسوب (الموعد - يومين)
      JSON.stringify({ note: note || '' }), // حفظ الملاحظات كـ JSON
      false // التنبيه لم يرسل بعد
    ];

    const result = await pool.query(query, values);

    // الرد على الواجهة بالنجاح والتاريخ الجديد الذي تم جدولته
    return res.status(200).json({ 
      success: true, 
      id: result.rows[0].id,
      scheduled_at: finalDate, 
      message: "تم استقبال التاريخ وطرح يومين منه وجدولته بنجاح"
    });

  } catch (error) {
    console.error('❌ Database Error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
}
