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

  // استخراج كافة المدخلات من الواجهتين
  let { user_id, fcmToken, category, title, body, scheduled_for, extra_data, note } = req.body;

  try {
    let finalDate = null;

    // --- الجزء المشترك لمعالجة التاريخ ---
    if (scheduled_for) {
      const dateObj = new Date(scheduled_for);
      if (!isNaN(dateObj.getTime())) {
        dateObj.setDate(dateObj.getDate() - 2);
        finalDate = dateObj.toISOString();
      }
    }

    if (!finalDate) {
      finalDate = new Date().toISOString();
    }

    // --- تحديد أي منطق سيتم تنفيذه بناءً على البيانات القادمة ---
    
    let finalValues;
    const query = `
      INSERT INTO notifications (user_id, fcm_token, category, title, body, scheduled_for, extra_data, is_sent)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `;

    // إذا كانت البيانات قادمة من الواجهة الثانية (تحتوي على note أو تصنيف حيض)
    if (note !== undefined || category === 'حيض') {
      // تنفيذ منطق الكود الثاني بالضبط
      const mergedExtraData = extra_data || { note: note || '' };
      finalValues = [
        parseInt(user_id) || 1,
        fcmToken || null,
        category || 'حيض',
        title || 'استشارات الطبيب',
        body || '',
        finalDate,
        JSON.stringify(mergedExtraData),
        false
      ];
    } 
    // وإلا، يتم تنفيذ منطق الكود الأول بالضبط
    else {
      finalValues = [
        parseInt(user_id) || 1,
        fcmToken || null,
        category || 'medical',
        title || 'تذكير طبي',
        body || '',
        finalDate,
        JSON.stringify(extra_data || {}),
        false
      ];
    }

    const result = await pool.query(query, finalValues);

    // الرد بناءً على نوع الواجهة
    return res.status(200).json({ 
      success: true, 
      id: result.rows[0].id, 
      scheduled_at: finalDate,
      message: note !== undefined ? "تمت جدولة التذكير بنجاح" : "تمت جدولة التذكير قبل الموعد بيومين"
    });

  } catch (error) {
    console.error('❌ Database Error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
}
