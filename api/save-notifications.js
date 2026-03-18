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
    expected_due_date // استلام موعد الولادة المتوقع من الواجهة
  } = req.body;

  try {
    const finalStartDate = startDate ? new Date(startDate) : new Date();
    const finalEndDate = endDate ? new Date(endDate) : null;
    const isSentStatus = false; 

    // --- منطق الفرز والتحويل ليتناسب مع عمود category في الصورة ---
    const categoryMapping = {
      'menstrual_cycle': 'period',
      'pregnancy_tracking': 'pregnancy',
      'breastfeeding_tracking': 'breastfeeding', // تحويل التمريض للرضاعة
      'child_care': 'motherhood',
      'medical_followup': 'medical',
      'mental_health': 'mood',
      'religious_guidance': 'fiqh',
      'physical_fitness': 'fitness',
      'marriage_consultancy': 'intimacy'
    };

    // القيمة التي ستخزن في عمود category بالداتا بيز
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
      extra: JSON.stringify({ milk_amount, baby_status, next_appointment, current_visit_date, expected_due_date })
    };

    // --- البدء في تخصيص البيانات بناءً على الـ category الموحد ---
    
    let finalTitle = title;
    let finalBody = body;
    let customSchedule = scheduled_for ? new Date(scheduled_for) : finalStartDate;

    // 1. الرضاعة
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

    // 2. المتابعة الطبية
    if (finalCategory === 'medical') {
      finalTitle = "موعدكِ الطبي 🩺";
      finalBody = "حفاظاً على صحتكِ، نذكركِ بموعد الاستشارة الطبية اليوم. دمتِ بخير.";
      customSchedule = next_appointment ? new Date(next_appointment) : customSchedule;
    } 
    // 3. الدورة الشهرية
    else if (finalCategory === 'period') {
      finalTitle = "رقة تذكركِ 🌸";
      finalBody = "سيدتي، اقترب موعد أيامكِ الهادئة.. كوني مستعدة لتدليل نفسكِ رعايةً وراحة.";
    }
    // 4. الحمل (تم تعديله ليحسب الأشهر المتبقية)
    else if (finalCategory === 'pregnancy') {
      if (expected_due_date) {
        const today = new Date();
        const dueDate = new Date(expected_due_date);
        
        // حساب فرق الأشهر
        let monthsRemaining = (dueDate.getFullYear() - today.getFullYear()) * 12 + (dueDate.getMonth() - today.getMonth());
        
        if (monthsRemaining > 0) {
          let insertedIds = [];
          for (let i = 1; i <= monthsRemaining; i++) {
            const scheduledMonth = new Date(today);
            scheduledMonth.setMonth(today.getMonth() + i);
            
            const monthTitle = "رحلة الأمومة ✨";
            const monthBody = `أنتِ الآن في شهر جديد من رحلتكِ الرائعة. رقة تذكركِ بمتابعة نمو جنينكِ واحتياجاتكِ الصحية.`;
            
            const values = [
              commonData.user, fcmToken, 'pregnancy', 
              monthTitle, monthBody, isSentStatus, 
              scheduledMonth, finalStartDate, finalEndDate, 
              commonData.loc_lng, commonData.loc_lat, commonData.extra
            ];
            
            const resDb = await pool.query(query, values);
            insertedIds.push(resDb.rows[0].id);
          }
          return res.status(200).json({ success: true, message: "Pregnancy schedule created", db_ids: insertedIds });
        }
      }
      // الحالة الافتراضية للحمل إذا لم يوجد تاريخ أو الفرق صفر
      finalTitle = "رحلة الأمومة ✨";
      finalBody = "تذكير رقيق لمتابعة نمو جنينكِ.. رقة معكِ في كل خطوة من هذه الرحلة.";
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

    // إدخال السجل النهائي في قاعدة البيانات للحالات الأخرى
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
