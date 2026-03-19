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

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  // استخراج البيانات كما تُرسل من الواجهة بالضبط
  let { 
    category, user_id, fcmToken, title, body, 
    extra_data, scheduled_for, startDate 
  } = req.body;

  try {
    let finalScheduledFor = null;

    // --- 1. قسم الدورة (مطابقة لـ MenstrualTracker.jsx) ---
    // الواجهة ترسل: extra_data: { next_period_date: "2026/04/15" }
    if (extra_data?.next_period_date) {
      const dateStr = extra_data.next_period_date.replace(/\//g, '-');
      finalScheduledFor = new Date(dateStr);
    }

    // --- 2. قسم الحمل (مطابقة لـ PregnancyMonitor.jsx) ---
    // الواجهة ترسل: expected_due_date مباشرة في body أو داخل extra_data
    else if (req.body.expected_due_date || extra_data?.expected_due_date) {
      const pDate = req.body.expected_due_date || extra_data?.expected_due_date;
      finalScheduledFor = new Date(pDate);
    }

    // --- 3. قسم الطبيب (مطابقة لـ DoctorClinical.jsx) ---
    // الواجهة ترسل: next_appointment داخل الـ body مباشرة
    else if (req.body.next_appointment) {
      finalScheduledFor = new Date(req.body.next_appointment);
    }

    // --- 4. باقي الأقسام (تطوير، صحة، إلخ) ---
    else if (scheduled_for || startDate) {
      finalScheduledFor = new Date(scheduled_for || startDate);
    }

    // تأكيد أن التاريخ صالح وليس "Invalid Date"
    if (finalScheduledFor && isNaN(finalScheduledFor.getTime())) {
      finalScheduledFor = null;
    }

    const query = `
      INSERT INTO notifications (
        user_id, fcm_token, category, title, body, is_sent, 
        scheduled_for, extra_data
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `;

    // دمج كل البيانات في extra_data للحفظ الشامل
    const combinedExtra = JSON.stringify({
      ...(typeof extra_data === 'object' ? extra_data : {}),
      next_appointment: req.body.next_appointment,
      expected_due_date: req.body.expected_due_date,
      ui_captured_date: finalScheduledFor
    });

    const values = [
      parseInt(user_id) || 1,
      fcmToken || null,
      category || 'عام',
      title || 'تنبيه',
      body || '',
      false,
      finalScheduledFor, // هذا هو التاريخ الذي سيظهر في جدول المواعيد
      combinedExtra
    ];

    const result = await pool.query(query, values);

    return res.status(200).json({ 
      success: true, 
      db_id: result.rows[0].id,
      saved_date: finalScheduledFor 
    });

  } catch (error) {
    console.error('❌ Database Error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
}
