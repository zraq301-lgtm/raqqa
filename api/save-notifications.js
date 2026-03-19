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

  // استخراج البيانات كما تُرسل من الواجهة
  let { 
    category, user_id, fcmToken, title, body, 
    extra_data, scheduled_for, startDate,
    expected_due_date, // تاريخ الولادة (الذي نجح معك)
    next_period_date,  // تاريخ الحيض المتوقع
    next_appointment   // موعد الطبيب
  } = req.body;

  try {
    let finalScheduledFor = null;

    // --- 1. قسم موعد الولادة (لم يتم تغيير أي شيء - كما نجح معك) ---
    if (expected_due_date || (extra_data && extra_data.expected_due_date)) {
      const pDate = expected_due_date || extra_data.expected_due_date;
      finalScheduledFor = new Date(pDate);
    }

    // --- 2. قسم تاريخ الحيض المتوقع (تعديل بناءً على MenstrualTracker.jsx) ---
    else if (next_period_date || (extra_data && extra_data.next_period_date)) {
      const pDate = next_period_date || extra_data.next_period_date;
      // استبدال "/" بـ "-" لضمان قبول الصيغة في JavaScript Date
      const formattedDate = typeof pDate === 'string' ? pDate.replace(/\//g, '-') : pDate;
      finalScheduledFor = new Date(formattedDate);
    }

    // --- 3. قسم موعد الطبيب (تعديل بناءً على DoctorClinical.jsx) ---
    else if (next_appointment || (extra_data && extra_data.next_appointment)) {
      const dDate = next_appointment || extra_data.next_appointment;
      finalScheduledFor = new Date(dDate);
    }

    // --- 4. باقي الأقسام العادية ---
    else if (scheduled_for || startDate) {
      finalScheduledFor = new Date(scheduled_for || startDate);
    }

    // التحقق من صحة التاريخ لضمان عدم حفظ قيم خاطئة
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

    // تجميع البيانات الإضافية للحفظ في عمود JSON
    const finalExtra = JSON.stringify({
      ...(typeof extra_data === 'object' ? extra_data : {}),
      next_appointment,
      expected_due_date,
      next_period_date,
      source_api: "v3_fixed_dates"
    });

    const values = [
      parseInt(user_id) || 1,
      fcmToken || null,
      category || 'عام',
      title || 'تنبيه',
      body || '',
      false,
      finalScheduledFor, // التاريخ المستهدف للحفظ
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
