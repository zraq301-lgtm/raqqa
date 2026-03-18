import pkg from 'pg';
const { Pool } = pkg;

const dbUrl = new URL(process.env.DATABASE_URL);

const pool = new Pool({
  host: dbUrl.hostname, port: dbUrl.port,
  user: dbUrl.username, password: dbUrl.password,
  database: dbUrl.pathname.split('/')[1],
  ssl: { rejectUnauthorized: false },
  max: 1, connectionTimeoutMillis: 5000, idleTimeoutMillis: 30000
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  let { 
    fcmToken, user_id, category, title, body, 
    scheduled_for, startDate, endDate,
    next_appointment, expected_due_date,
    latitude, longitude, milk_amount
  } = req.body;

  try {
    const now = new Date();
    
    // --- 1. المنطق الذكي لتحديد الفئة (Category) بالعربي ---
    let finalCategory = 'عام';
    const checkText = ((category || "") + (title || "") + (body || "")).toLowerCase();

    if (checkText.includes('حيض') || checkText.includes('دورة') || checkText.includes('period') || checkText.includes('menstrual')) {
      finalCategory = 'حيض';
    } else if (checkText.includes('حمل') || checkText.includes('pregnancy')) {
      finalCategory = 'حمل';
    } else if (checkText.includes('طبيب') || checkText.includes('استشارة') || checkText.includes('medical')) {
      finalCategory = 'طبيب';
    } else if (checkText.includes('رضاعة') || checkText.includes('milk')) {
      finalCategory = 'رضاعة';
    } else if (checkText.includes('أمومة') || checkText.includes('طفل') || checkText.includes('child')) {
      finalCategory = 'أمومة';
    } else if (checkText.includes('رشاقة') || checkText.includes('تمرين') || checkText.includes('fitness')) {
      finalCategory = 'رشاقة';
    } else if (checkText.includes('فقه') || checkText.includes('دين') || checkText.includes('fiqh')) {
      finalCategory = 'فقه';
    } else if (checkText.includes('حميمية') || checkText.includes('زواج') || checkText.includes('marriage')) {
      finalCategory = 'حميمية';
    } else if (checkText.includes('مشاعر') || checkText.includes('نفسية') || checkText.includes('mood')) {
      finalCategory = 'مشاعر';
    }

    // --- 2. ضبط توقيت الجدولة والبيانات لكل فئة ---
    let finalScheduledFor = scheduled_for ? new Date(scheduled_for) : now;
    let finalTitle = title;
    let finalBody = body;

    // معالجة تواريخ الدورة (الحيض) لتطابق واجهة "توقعات رقة"
    if (finalCategory === 'حيض') {
      finalScheduledFor = startDate ? new Date(startDate) : new Date(now.getTime() + (28 * 24 * 60 * 60 * 1000));
      finalTitle = "توقعات رقة 🌸";
      finalBody = "سيدتي، نقترب من موعد دورتكِ القادمة، كوني مستعدة.";
    } 
    
    // معالجة موعد الطبيب (تنبيه قبل الموعد بيومين)
    else if (finalCategory === 'طبيب') {
      const docDate = next_appointment ? new Date(next_appointment) : finalScheduledFor;
      finalScheduledFor = new Date(docDate.getTime() - (2 * 24 * 60 * 60 * 1000));
      finalTitle = "تذكير بالموعد 🩺";
    }

    // معالجة الرضاعة (بعد ساعة واحدة)
    else if (finalCategory === 'رضاعة') {
      finalScheduledFor = new Date(now.getTime() + (1 * 60 * 60 * 1000));
      finalTitle = "وقت الرضاعة 🤱";
    }

    // بقية الفئات (جدولة افتراضية بعد يومين إذا لم يحدد المستخدم)
    else if (!scheduled_for) {
      finalScheduledFor = new Date(now.getTime() + (2 * 24 * 60 * 60 * 1000));
    }

    // --- 3. تنفيذ الإدخال في قاعدة البيانات ---
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

    const extraData = JSON.stringify({ 
      milk_amount, next_appointment, expected_due_date, 
      sync_time: now.toISOString() 
    });

    const values = [
      parseInt(user_id) || 1, fcmToken, finalCategory, 
      finalTitle, finalBody, false, 
      finalScheduledFor, 
      startDate ? new Date(startDate) : null, 
      endDate ? new Date(endDate) : null, 
      longitude || 0, latitude || 0, extraData
    ];

    // حالة خاصة للحمل: إنشاء سجلات شهرية
    if (finalCategory === 'حمل' && expected_due_date) {
      const dueDate = new Date(expected_due_date);
      let months = (dueDate.getFullYear() - now.getFullYear()) * 12 + (dueDate.getMonth() - now.getMonth());
      let ids = [];
      for (let i = 0; i <= months; i++) {
        let sDate = new Date(); sDate.setMonth(now.getMonth() + i);
        const v = [parseInt(user_id) || 1, fcmToken, 'حمل', "متابعة الحمل ✨", `تذكير بالشهر الجديد من رحلتكِ.`, false, sDate, null, null, longitude || 0, latitude || 0, extraData];
        const resDb = await pool.query(query, v);
        ids.push(resDb.rows[0].id);
      }
      return res.status(200).json({ success: true, message: "تمت جدولة شهور الحمل بنجاح", ids });
    }

    const result = await pool.query(query, values);
    return res.status(200).json({ 
      success: true, 
      saved_as: finalCategory, 
      scheduled_for: finalScheduledFor,
      db_id: result.rows[0].id 
    });

  } catch (error) {
    console.error('❌ Database Sync Error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
}
