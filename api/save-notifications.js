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

  // استخراج كل البيانات الممكنة من الطلب
  let { 
    category, user_id, fcmToken, title, body, 
    scheduled_for, startDate, extra_data,
    next_appointment, expected_delivery_date, next_period_date
  } = req.body;

  try {
    let finalScheduledFor = null;

    // --- 1. قسم الدورة الشهرية (MenstrualTracker) ---
    if (category === 'menstrual_report' || next_period_date || (extra_data && extra_data.next_period_date)) {
      const pDate = next_period_date || extra_data?.next_period_date;
      if (pDate) {
        // تنظيف التاريخ من أي تنسيق غريب وتحويله لكائن Date
        finalScheduledFor = new Date(pDate.replace(/\//g, '-'));
      }
    }

    // --- 2. قسم متابعة الحمل (PregnancyMonitor) ---
    else if (category === 'pregnancy_followup' || expected_delivery_date || (extra_data && extra_data.expected_delivery_date)) {
      const pregDate = expected_delivery_date || extra_data?.expected_delivery_date;
      if (pregDate) {
        finalScheduledFor = new Date(pregDate);
      }
    }

    // --- 3. قسم الطبيب (DoctorClinical) ---
    else if (category === 'doctor_clinical' || next_appointment || (extra_data && extra_data.next_appointment)) {
      const docDate = next_appointment || extra_data?.next_appointment;
      if (docDate) {
        finalScheduledFor = new Date(docDate);
      }
    }

    // --- 4. الأقسام العادية (إذا لم يكن مما سبق) ---
    if (!finalScheduledFor) {
      finalScheduledFor = scheduled_for ? new Date(scheduled_for) : (startDate ? new Date(startDate) : null);
    }

    // التحقق من صحة التاريخ المحول
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

    // تجميع البيانات الإضافية للحفظ
    const finalExtraData = JSON.stringify({
      ...(typeof extra_data === 'object' ? extra_data : {}),
      next_appointment,
      expected_delivery_date,
      next_period_date,
      source: "integrated_api_v2"
    });

    const values = [
      parseInt(user_id) || 1,
      fcmToken || null,
      category || 'عام',
      title || 'تنبيه جديد',
      body || '',
      false,
      finalScheduledFor,
      finalExtraData
    ];

    const result = await pool.query(query, values);

    return res.status(200).json({ 
      success: true, 
      db_id: result.rows[0].id,
      applied_date: finalScheduledFor 
    });

  } catch (error) {
    console.error('❌ Sync Error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
}
