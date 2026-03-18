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
    expected_due_date 
  } = req.body;

  try {
    const now = new Date();
    const isSentStatus = false; 

    // --- توحيد المسميات لتظهر في الداتابيز بالعربي كما في الصور ---
    const categoryMapping = {
      'menstrual_cycle': 'حيض',
      'pregnancy_tracking': 'حمل',
      'breastfeeding_tracking': 'رضاعة',
      'child_care': 'أمومة',
      'medical_followup': 'طبيب',
      'mental_health': 'مشاعر',
      'religious_guidance': 'فقه',
      'physical_fitness': 'رشاقة',
      'marriage_consultancy': 'حميمية'
    };

    const finalCategory = categoryMapping[category] || category;

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

    let finalTitle = title;
    let finalBody = body;
    let customSchedule = new Date();

    // --- تنفيذ المنطق الزمني لكل تصنيف ---

    // 1. الحيض (التاريخ القادم كما هو من الواجهة)
    if (finalCategory === 'حيض') {
      customSchedule = startDate ? new Date(startDate) : now;
      finalTitle = "رقة تذكركِ 🌸";
      finalBody = "سيدتي، اقترب موعد أيامكِ الهادئة.. كوني مستعدة لتدليل نفسكِ.";
    }

    // 2. الحمل (جدولة شهرية حتى الولادة)
    else if (finalCategory === 'حمل') {
      if (expected_due_date) {
        const dueDate = new Date(expected_due_date);
        let monthsRemaining = (dueDate.getFullYear() - now.getFullYear()) * 12 + (dueDate.getMonth() - now.getMonth());
        
        let insertedIds = [];
        for (let i = 0; i <= monthsRemaining; i++) {
          const scheduledMonth = new Date();
          scheduledMonth.setMonth(now.getMonth() + i);
          
          const mTitle = "رحلة الأمومة ✨";
          const mBody = i === monthsRemaining ? "اقترب موعد اللقاء المنتظر! ولادة مباركة." : `رقة تذكرك بمتابعة شهرك الجديد من الحمل.`;
          
          const values = [commonData.user, fcmToken, 'حمل', mTitle, mBody, isSentStatus, scheduledMonth, startDate, endDate, commonData.loc_lng, commonData.loc_lat, commonData.extra];
          const resDb = await pool.query(query, values);
          insertedIds.push(resDb.rows[0].id);
        }
        return res.status(200).json({ success: true, message: "تمت جدولة شهور الحمل", db_ids: insertedIds });
      }
    }

    // 3. الرضاعة (ساعة متقدمة)
    else if (finalCategory === 'رضاعة') {
      customSchedule = new Date(now.getTime() + (1 * 60 * 60 * 1000));
      finalTitle = "لحظات الارتباط 🤱";
      finalBody = "تذكير بموعد رضعة طفلكِ القادمة.";
    }

    // 4. الأمومة (بعد يومين)
    else if (finalCategory === 'أمومة') {
      customSchedule = new Date(now.getTime() + (2 * 24 * 60 * 60 * 1000));
      finalTitle = "أنتِ أم رائعة 💖";
      finalBody = "تذكير بمهمة طفلكِ القادمة بعد يومين.";
    }

    // 5. الطبيب (موعد الطبيب - يومين)
    else if (finalCategory === 'طبيب') {
      const docDate = next_appointment ? new Date(next_appointment) : now;
      customSchedule = new Date(docDate.getTime() - (2 * 24 * 60 * 60 * 1000));
      finalTitle = "موعدكِ الطبي القادم 🩺";
      finalBody = "تذكير: موعد طبيبكِ بعد يومين، كوني على استعداد.";
    }

    // 6. الرشاقة (توقيت بالساعة)
    else if (finalCategory === 'رشاقة') {
      customSchedule = new Date(now.getTime() + (3 * 60 * 60 * 1000)); // مثال بعد 3 ساعات
      finalTitle = "وقت النشاط 🏃‍♀️";
      finalBody = "حان وقت التمرين البسيط للحفاظ على رشقتكِ.";
    }

    // 7. الفقه (بعد يومين)
    else if (finalCategory === 'فقه') {
      customSchedule = new Date(now.getTime() + (2 * 24 * 60 * 60 * 1000));
      finalTitle = "رفيقتكِ الفقهية 📖";
      finalBody = "تذكير بمراجعة الأحكام الخاصة بكِ.";
    }

    // 8. الحميمية و المشاعر (بعد ثلاثة أيام)
    else if (finalCategory === 'حميمية' || finalCategory === 'مشاعر') {
      customSchedule = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000));
      finalTitle = finalCategory === 'حميمية' ? "لحظات الود ❤️" : "رقة تهتم بقلبكِ ✨";
      finalBody = finalCategory === 'حميمية' ? "تذكير بتعزيز الود مع شريك حياتكِ." : "خذي وقتاً لنفسكِ، نحن نهتم بمشاعركِ.";
    }

    // الإدخال النهائي في قاعدة البيانات
    const values = [
      commonData.user, fcmToken, finalCategory, 
      finalTitle, finalBody, isSentStatus, 
      customSchedule, startDate, endDate, 
      commonData.loc_lng, commonData.loc_lat, commonData.extra
    ];

    const result = await pool.query(query, values);
    return res.status(200).json({ 
      success: true, 
      category_saved: finalCategory, 
      scheduled_at: customSchedule,
      db_id: result.rows[0].id 
    });

  } catch (error) {
    console.error('❌ Neon Error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
}
