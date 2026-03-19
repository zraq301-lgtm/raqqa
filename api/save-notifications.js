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

// دالة إجبارية لتحويل أي نص قادم من الواجهة إلى تاريخ صالح Node.js يفهمه
const forceParseDate = (dateVal) => {
  if (!dateVal) return null;
  try {
    // إذا كان التاريخ يحتوي على / (مثل 2026/03/20) نحوله إلى -
    let sanitized = String(dateVal).replace(/\//g, '-').trim();
    let d = new Date(sanitized);
    // إذا فشل التحويل العادي، نحاول استخراج الأرقام فقط
    if (isNaN(d.getTime())) {
      const match = sanitized.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
      if (match) d = new Date(match[1], match[2] - 1, match[3]);
    }
    return isNaN(d.getTime()) ? null : d;
  } catch (e) { return null; }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  let { 
    category, user_id, fcmToken, title, body, 
    extra_data, scheduled_for, startDate,
    expected_due_date, 
    next_period_date,  
    next_appointment   
  } = req.body;

  try {
    let finalScheduledFor = null;

    // --- 1. قسم موعد الولادة (الناجح تماماً) ---
    if (expected_due_date || extra_data?.expected_due_date) {
      finalScheduledFor = forceParseDate(expected_due_date || extra_data.expected_due_date);
    }

    // --- 2. قسم تاريخ الحيض المتوقع (إجبار الاستخراج من MenstrualTracker) ---
    else if (next_period_date || extra_data?.next_period_date) {
      finalScheduledFor = forceParseDate(next_period_date || extra_data.next_period_date);
    }

    // --- 3. قسم موعد الطبيب (إجبار الاستخراج من DoctorClinical) ---
    else if (next_appointment || extra_data?.next_appointment) {
      finalScheduledFor = forceParseDate(next_appointment || extra_data.next_appointment);
    }

    // --- 4. باقي الأقسام العادية (تطوير، صحة، إلخ) ---
    else if (scheduled_for || startDate) {
      finalScheduledFor = forceParseDate(scheduled_for || startDate);
    }

    // --- قفل الأمان: إذا لم يأتِ تاريخ من الواجهة، لا تحفظ تاريخ اليوم (اتركه Null) ---
    // هذا يمنع تسجيل "تاريخ اليوم" بشكل تلقائي إذا فشلت الدوال
    if (!finalScheduledFor) {
        // نترك الحقل فارغاً في قاعدة البيانات كما طلبت
    }

    const query = `
      INSERT INTO notifications (
        user_id, fcm_token, category, title, body, is_sent, 
        scheduled_for, extra_data
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `;

    const finalExtra = JSON.stringify({
      ...(typeof extra_data === 'object' ? extra_data : {}),
      next_appointment,
      expected_due_date,
      next_period_date,
      debug_received_date: next_period_date || next_appointment || "none"
    });

    const values = [
      parseInt(user_id) || 1,
      fcmToken || null,
      category || 'عام',
      title || 'تنبيه',
      body || '',
      false,
      finalScheduledFor, 
      finalExtra
    ];

    const result = await pool.query(query, values);

    return res.status(200).json({ 
      success: true, 
      db_id: result.rows[0].id,
      captured_date: finalScheduledFor 
    });

  } catch (error) {
    console.error('❌ Sync Error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
}
