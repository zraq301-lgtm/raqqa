import pkg from 'pg';
const { Pool } = pkg;

const dbUrl = new URL(process.env.DATABASE_URL);

const pool = new Pool({
  host: dbUrl.hostname,
  port: dbUrl.port,
  user: dbUrl.username,
  password: dbUrl.password,
  database: dbUrl.pathname.split('/')[1],
  ssl: { 
    rejectUnauthorized: false 
  },
  max: 1, 
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  let { 
    fcmToken, 
    user_id, 
    category, 
    title, 
    body, 
    scheduled_for, 
    startDate, 
    endDate 
  } = req.body;

  try {
    const finalStartDate = startDate ? new Date(startDate) : new Date();
    const finalEndDate = endDate ? new Date(endDate) : null;
    const isSentStatus = false; 

    const query = `
      INSERT INTO notifications (
        user_id, 
        fcm_token, 
        category, 
        title, 
        body, 
        is_sent, 
        scheduled_for, 
        period_start_date, 
        period_end_date
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
      RETURNING id
    `;

    // --- ميزة جدولة الحمل (جديد) ---
    if (category === 'pregnancy_followup') {
      let insertedIds = [];
      // جدولة 9 إشعارات، واحد لكل شهر
      for (let i = 0; i < 9; i++) {
        const monthlySchedule = new Date(finalStartDate);
        monthlySchedule.setMonth(monthlySchedule.getMonth() + i);

        const values = [
          isNaN(parseInt(user_id)) ? 1 : parseInt(user_id),
          fcmToken || null,
          category,
          `${title} - الشهر ${i + 1}`, // إضافة رقم الشهر للعنوان
          body || '',
          isSentStatus,
          monthlySchedule, // تاريخ الشهر القادم
          finalStartDate,
          finalEndDate
        ];
        const resDb = await pool.query(query, values);
        insertedIds.push(resDb.rows[0].id);
      }

      return res.status(200).json({ 
        success: true, 
        db_ids: insertedIds,
        message: "تم جدولة 9 أشهر من متابعة الحمل بنجاح"
      });

    } else {
      // --- الإجراء الطبيعي للفئات الأخرى (مثل الدورة أو العام) ---
      const finalScheduledFor = scheduled_for ? new Date(scheduled_for) : finalStartDate;
      const values = [
        isNaN(parseInt(user_id)) ? 1 : parseInt(user_id),
        fcmToken || null,
        category || 'general',
        title || 'تحديث من رقة',
        body || '',
        isSentStatus,
        finalScheduledFor,
        finalStartDate,
        finalEndDate
      ];

      const result = await pool.query(query, values);

      return res.status(200).json({ 
        success: true, 
        db_id: result.rows[0].id,
        message: "تم الحفظ بنجاح والحالة FALSE لانتظار معالجة منصة Make"
      });
    }

  } catch (error) {
    console.error('❌ Neon Insertion Error:', error.message);
    return res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
}
