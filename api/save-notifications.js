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

// دالة سحرية لتحويل أي شكل تاريخ قادم من الواجهة إلى صيغة يفهمها كود السيرفر
const universalDateParser = (dateVal) => {
  if (!dateVal) return null;
  
  // 1. تنظيف النص من الأرقام العربية وتحويل "/" إلى "-"
  let cleanDate = String(dateVal)
    .replace(/[٠-٩]/g, d => "٠١٢٣٤٥٦٧٨٩".indexOf(d)) 
    .replace(/\//g, '-')
    .trim();

  // 2. محاولة التحويل
  let d = new Date(cleanDate);

  // 3. إذا فشل التحويل (بسبب تنسيق DD-MM-YYYY مثلاً)، نقوم بإعادة ترتيبه
  if (isNaN(d.getTime())) {
    const parts = cleanDate.split('-');
    if (parts.length === 3) {
      // إذا كان العام في الآخر (DD-MM-YYYY)
      if (parts[2].length === 4) {
        d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
      } 
      // إذا كان العام في الأول (YYYY-MM-DD)
      else if (parts[0].length === 4) {
        d = new Date(`${parts[0]}-${parts[1]}-${parts[2]}`);
      }
    }
  }

  return isNaN(d.getTime()) ? null : d;
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const { 
    category, user_id, fcmToken, title, body, extra_data,
    expected_due_date, // دالة الولادة
    next_period_date,  // دالة الحيض الجديدة
    next_appointment   // دالة الطبيب الجديدة
  } = req.body;

  try {
    let finalScheduledFor = null;

    // الفحص بالترتيب حسب الأولوية والقيم المباشرة التي أضفتها في الواجهة
    if (expected_due_date) {
      finalScheduledFor = universalDateParser(expected_due_date);
    } 
    else if (next_period_date) {
      finalScheduledFor = universalDateParser(next_period_date);
    } 
    else if (next_appointment) {
      finalScheduledFor = universalDateParser(next_appointment);
    }
    // فحص الاحتياط داخل extra_data
    else if (extra_data?.next_period_date || extra_data?.next_appointment) {
      finalScheduledFor = universalDateParser(extra_data.next_period_date || extra_data.next_appointment);
    }

    // تجهيز التاريخ بصيغة ISO لقاعدة البيانات أو تركه null
    const dbDate = finalScheduledFor ? finalScheduledFor.toISOString() : null;

    const query = `
      INSERT INTO notifications (
        user_id, fcm_token, category, title, body, is_sent, 
        scheduled_for, extra_data
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `;

    const values = [
      parseInt(user_id) || 1,
      fcmToken || null,
      category || 'عام',
      title || '',
      body || '',
      false,
      dbDate, // سيتم تخزين التاريخ المستخرج أو null (لن يخزن تاريخ اليوم)
      JSON.stringify({
        ...(extra_data || {}),
        captured_via: "direct_frontend_vars_v5"
      })
    ];

    const result = await pool.query(query, values);

    return res.status(200).json({ 
      success: true, 
      db_id: result.rows[0].id,
      saved_date: dbDate // هذا ما سيؤكد لك نجاح الحفظ في شاشة الاختبار
    });

  } catch (error) {
    console.error('API Error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
}
