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
    next_appointment, current_visit_date,
    expected_due_date,
    period_duration, cycle_length 
  } = req.body;

  try {
    const finalStartDate = startDate ? new Date(startDate) : new Date();
    const finalEndDate = endDate ? new Date(endDate) : null;
    const isSentStatus = false; 

    const categoryMapping = {
      'menstrual_cycle': 'period',
      'pregnancy_tracking': 'pregnancy',
      'breastfeeding_tracking': 'breastfeeding',
      'child_care': 'motherhood',
      'medical_followup': 'medical',
      'mental_health': 'mood',
      'religious_guidance': 'fiqh',
      'physical_fitness': 'fitness',
      'marriage_consultancy': 'intimacy'
    };

    const finalCategory = categoryMapping[category] || category || 'general';

    // --- منطق الحساب القمري والدورة ---
    let nextPeriodDate = null;
    let fertilityStart = null;
    let fertilityEnd = null;

    if (finalCategory === 'period') {
      // إذا لم يرسل المستخدم طول الدورة، نفترض 29 يومًا (الشهر القمري)
      const cycleDays = parseInt(cycle_length) || 29; 
      
      // حساب الموعد القادم: تاريخ البدء + طول الدورة
      nextPeriodDate = new Date(finalStartDate);
      nextPeriodDate.setDate(finalStartDate.getDate() + cycleDays);

      // حساب فترة الخصوبة بناءً على الدورة القمرية
      fertilityStart = new Date(finalStartDate);
      fertilityStart.setDate(finalStartDate.getDate() + (cycleDays - 18));
      fertilityEnd = new Date(finalStartDate);
      fertilityEnd.setDate(finalStartDate.getDate() + (cycleDays - 11));
    }

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

    // تنسيق التاريخ للتقويم القمري/الهجري ليظهر في نص الإشعار
    const lunarFormatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
      day: 'numeric', month: 'long', year: 'numeric'
    });

    const commonData = {
      user: isNaN(parseInt(user_id)) ? 1 : parseInt(user_id),
      loc_lng: longitude || 0,
      loc_lat: latitude || 0,
      extra: JSON.stringify({ 
        milk_amount, baby_status, next_appointment, current_visit_date, 
        expected_due_date, 
        next_period_date: nextPeriodDate,
        lunar_next_period: nextPeriodDate ? lunarFormatter.format(nextPeriodDate) : null,
        fertility_start: fertilityStart, 
        fertility_end: fertilityEnd,
        period_duration: period_duration || 7, 
        cycle_length: cycle_length || 29
      })
    };

    let finalTitle = title;
    let finalBody = body;
    let customSchedule = scheduled_for ? new Date(scheduled_for) : finalStartDate;

    if (finalCategory === 'breastfeeding') {
      let insertedIds = [];
      for (let i = 0; i < 3; i++) {
        const breastfeedingTime = new Date(customSchedule);
        breastfeedingTime.setHours(customSchedule.getHours() + (i * 4)); 
        const values = [commonData.user, fcmToken, 'breastfeeding', "لحظات الارتباط 🤱", `وقت الرضاعة رقم ${i+1}. رقة تهتم بكِ.`, isSentStatus, breastfeedingTime, finalStartDate, finalEndDate, commonData.loc_lng, commonData.loc_lat, commonData.extra];
        const resDb = await pool.query(query, values);
        insertedIds.push(resDb.rows[0].id);
      }
      return res.status(200).json({ success: true, db_ids: insertedIds });
    }

    else if (finalCategory === 'period') {
      finalTitle = "رقة تذكركِ 🌸";
      const lunarDateText = nextPeriodDate ? lunarFormatter.format(nextPeriodDate) : "";
      finalBody = `موعد دورتكِ القادمة حسب التقويم القمري هو ${lunarDateText}. كوني مستعدة لتدليل نفسكِ.`;
      customSchedule = nextPeriodDate || customSchedule;
    }

    else if (finalCategory === 'pregnancy') {
      if (expected_due_date) {
        const today = new Date();
        const dueDate = new Date(expected_due_date);
        let monthsRemaining = (dueDate.getFullYear() - today.getFullYear()) * 12 + (dueDate.getMonth() - today.getMonth());
        
        if (monthsRemaining > 0) {
          let insertedIds = [];
          for (let i = 1; i <= monthsRemaining; i++) {
            const scheduledMonth = new Date(today);
            scheduledMonth.setMonth(today.getMonth() + i);
            const values = [commonData.user, fcmToken, 'pregnancy', "رحلة الأمومة ✨", `شهر جديد في رحلتكِ المباركة. رقة تتابع معكِ وبجواركِ.`, isSentStatus, scheduledMonth, finalStartDate, finalEndDate, commonData.loc_lng, commonData.loc_lat, commonData.extra];
            const resDb = await pool.query(query, values);
            insertedIds.push(resDb.rows[0].id);
          }
          return res.status(200).json({ success: true, db_ids: insertedIds });
        }
      }
      finalTitle = "رحلة الأمومة ✨";
    }

    else if (finalCategory === 'medical') { finalTitle = "موعدكِ الطبي 🩺"; customSchedule = next_appointment ? new Date(next_appointment) : customSchedule; }
    else if (finalCategory === 'motherhood') { finalTitle = "أنتِ أم رائعة 💖"; }
    else if (finalCategory === 'mood') { finalTitle = "رقة تهتم بقلبكِ ✨"; }
    else if (finalCategory === 'fiqh') { finalTitle = "رفيقتكِ الفقهية 📖"; }
    else if (finalCategory === 'fitness') { finalTitle = "وقت النشاط 🏃‍♀️"; }
    else if (finalCategory === 'intimacy') { finalTitle = "لحظات الود ❤️"; }

    const values = [
      commonData.user, fcmToken, finalCategory, 
      finalTitle, finalBody, isSentStatus, 
      customSchedule, finalStartDate, finalEndDate, 
      commonData.loc_lng, commonData.loc_lat, commonData.extra
    ];

    const result = await pool.query(query, values);
    return res.status(200).json({ 
      success: true, 
      category_saved: finalCategory, 
      db_id: result.rows[0].id,
      lunar_date: nextPeriodDate ? lunarFormatter.format(nextPeriodDate) : null
    });

  } catch (error) {
    console.error('❌ Neon Error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
}
