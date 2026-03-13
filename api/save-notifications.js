import pkg from 'pg';
const { Pool } = pkg;

const dbUrl = new URL(process.env.DATABASE_URL);

const pool = new Pool({
  host: dbUrl.hostname,
  port: dbUrl.port,
  user: dbUrl.username,
  password: dbUrl.password,
  database: dbUrl.pathname.split('/')[1],
  ssl: { rejectUnauthorized: false },
  max: 1, 
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  let { 
    fcmToken, user_id, category, title, body, 
    scheduled_for, startDate, endDate,
    milk_amount, baby_status, latitude, longitude // بيانات جديدة للموقع والرضاعة
  } = req.body;

  try {
    const finalStartDate = startDate ? new Date(startDate) : new Date();
    const finalEndDate = endDate ? new Date(endDate) : null;
    const isSentStatus = false; 

    // استعلام الإدخال الموحد (أضفنا الموقع والبيانات الإضافية)
    const query = `
      INSERT INTO notifications (
        user_id, fcm_token, category, title, body, is_sent, 
        scheduled_for, period_start_date, period_end_date, 
        location, extra_data
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 
              ST_SetSRID(ST_MakePoint($10, $11), 4326), $12) 
      RETURNING id
    `;

    const commonData = {
      user: isNaN(parseInt(user_id)) ? 1 : parseInt(user_id),
      loc_lng: longitude || 0,
      loc_lat: latitude || 0,
      extra: JSON.stringify({ milk_amount, baby_status })
    };

    // --- 1. حالة متابعة الحمل (9 أشهر) ---
    if (category === 'pregnancy_followup') {
      let insertedIds = [];
      for (let i = 0; i < 9; i++) {
        const monthlySchedule = new Date(finalStartDate);
        monthlySchedule.setMonth(monthlySchedule.getMonth() + i);
        const values = [commonData.user, fcmToken, category, `${title} - الشهر ${i + 1}`, body, isSentStatus, monthlySchedule, finalStartDate, finalEndDate, commonData.loc_lng, commonData.loc_lat, commonData.extra];
        const resDb = await pool.query(query, values);
        insertedIds.push(resDb.rows[0].id);
      }
      return res.status(200).json({ success: true, db_ids: insertedIds, message: "تمت جدولة 9 أشهر حمل" });

    // --- 2. حالة الرضاعة (تكرار يومي ذكي) ---
    } else if (category === 'breastfeeding') {
      let insertedIds = [];
      const intervals = [3, 7, 11, 15, 19]; // توزيع 5 رضعات على ساعات اليوم (كل 4 ساعات تقريباً)
      
      for (let hour of intervals) {
        const dailySchedule = new Date();
        dailySchedule.setHours(hour, 0, 0, 0); // ضبط الساعات المحددة لكل يوم
        
        const values = [commonData.user, fcmToken, category, "حان وقت الرضاعة 🍼", `بناءً على كمية حليب ${milk_amount} مل، طفلك يحتاج رضعة الآن`, isSentStatus, dailySchedule, finalStartDate, finalEndDate, commonData.loc_lng, commonData.loc_lat, commonData.extra];
        const resDb = await pool.query(query, values);
        insertedIds.push(resDb.rows[0].id);
      }
      return res.status(200).json({ success: true, db_ids: insertedIds, message: "تم تثبيت جدول الرضاعة اليومي" });

    // --- 3. الإجراء الطبيعي للفئات الأخرى ---
    } else {
      const finalScheduledFor = scheduled_for ? new Date(scheduled_for) : finalStartDate;
      const values = [commonData.user, fcmToken, category || 'general', title, body, isSentStatus, finalScheduledFor, finalStartDate, finalEndDate, commonData.loc_lng, commonData.loc_lat, commonData.extra];
      const result = await pool.query(query, values);
      return res.status(200).json({ success: true, db_id: result.rows[0].id });
    }

  } catch (error) {
    console.error('❌ Neon Insertion Error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
}
