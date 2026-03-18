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

    // --- 1. تحسين الفرز لضمان عدم حدوث خطأ في التصنيف ---
    let finalCategory = 'عام'; // افتراضي
    
    // فحص ذكي للتصنيف القادم
    const catLower = (category || "").toLowerCase();
    const titleLower = (title || "").toLowerCase();

    if (catLower.includes('menstrual') || catLower.includes('period') || titleLower.includes('دورة') || titleLower.includes('حيض')) {
      finalCategory = 'حيض';
    } else if (catLower.includes('pregnancy') || catLower.includes('حمل')) {
      finalCategory = 'حمل';
    } else if (catLower.includes('medical') || catLower.includes('طبيب') || catLower.includes('report')) {
      finalCategory = 'طبيب';
    } else if (catLower.includes('breast') || catLower.includes('رضاعة')) {
      finalCategory = 'رضاعة';
    } else if (catLower.includes('child') || catLower.includes('أمومة')) {
      finalCategory = 'أمومة';
    } else if (catLower.includes('fitness') || catLower.includes('رشاقة')) {
      finalCategory = 'رشاقة';
    } else if (catLower.includes('fiqh') || catLower.includes('فقه')) {
      finalCategory = 'فقه';
    } else if (catLower.includes('marriage') || catLower.includes('حميمية')) {
      finalCategory = 'حميمية';
    } else if (catLower.includes('mood') || catLower.includes('مشاعر')) {
      finalCategory = 'مشاعر';
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

    const commonData = {
      user: isNaN(parseInt(user_id)) ? 1 : parseInt(user_id),
      loc_lng: longitude || 0,
      loc_lat: latitude || 0,
      extra: JSON.stringify({ milk_amount, baby_status, next_appointment, current_visit_date, expected_due_date })
    };

    let finalTitle = title;
    let finalBody = body;
    let customSchedule = new Date();

    // --- 2. ضبط المنطق الزمني بناءً على الفئة الصحيحة ---

    if (finalCategory === 'حيض') {
      // إذا أرسلت الواجهة startDate نستخدمه، وإلا نضيف 28 يوم كافتراض منطقي للدورة القادمة
      customSchedule = startDate ? new Date(startDate) : new Date(now.getTime() + (28 * 24 * 60 * 60 * 1000));
      finalTitle = "رقة تذكركِ 🌸";
      finalBody = "سيدتي، اقترب موعد أيامكِ الهادئة.. كوني مستعدة لتدليل نفسكِ.";
    }

    else if (finalCategory === 'حمل') {
      if (expected_due_date) {
        const dueDate = new Date(expected_due_date);
        let monthsRemaining = (dueDate.getFullYear() - now.getFullYear()) * 12 + (dueDate.getMonth() - now.getMonth());
        let insertedIds = [];
        for (let i = 0; i <= monthsRemaining; i++) {
          const scheduledMonth = new Date();
          scheduledMonth.setMonth(now.getMonth() + i);
          const values = [commonData.user, fcmToken, 'حمل', "رحلة الأمومة ✨", "رقة تذكرك بمتابعة شهرك الجديد من الحمل.", isSentStatus, scheduledMonth, startDate, endDate, commonData.loc_lng, commonData.loc_lat, commonData.extra];
          const resDb = await pool.query(query, values);
          insertedIds.push(resDb.rows[0].id);
        }
        return res.status(200).json({ success: true, message: "تمت جدولة شهور الحمل", db_ids: insertedIds });
      }
    }

    else if (finalCategory === 'طبيب') {
      // طرح يومين من الموعد القادم
      const docDate = next_appointment ? new Date(next_appointment) : now;
      customSchedule = new Date(docDate.getTime() - (2 * 24 * 60 * 60 * 1000));
      finalTitle = "موعدكِ الطبي القادم 🩺";
      finalBody = "تذكير: موعد طبيبكِ بعد يومين، كوني على استعداد.";
    }

    else if (finalCategory === 'رضاعة') {
      customSchedule = new Date(now.getTime() + (1 * 60 * 60 * 1000)); // بعد ساعة
    }

    else if (finalCategory === 'أمومة' || finalCategory === 'فقه') {
      customSchedule = new Date(now.getTime() + (2 * 24 * 60 * 60 * 1000)); // بعد يومين
    }

    else if (finalCategory === 'حميمية' || finalCategory === 'مشاعر') {
      customSchedule = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000)); // بعد 3 أيام
    }

    else if (finalCategory === 'رشاقة') {
      customSchedule = new Date(now.getTime() + (4 * 60 * 60 * 1000)); // بعد 4 ساعات
    }

    // الإدخال النهائي
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
