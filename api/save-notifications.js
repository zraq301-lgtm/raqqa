import pkg from 'pg';
const { Pool } = pkg;

const dbUrl = new URL(process.env.DATABASE_URL);
const pool = new Pool({
  host: dbUrl.hostname, port: dbUrl.port,
  user: dbUrl.username, password: dbUrl.password,
  database: dbUrl.pathname.split('/')[1],
  ssl: { rejectUnauthorized: false },
  max: 1, connectionTimeoutMillis: 5000, idleTimeoutMillis: 30000
});

// دالة ذكية تستخرج التاريخ من وسط أي نص (مثل الصورة)
const extractDateFromText = (text) => {
  if (!text) return null;
  
  // تنظيف الأرقام العربية وتحويلها لإنجليزية ليفهمها السيرفر
  let cleanText = text.replace(/[٠-٩]/g, d => "٠١٢٣٤٥٦٧٨٩".indexOf(d));

  // البحث عن نمط التاريخ (YYYY-MM-DD أو YYYY/MM/DD)
  const datePattern = /(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})/;
  const match = cleanText.match(datePattern);

  if (match) {
    const d = new Date(`${match[1]}-${match[2]}-${match[3]}`);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  let { 
    body, title, category, user_id, fcmToken, extra_data,
    expected_due_date, next_period_date, next_appointment 
  } = req.body;

  try {
    let finalScheduledFor = null;

    // 1. المحاولة الأولى: الاستخراج المباشر من النص (الحل الذي اقترحته أنتِ)
    // الكود سيبحث داخل الـ body والـ title عن أي تاريخ مكتوب
    finalScheduledFor = extractDateFromText(body) || extractDateFromText(title);

    // 2. المحاولة الثانية: إذا لم يجد في النص، يبحث في المتغيرات (مثل الولادة)
    if (!finalScheduledFor) {
      const fallbackDate = expected_due_date || next_period_date || next_appointment || extra_data?.next_period_date;
      if (fallbackDate) {
        finalScheduledFor = new Date(String(fallbackDate).replace(/\//g, '-'));
      }
    }

    // تأكيد صحة التاريخ النهائي
    const saveDate = (finalScheduledFor && !isNaN(finalScheduledFor.getTime())) 
                     ? finalScheduledFor.toISOString() 
                     : null;

    const query = `
      INSERT INTO notifications (user_id, fcm_token, category, title, body, scheduled_for, extra_data, is_sent)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `;

    const values = [
      parseInt(user_id) || 1,
      fcmToken || null,
      category || 'عام',
      title || '',
      body || '',
      saveDate, 
      JSON.stringify(extra_data || {}),
      false
    ];

    const result = await pool.query(query, values);

    return res.status(200).json({ 
      success: true, 
      db_id: result.rows[0].id,
      extracted_date: saveDate,
      note: "تم سحب التاريخ من النص بنجاح" 
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
}
