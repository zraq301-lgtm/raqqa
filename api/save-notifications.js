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

    // --- تحديث مسميات التصنيفات (Category Mapping) مع تغيير التمريض للرضاعة ---
    const categoryMapping = {
      'marriage_consultancy': 'intimacy',
      'menstrual_cycle': 'period',
      'pregnancy_tracking': 'pregnancy',
      'breastfeeding_tracking': 'breastfeeding', // تم التعديل هنا
      'child_care': 'motherhood',
      'medical_followup': 'medical',
      'mental_health': 'mood',
      'religious_guidance': 'fiqh',
      'physical_fitness': 'fitness'
    };

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
        "موعد الاستشارة الطبي 🩺", 
        "حفاظاً على صحتكِ، نذكركِ بموعد الاستشارة الطبية اليوم. دمتِ بخير.", 
        isSentStatus, nextDate, visitDate, nextDate, 
        commonData.loc_lng, commonData.loc_lat, commonData.extra
      ];

      const resDb = await pool.query(query, values);
      return res.status(200).json({ success: true, db_id: resDb.rows[0].id, message: "تمت جدولة موعد الطبيب بنجاح" });

    // --- 2. حالة الرضاعة (Updated Message & Category) ---
    } else if (finalCategory === 'breastfeeding') {
      let insertedIds = [];
      const baseTime = scheduled_for ? new Date(scheduled_for) : new Date();

      for (let i = 0; i < 3; i++) {
        const breastfeedingTime = new Date(baseTime);
        breastfeedingTime.setHours(baseTime.getHours() + (i * 4)); 
        
        const values = [
          commonData.user, fcmToken, finalCategory, 
          "لحظات الارتباط 🤱", 
          `وقت الرضاعة هو وقت الحب؛ تذكير برضعة طفلكِ رقم ${i+1}. رقة تهتم بكِ وبطفلكِ.`, 
          isSentStatus, breastfeedingTime, finalStartDate, finalEndDate, 
          commonData.loc_lng, commonData.loc_lat, commonData.extra
        ];
        
        const resDb = await pool.query(query, values);
        insertedIds.push(resDb.rows[0].id);
      }
      return res.status(200).json({ success: true, db_ids: insertedIds, message: "تم تسجيل مواعيد الرضاعة" });

    // --- 3. حالة متابعة الحمل ---
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
          "رحلة الأمومة ✨", 
          `تذكير رقيق لمتابعة نمو جنينكِ في الشهر ${displayMonth}.. رقة معكِ في كل خطوة.`, 
          isSentStatus, monthlySchedule, 
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
          "وقت النشاط 🏃‍♀️", 
          "حركتكِ اليوم هي استثمار في صحتكِ.. تمرين بسيط سيجعلكِ تشعرين بالانتعاش.", 
          isSentStatus, weeklySchedule, 
          finalStartDate, null, 
          commonData.loc_lng, commonData.loc_lat, commonData.extra
        ];
        const resDb = await pool.query(query, values);
        insertedIds.push(resDb.rows[0].id);
      }
      return res.status(200).json({ success: true, db_ids: insertedIds, message: "تمت جدولة التذكيرات الأسبوعية" });

    } else {
      // الحالات الأخرى (mood, fiqh, intimacy, period, motherhood)
      const finalScheduledFor = scheduled_for ? new Date(scheduled_for) : finalStartDate;
      
      // هنا نقوم بضبط العنوان والنص بناءً على التصنيف المتبقي
      let finalTitle = title;
      let finalBody = body;

      if (finalCategory === 'period') { finalTitle = "رقة تذكركِ 🌸"; finalBody = "سيدتي، اقترب موعد أيامكِ الهادئة.. كوني مستعدة لتدليل نفسكِ رعايةً وراحة."; }
      if (finalCategory === 'mood') { finalTitle = "رقة تهتم بقلبكِ ✨"; finalBody = "كيف حالكِ اليوم؟ خذي نفساً عميقاً، وتذكري أن مشاعركِ دائماً محل تقدير."; }
      if (finalCategory === 'fiqh') { finalTitle = "رفيقتكِ الفقهية 📖"; finalBody = "تذكير بالأحكام الخاصة بدورتكِ الحالية؛ لتمارسي عباداتكِ بطمأنينة ويقين."; }
      if (finalCategory === 'intimacy') { finalTitle = "لحظات الود ❤️"; finalBody = "تذكير بتعزيز التواصل والود مع شريك حياتكِ.. رقة تتمنى لكِ حياة مليئة بالحب."; }
      if (finalCategory === 'motherhood') { finalTitle = "أنتِ أم رائعة 💖"; finalBody = "تذكير بمهمة طفلكِ القادمة.. اهتمامكِ يصنع مستقبله، ورقة تهتم بكِ."; }

      const values = [commonData.user, fcmToken, finalCategory, finalTitle, finalBody, isSentStatus, finalScheduledFor, finalStartDate, finalEndDate, commonData.loc_lng, commonData.loc_lat, commonData.extra];
      const result = await pool.query(query, values);
      return res.status(200).json({ success: true, db_id: result.rows[0].id });
    }

  } catch (error) {
    console.error('❌ Database Error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
}
