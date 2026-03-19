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

// --- 1. دالة استخراج تاريخ الدورة القادمة (من MenstrualTracker) ---
function getMenstrualDate(body, extra) {
  if (extra?.next_period_date) {
    // الملف يرسل التاريخ بتنسيق "YYYY/MM/DD" أو "DD/MM/YYYY" حسب Locale
    const d = new Date(extra.next_period_date.replace(/\//g, '-'));
    return isNaN(d) ? null : d;
  }
  return null;
}

// --- 2. دالة استخراج موعد الولادة المتوقع (من PregnancyMonitor) ---
function getPregnancyDate(body, extra) {
  if (extra?.expected_delivery_date) {
    const d = new Date(extra.expected_delivery_date);
    return isNaN(d) ? null : d;
  }
  return null;
}

// --- 3. دالة استخراج موعد الطبيب (من DoctorClinical) ---
function getDoctorDate(body, extra) {
  // الملف يرسل القيمة في next_appointment أو القيمة المدخلة في الحقول
  const dateValue = extra?.next_appointment || body.next_appointment;
  if (dateValue) {
    const d = new Date(dateValue);
    return isNaN(d) ? null : d;
  }
  return null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const { 
    category, user_id, fcmToken, title, body, 
    scheduled_for, startDate, extra_data 
  } = req.body;

  try {
    let finalScheduledFor = null;

    // --- الربط بين القسم والدالة الخاصة به لضبط التاريخ ---
    if (category === 'menstrual_report' || body?.includes('دورة')) {
      finalScheduledFor = getMenstrualDate(req.body, extra_data);
    } 
    else if (category === 'pregnancy_followup' || extra_data?.expected_delivery_date) {
      finalScheduledFor = getPregnancyDate(req.body, extra_data);
    } 
    else if (category === 'doctor_clinical' || category === 'طبيب') {
      finalScheduledFor = getDoctorDate(req.body, extra_data);
    } 
    else {
      // باقي الأقسام: تأخذ التاريخ القادم من الواجهة مباشرة (scheduled_for أو startDate)
      finalScheduledFor = scheduled_for ? new Date(scheduled_for) : (startDate ? new Date(startDate) : null);
    }

    // إذا لم يتوفر أي تاريخ من الواجهة أو الدوال، لن نقوم بوضع "تاريخ اليوم" (حسب طلبك)
    if (!finalScheduledFor) {
       // يمكنك هنا تركها null أو التعامل معها كخطأ حسب رغبتك
       // سأتركها كما طلبت: "يستلم من الواجهة حصراً"
    }

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
      fcmToken,
      category || 'عام',
      title,
      body,
      false,
      finalScheduledFor, // التاريخ المستخرج من الدالة
      JSON.stringify(extra_data || {})
    ];

    const result = await pool.query(query, values);

    return res.status(200).json({ 
      success: true, 
      db_id: result.rows[0].id,
      saved_date: finalScheduledFor 
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
}
