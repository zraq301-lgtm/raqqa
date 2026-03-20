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

  // استلام البيانات بنفس مسميات الدوال الجديدة
  let { 
    expected_due_date, 
    next_period_date, 
    next_appointment,
    extra_data,
    category, title, body, user_id, fcmToken
  } = req.body;

  try {
    let finalScheduledFor = null;

    // 1. فحص تاريخ الولادة
    if (expected_due_date) finalScheduledFor = new Date(expected_due_date);
    
    // 2. فحص تاريخ الحيض (إذا لم يوجد ولادة)
    else if (next_period_date) finalScheduledFor = new Date(next_period_date);
    
    // 3. فحص موعد الطبيب
    else if (next_appointment) finalScheduledFor = new Date(next_appointment);
    
    // 4. فحص داخل extra_data (كخطة بديلة)
    else if (extra_data?.next_period_date) finalScheduledFor = new Date(extra_data.next_period_date);
    else if (extra_data?.next_appointment) finalScheduledFor = new Date(extra_data.next_appointment);

    // التحقق من صحة التاريخ
    if (finalScheduledFor && isNaN(finalScheduledFor.getTime())) {
      finalScheduledFor = null;
    }

    // إذا لم ينجح الكود في العثور على تاريخ، سيتم حفظ NULL (لن يضع تاريخ اليوم)
    const query = `
      INSERT INTO notifications (user_id, fcm_token, category, title, body, scheduled_for, extra_data, is_sent)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `;

    const values = [
      parseInt(user_id) || 1,
      fcmToken,
      category || 'عام',
      title,
      body,
      finalScheduledFor, // سيحفظ القيمة المستخرجة أو NULL
      JSON.stringify(extra_data || {}),
      false
    ];

    const result = await pool.query(query, values);

    return res.status(200).json({ 
      success: true, 
      id: result.rows[0].id,
      saved_date: finalScheduledFor 
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
