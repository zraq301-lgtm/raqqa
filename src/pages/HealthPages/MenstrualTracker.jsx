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
    dueDate // استلام موعد الولادة المتوقع من الواجهة
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
      extra: JSON.stringify({ milk_amount, baby_status, next_appointment, current_visit_date, dueDate })
    };

    let finalTitle = title;
    let finalBody = body;
    let customSchedule = scheduled_for ? new Date(scheduled_for) : finalStartDate;

    // 1. الرضاعة (3 إشعارات كل 4 ساعات)
    if (finalCategory === 'breastfeeding') {
      let insertedIds = [];
      for (let i = 0; i < 3; i++) {
        const breastfeedingTime = new Date(customSchedule);
        breastfeedingTime.setHours(customSchedule.getHours() + (i * 4)); 
        const values = [commonData.user, fcmToken, 'breastfeeding', "لحظات الارتباط 🤱", `وقت الرضاعة هو وقت الحب؛ تذكير برضعة طفلكِ رقم ${i+1}. رقة تهتم بكِ.`, isSentStatus, breastfeedingTime, finalStartDate, finalEndDate, commonData.loc_lng, commonData.loc_lat, commonData.extra];
        const resDb = await pool.query(query, values);
        insertedIds.push(resDb.rows[0].id);
      }
      return res.status(200).json({ success: true, db_ids: insertedIds });
    }

    // 2. الحمل (حساب الأشهر وحفظها في نيون)
    if (finalCategory === 'pregnancy' && dueDate) {
      const start = new Date();
      const end = new Date(dueDate);
      let insertedIds = [];
      
      // حساب فرق الأشهر
      let monthsCount = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
      
      for (let i = 0; i <= monthsCount; i++) {
        const monthlySchedule = new Date(start);
        monthlySchedule.setMonth(start.getMonth() + i);
        
        // التأكد من عدم تجاوز تاريخ الولادة
        if (monthlySchedule <= end) {
          const values = [
            commonData.user, fcmToken, 'pregnancy', 
            "رحلة الأمومة ✨", 
            `تذكير الشهر ${i === 0 ? 'الحالي' : i}: رقة معكِ لمتابعة نمو جنينكِ وتطورات حملكِ.`, 
            isSentStatus, monthlySchedule, finalStartDate, end, 
            commonData.loc_lng, commonData.loc_lat, commonData.extra
          ];
          const resDb = await pool.query(query, values);
          insertedIds.push(resDb.rows[0].id);
        }
      }
      return res.status(200).json({ success: true, message: "Pregnancy schedule created", db_ids: insertedIds });
    }

    // 3. المتابعة الطبية
    if (finalCategory === 'medical') {
      finalTitle = "موعدكِ الطبي 🩺";
      finalBody = "حفاظاً على صحتكِ، نذكركِ بموعد الاستشارة الطبية اليوم. دمتِ بخير.";
      customSchedule = next_appointment ? new Date(next_appointment) : customSchedule;
    } 
    // 4. الدورة الشهرية (منطق التقويم القمري)
    else if (finalCategory === 'period') {
      finalTitle = "رقة تذكركِ 🌸";
      finalBody = "سيدتي، اقترب موعد أيامكِ الهادئة حسب تقويمكِ القمري.. كوني مستعدة لتدليل نفسكِ.";
      // ملاحظة: الحساب القمري يعتمد على الفرق بين الدورة السابقة (29.5 يوم وسطياً)
    }
    // 5. الأمومة
    else if (finalCategory === 'motherhood') {
      finalTitle = "أنتِ أم رائعة 💖";
      finalBody = "تذكير بمهمة طفلكِ القادمة.. اهتمامكِ يصنع مستقبله، ورقة تهتم بكِ.";
    }
    // 6. الحالة النفسية
    else if (finalCategory === 'mood') {
      finalTitle = "رقة تهتم بقلبكِ ✨";
      finalBody = "كيف حالكِ اليوم؟ خذي نفساً عميقاً، وتذكري أن مشاعركِ دائماً محل تقدير.";
    }
    // 7. الفقه
    else if (finalCategory === 'fiqh') {
      finalTitle = "رفيقتكِ الفقهية 📖";
      finalBody = "تذكير بالأحكام الخاصة بدورتكِ الحالية؛ لتمارسي عباداتكِ بطمأنينة ويقين.";
    }
    // 8. الرياضة
    else if (finalCategory === 'fitness') {
      finalTitle = "وقت النشاط 🏃‍♀️";
      finalBody = "حركتكِ اليوم هي استثمار في صحتكِ.. تمرين بسيط سيجعلكِ تشعرين بالانتعاش.";
    }
    // 9. العلاقة الزوجية
    else if (finalCategory === 'intimacy') {
      finalTitle = "لحظات الود ❤️";
      finalBody = "تذكير بتعزيز التواصل والود مع شريك حياتكِ.. رقة تتمنى لكِ حياة مليئة بالحب.";
    }

    // إدخال السجل النهائي للحالات العامة
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
      db_id: result.rows[0].id 
    });

  } catch (error) {
    console.error('❌ Neon Insertion Error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
}
