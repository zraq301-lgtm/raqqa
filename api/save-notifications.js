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
    fcmToken, user_id, category, 
    scheduled_for, startDate, endDate,
    milk_amount, baby_status, latitude, longitude,
    next_appointment, current_visit_date 
  } = req.body;

  try {
    const finalStartDate = startDate ? new Date(startDate) : new Date();
    const finalEndDate = endDate ? new Date(endDate) : null;
    const isSentStatus = false; 

    // --- قاموس النصوص الجديد (Content Dictionary) ---
    const contentMap = {
      'period': { t: "رقة تذكركِ 🌸", b: "سيدتي، اقترب موعد أيامكِ الهادئة.. كوني مستعدة لتدليل نفسكِ رعايةً وراحة." },
      'pregnancy': { t: "رحلة الأمومة ✨", b: "تذكير رقيق لمتابعة نمو جنينكِ.. رقة معكِ في كل خطوة من هذه الرحلة." },
      'nursing': { t: "لحظات الارتباط 🤱", b: "وقت الرضاعة هو وقت الحب؛ تأكدي من شرب المياه والحصول على قسط من الراحة." },
      'motherhood': { t: "أنتِ أم رائعة 💖", b: "تذكير بمهمة طفلكِ القادمة.. اهتمامكِ يصنع مستقبله، ورقة تهتم بكِ." },
      'medical': { t: "موعدكِ الطبي 🩺", b: "حفاظاً على صحتكِ، نذكركِ بموعد الاستشارة الطبية اليوم. دمتِ بخير." },
      'mood': { t: "رقة تهتم بقلبكِ ✨", b: "كيف حالكِ اليوم؟ خذي نفساً عميقاً، وتذكري أن مشاعركِ دائماً محل تقدير." },
      'fiqh': { t: "رفيقتكِ الفقهية 📖", b: "تذكير بالأحكام الخاصة بدورتكِ الحالية؛ لتمارسي عباداتكِ بطمأنينة ويقين." },
      'fitness': { t: "وقت النشاط 🏃‍♀️", b: "حركتكِ اليوم هي استثمار في صحتكِ.. تمرين بسيط سيجعلكِ تشعرين بالانتعاش." },
      'intimacy': { t: "لحظات الود ❤️", b: "تذكير بتعزيز التواصل والود مع شريك حياتكِ.. رقة تتمنى لكِ حياة مليئة بالحب." }
    };

    // --- خريطة التحويل من مسميات الواجهة إلى المسميات المرتبطة ---
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

    const finalCategory = categoryMapping[category] || category || 'general';
    const content = contentMap[finalCategory] || { t: "تنبيه من رقة", b: "لديكِ إشعار جديد يهمكِ." };

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

    // --- 1. حالة الطبيب (Medical) ---
    if (finalCategory === 'medical') {
      const nextDate = next_appointment ? new Date(next_appointment) : (scheduled_for ? new Date(scheduled_for) : new Date());
      const values = [commonData.user, fcmToken, finalCategory, content.t, content.b, isSentStatus, nextDate, finalStartDate, finalEndDate, commonData.loc_lng, commonData.loc_lat, commonData.extra];
      const resDb = await pool.query(query, values);
      return res.status(200).json({ success: true, db_id: resDb.rows[0].id });

    // --- 2. حالة الرضاعة (Nursing) ---
    } else if (finalCategory === 'nursing') {
      let insertedIds = [];
      const baseTime = scheduled_for ? new Date(scheduled_for) : new Date();
      for (let i = 0; i < 3; i++) {
        const breastfeedingTime = new Date(baseTime);
        breastfeedingTime.setHours(baseTime.getHours() + (i * 4)); 
        const values = [commonData.user, fcmToken, finalCategory, content.t, `${content.b} (موعد رقم ${i+1})`, isSentStatus, breastfeedingTime, finalStartDate, finalEndDate, commonData.loc_lng, commonData.loc_lat, commonData.extra];
        const resDb = await pool.query(query, values);
        insertedIds.push(resDb.rows[0].id);
      }
      return res.status(200).json({ success: true, db_ids: insertedIds });

    // --- 3. حالة الحمل (Pregnancy) ---
    } else if (finalCategory === 'pregnancy') {
      let insertedIds = [];
      const today = new Date();
      for (let i = 0; i < 3; i++) { // جدولة لـ 3 أشهر القادمة كمثال
        const monthlySchedule = new Date(today);
        monthlySchedule.setMonth(today.getMonth() + i);
        const values = [commonData.user, fcmToken, finalCategory, `${content.t} - متابعة`, content.b, isSentStatus, monthlySchedule, finalStartDate, finalEndDate, commonData.loc_lng, commonData.loc_lat, commonData.extra];
        const resDb = await pool.query(query, values);
        insertedIds.push(resDb.rows[0].id);
      }
      return res.status(200).json({ success: true, db_ids: insertedIds });

    // --- 4. الحالات العامة (Mood, Fiqh, Fitness, Intimacy, Period, Motherhood) ---
    } else {
      const finalScheduledFor = scheduled_for ? new Date(scheduled_for) : finalStartDate;
      const values = [commonData.user, fcmToken, finalCategory, content.t, content.b, isSentStatus, finalScheduledFor, finalStartDate, finalEndDate, commonData.loc_lng, commonData.loc_lat, commonData.extra];
      const result = await pool.query(query, values);
      return res.status(200).json({ success: true, db_id: result.rows[0].id });
    }

  } catch (error) {
    console.error('❌ Database Error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
}
