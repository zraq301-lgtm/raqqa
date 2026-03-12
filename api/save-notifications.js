import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL + (process.env.DATABASE_URL.includes('?') ? '&' : '?') + 'sslmode=verify-full',
  ssl: { rejectUnauthorized: false, checkServerIdentity: () => undefined }
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  let { 
    fcmToken, user_id, category, title, body, 
    scheduled_for, startDate, endDate 
  } = req.body;

  try {
    const finalStartDate = startDate ? new Date(startDate) : new Date();
    const finalEndDate = endDate ? new Date(endDate) : null;
    const finalScheduledFor = scheduled_for ? new Date(scheduled_for) : finalStartDate;

    // --- التعديل الجوهري هنا ---
    // جعل الحالة دائماً false لكي تلتقطها منصة Make
    const isSentStatus = false; 

    const query = `
      INSERT INTO notifications (
        user_id, fcm_token, category, title, body, is_sent, 
        scheduled_for, period_start_date, period_end_date
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id
    `;

    const values = [
      isNaN(parseInt(user_id)) ? 1 : parseInt(user_id),
      fcmToken || null,
      category || 'عام',
      title || 'تنبيه من رقة',
      body || '',
      isSentStatus, // ستدخل دائماً FALSE الآن
      finalScheduledFor,
      finalStartDate,
      finalEndDate
    ];

    const result = await pool.query(query, values);

    return res.status(200).json({ 
      success: true, 
      db_id: result.rows[0].id,
      message: "تم الحفظ بنجاح والحالة FALSE لانتظار منصة Make"
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
