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
    milk_amount, baby_status, latitude, longitude,
    next_appointment, current_visit_date 
  } = req.body;

  try {
    const finalStartDate = startDate ? new Date(startDate) : new Date();
    const finalEndDate = endDate ? new Date(endDate) : null;
    const isSentStatus = false; 

    // --- هندلة مسميات التصنيفات (Category Mapping) طبقا للجدول الموحد ---
    const categoryMapping = {
      'marriage_consultancy': 'intimacy',
      'menstrual_cycle': 'period',
      'pregnancy_tracking': 'pregnancy',
      'breastfeeding_tracking': 'nursing',
      'child_care': 'motherhood',
      'medical_followup': 'medical',
      'mental_health': 'mood',
      'religious_guidance': 'fiqh',
      'physical_fitness': 'fitness'
    };

    // تحديث التصنيف إذا كان موجوداً في الخريطة، وإلا الإبقاء على القادم كما هو
    const finalCategory = categoryMapping[category] || category || 'general';

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
      extra: JSON.stringify({ milk_amount, baby_status, next_appointment, current_visit_date })
    };

    // --- 1. حالة متابعة الطبيب ---
    if (finalCategory === 'doctor_visit' || finalCategory === 'medical') {
      const visitDate = current_visit_date ? new Date(current_visit_date) : new Date();
      const nextDate = next_appointment ? new Date(next_appointment) : null;

      const values = [
        commonData.user, fcmToken, finalCategory, 
        "موعد الاستشارة القادم 🩺", 
        `تذكير: لديكِ موعد طبي محدد بناءً على زيارتك السابقة بتاريخ ${visitDate.toLocaleDateString()}.`, 
        isSentStatus, nextDate, visitDate, nextDate, 
        commonData.loc_lng, commonData.loc_lat, commonData.extra
      ];

      const resDb = await pool.query(query, values);
      return res.status(200).json({ success: true, db_id: resDb.rows[0].id, message: "تمت جدولة موعد الطبيب بنجاح" });

    // --- 2. حالة الرضاعة (Mapping: nursing) ---
    } else if (finalCategory === 'breastfeeding' || finalCategory === 'nursing') {
      let insertedIds = [];
      const baseTime = scheduled_for ? new Date(scheduled_for) : new Date();

      for (let i = 0; i < 3; i++) {
        const breastfeedingTime = new Date(baseTime);
        breastfeedingTime.setHours(baseTime.getHours() + (i * 4)); 
        
        const values = [
          commonData.user, fcmToken, finalCategory, 
          "تذكير بمعدل الرضاعة الطبيعي 🍼", 
          `موعد الرضعة المقترح رقم ${i+1}. حافظي على معدل 8-12 رضعة يومياً.`, 
          isSentStatus, breastfeedingTime, finalStartDate, finalEndDate, 
          commonData.loc_lng, commonData.loc_lat, commonData.extra
        ];
        
        const resDb = await pool.query(query, values);
        insertedIds.push(resDb.rows[0].id);
      }
      return res.status(200).json({ success: true, db_ids: insertedIds, message: "تم تسجيل 3 مواعيد رضاعة" });

    // --- 3. حالة متابعة الحمل (Mapping: pregnancy) ---
    } else if (finalCategory === 'pregnancy_followup' || finalCategory === 'pregnancy') {
      let insertedIds = [];
      const today = new Date();
      const dueDate = finalEndDate ? new Date(finalEndDate) : new Date(today.getTime() + 280 * 24 * 60 * 60 * 1000);

      const monthsRemaining = (dueDate.getFullYear() - today.getFullYear()) * 12 + (dueDate.getMonth() - today.getMonth());
      const currentStartMonth = Math.max(1, 9 - monthsRemaining);

      for (let i = 0; i <= monthsRemaining; i++) {
        const displayMonth = currentStartMonth + i;
        if (displayMonth > 9) break;

        const monthlySchedule = new Date(today);
        monthlySchedule.setMonth(today.getMonth() + i);

        const values = [
          commonData.user, fcmToken, finalCategory, 
          `${title} - الشهر ${displayMonth}`, 
          body, isSentStatus, monthlySchedule, 
          finalStartDate, finalEndDate, 
          commonData.loc_lng, commonData.loc_lat, commonData.extra
        ];

        const resDb = await pool.query(query, values);
        insertedIds.push(resDb.rows[0].id);
      }
      return res.status(200).json({ success: true, db_ids: insertedIds, message: "تمت جدولة الحمل" });

    // --- 4. النشاطات الأسبوعية ---
    } else if (finalCategory === 'weekly_lifestyle' || finalCategory === 'wellness_tracking' || finalCategory === 'fitness') {
      let insertedIds = [];
      for (let i = 1; i <= 8; i++) {
        const weeklySchedule = new Date(finalStartDate);
        weeklySchedule.setDate(weeklySchedule.getDate() + (i * 7));

        const values = [
          commonData.user, fcmToken, finalCategory, 
          `${title} - مراجعة أسبوعية`, 
          `حان وقت تحديث بيانات ${title} للحفاظ على تقدمك ✨`, 
          isSentStatus, weeklySchedule, 
          finalStartDate, null, 
          commonData.loc_lng, commonData.loc_lat, commonData.extra
        ];
        const resDb = await pool.query(query, values);
        insertedIds.push(resDb.rows[0].id);
      }
      return res.status(200).json({ success: true, db_ids: insertedIds, message: "تمت جدولة التذكيرات الأسبوعية" });

    } else {
      // الحالة العامة (تشمل الـ Mapping الجديد مثل intimacy, mood, fiqh)
      const finalScheduledFor = scheduled_for ? new Date(scheduled_for) : finalStartDate;
      const values = [commonData.user, fcmToken, finalCategory, title, body, isSentStatus, finalScheduledFor, finalStartDate, finalEndDate, commonData.loc_lng, commonData.loc_lat, commonData.extra];
      const result = await pool.query(query, values);
      return res.status(200).json({ success: true, db_id: result.rows[0].id });
    }

  } catch (error) {
    console.error('❌ Neon Insertion Error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
}
