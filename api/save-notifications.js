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

// دالة التنظيف النهائية لضمان تحويل التاريخ القادم من الواجهة مهما كان شكله
const parseFrontendDate = (val) => {
  if (!val) return null;
  // تحويل الأرقام العربية إلى إنجليزية إذا وجدت واستبدال / بـ -
  let dStr = String(val)
    .replace(/[٠-٩]/g, d => "٠١٢٣٤٥٦٧٨٩".indexOf(d)) 
    .replace(/\//g, '-')
    .trim();
  
  const d = new Date(dStr);
  return isNaN(d.getTime()) ? null : d;
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  // استلام البيانات (الواجهة ترسل أحياناً البيانات داخل extra_data)
  let { 
    category, user_id, fcmToken, title, body, 
    extra_data, scheduled_for, startDate,
    expected_due_date, next_period_date, next_appointment 
  } = req.body;

  try {
    let finalScheduledFor = null;

    // --- 1. منطق "موعد الولادة" (الناجح تماماً) ---
    if (expected_due_date || extra_data?.expected_due_date) {
      finalScheduledFor = parseFrontendDate(expected_due_date || extra_data.expected_due_date);
    }

    // --- 2. منطق "تاريخ الحيض" (مطابق لدالة calc.nextDate في MenstrualTracker) ---
    else if (next_period_date || extra_data?.next_period_date) {
      // الواجهة ترسلها غالباً داخل extra_data.next_period_date
      finalScheduledFor = parseFrontendDate(next_period_date || extra_data.next_period_date);
    }

    // --- 3. منطق "موعد الطبيب" (مطابق لـ categories.name في DoctorClinical) ---
    else if (next_appointment || extra_data?.next_appointment || category === 'طبيب') {
      // في ملف الطبيب، القيمة قد تأتي في body مباشرة أو داخل extra_data
      finalScheduledFor = parseFrontendDate(next_appointment || extra_data?.next_appointment);
    }

    // --- 4. الحالات العامة ---
    if (!finalScheduledFor && (scheduled_for || startDate)) {
      finalScheduledFor = parseFrontendDate(scheduled_for || startDate);
    }

    // إجبار عدم وضع تاريخ اليوم إذا كانت النتيجة null
    const saveDate = finalScheduledFor ? finalScheduledFor.toISOString() : null;

    const query = `
      INSERT INTO notifications (
        user_id, fcm_token, category, title, body, is_sent, 
        scheduled_for, extra_data
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `;

    // تجميع البيانات الإضافية للتأكد من حفظ الأصل للرجوع إليه
    const finalExtra = JSON.stringify({
      ...(typeof extra_data === 'object' ? extra_data : {}),
      original_next_period: next_period_date || extra_data?.next_period_date,
      original_next_appointment: next_appointment || extra_data?.next_appointment,
      source: "frontend_sync_v4"
    });

    const values = [
      parseInt(user_id) || 1,
      fcmToken || null,
      category || 'عام',
      title || 'تنبيه جديد',
      body || '',
      false,
      saveDate, 
      finalExtra
    ];

    const result = await pool.query(query, values);

    return res.status(200).json({ 
      success: true, 
      db_id: result.rows[0].id,
      applied_date: saveDate 
    });

  } catch (error) {
    console.error('❌ Database Sync Error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
}
