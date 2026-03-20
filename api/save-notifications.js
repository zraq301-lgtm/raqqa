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

// دالة محسنة لاستخراج التاريخ من النص أو الصيغ المختلفة
const parseAnyDate = (input) => {
  if (!input) return null;
  
  // تحويل الأرقام العربية إلى إنجليزية
  let cleanStr = String(input).replace(/[٠-٩]/g, d => "0123456789"["٠١٢٣٤٥٦٧٨٩".indexOf(d)]);
  
  // محاولة تحويله مباشرة إذا كان بصيغة تاريخ صحيحة
  const directDate = new Date(cleanStr.replace(/\//g, '-'));
  if (!isNaN(directDate.getTime())) return directDate;

  // البحث عن نمط التاريخ (YYYY-MM-DD) داخل النص
  const datePattern = /(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})/;
  const match = cleanStr.match(datePattern);
  if (match) {
    const d = new Date(`${match[1]}-${match[2]}-${match[3]}`);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  // استلام كافة الاحتمالات الممكنة لاسم حقل التاريخ من التطبيق
  let { 
    body, title, category, user_id, fcmToken, extra_data,
    scheduled_for, expected_due_date, next_period_date, next_appointment 
  } = req.body;

  try {
    let finalScheduledFor = null;

    // 1. الأولوية القصوى: إذا تم إرسال تاريخ صريح في أي من هذه الحقول
    const explicitDate = scheduled_for || expected_due_date || next_period_date || next_appointment || extra_data?.scheduled_for;
    finalScheduledFor = parseAnyDate(explicitDate);

    // 2. المحاولة الثانية: إذا لم يجد تاريخاً صريحاً، يبحث داخل نص الرسالة أو العنوان
    if (!finalScheduledFor) {
      finalScheduledFor = parseAnyDate(body) || parseAnyDate(title);
    }

    // تأكيد الصيغة النهائية لقاعدة البيانات (ISO String)
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
      message: saveDate ? "تم حفظ التاريخ بنجاح" : "تم الحفظ بدون تاريخ (لم يتم العثور على تاريخ)" 
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
}
