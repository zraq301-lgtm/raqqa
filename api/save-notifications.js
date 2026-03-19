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

  const { category, user_id, fcmToken, title, body, extra_data } = req.body;
  
  try {
    let finalScheduledDate = new Date(); // افتراضي

    // --- دالة حفظ قسم "الدورة الشهرية" (تاريخ الدورة المتوقع) ---
    if (category === 'menstrual_report') {
      if (extra_data?.next_period_date) {
        const dateParts = extra_data.next_period_date.split('/');
        if (dateParts.length === 3) {
          // التعامل مع تنسيق (سنة/شهر/يوم) القادم من MenstrualTracker [cite: 236, 237]
          finalScheduledDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
        }
      }
    }

    // --- دالة حفظ قسم "متابعة الحمل" (موعد الولادة المتوقع) ---
    else if (category === 'pregnancy_followup') {
      if (extra_data?.expected_delivery_date) {
        // تنظيف النص من الأحرف العربية الزائدة مثل "مارس" وتحويله لتاريخ صالح 
        const parsedDelivery = new Date(extra_data.expected_delivery_date);
        if (!isNaN(parsedDelivery)) finalScheduledDate = parsedDelivery;
      }
    }

    // --- دالة حفظ قسم "طبيب راقي" (موعد الطبيب القادم) ---
    else if (category === 'doctor_clinical') {
      const userScheduledDate = extra_data?.next_appointment;
      if (userScheduledDate) {
        const parsedDate = new Date(userScheduledDate);
        if (!isNaN(parsedDate.getTime())) finalScheduledDate = parsedDate; // [cite: 500, 501]
      }
    }

    // إعداد الاستعلام للحفظ في جدول التنبيهات (Neon)
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
      category, 
      title, 
      body, 
      false, 
      finalScheduledDate.toISOString(), 
      JSON.stringify(extra_data)
    ];

    const result = await pool.query(query, values);

    return res.status(200).json({ 
      success: true, 
      db_id: result.rows[0].id, 
      scheduled_for: finalScheduledDate.toISOString() 
    });

  } catch (error) {
    console.error('❌ Database Sync Error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
}
