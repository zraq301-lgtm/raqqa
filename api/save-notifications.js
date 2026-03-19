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
    
    // --- 1. تحديد الفئة بناءً على صور الواجهة الجديدة ---
    let finalCategory = 'عام';
    const checkText = ((category || "") + (title || "") + (body || "")).toLowerCase();

    if (checkText.includes('رضاعة') || checkText.includes('milk')) {
      finalCategory = 'رضاعة';
    } 
    // فئة الرشاقة: تشمل النشاط البدني، القياسات، التغذية، النوم، الهيدرات
    else if (checkText.includes('رشاقة') || checkText.includes('fitness') || checkText.includes('بدني') || 
             checkText.includes('تغذية') || checkText.includes('نوم') || checkText.includes('قياسات') || 
             checkText.includes('حيوية') || checkText.includes('ماء')) {
      finalCategory = 'رشاقة';
    } 
    // فئة المشاعر: تشمل العلاقات، الود، الذات، النمو، النفسية
    else if (checkText.includes('مشاعر') || checkText.includes('mood') || checkText.includes('علاقات') || 
             checkText.includes('ود') || checkText.includes('ذات') || checkText.includes('نمو') || 
             checkText.includes('نفسية')) {
      finalCategory = 'مشاعر';
    } 
    else if (checkText.includes('أمومة') || checkText.includes('طفل')) {
      finalCategory = 'أمومة';
    } 
    else if (checkText.includes('فقه') || checkText.includes('fiqh')) {
      finalCategory = 'فقه';
    } 
    else if (checkText.includes('حيض') || checkText.includes('دورة')) {
      finalCategory = 'حيض';
    } 
    else if (checkText.includes('حمل')) {
      finalCategory = 'حمل';
    } 
    else if (checkText.includes('حميمية')) {
      finalCategory = 'حميمية';
    } 
    else if (checkText.includes('طبيب') || checkText.includes('استشارة') || checkText.includes('عظام')) {
      finalCategory = 'طبيب';
    }

    // --- 2. ضبط التاريخ (بدون توليف) ---
    // الكود الآن يأخذ ما ترسله الواجهة حرفياً
    // الأولوية لـ next_appointment إذا وجد (خاص بالطبيب)، وإلا scheduled_for، وإلا التاريخ الحالي
    let finalScheduledFor = next_appointment ? new Date(next_appointment) : (scheduled_for ? new Date(scheduled_for) : now);

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
      ui_source_date: scheduled_for || startDate 
    });

    // --- 3. منطق الحمل العكسي (حسب تاريخ الولادة) ---
    if (finalCategory === 'حمل' && expected_due_date) {
      const dueDate = new Date(expected_due_date);
      let ids = [];
      
      // حساب الأشهر المتبقية من اليوم حتى تاريخ الولادة
      let diffMonths = (dueDate.getFullYear() - now.getFullYear()) * 12 + (dueDate.getMonth() - now.getMonth());
      
      if (diffMonths > 0) {
        for (let i = 0; i <= diffMonths; i++) {
          let sDate = new Date(dueDate); 
          sDate.setMonth(dueDate.getMonth() - i); // الرجوع للخلف شهراً بشهر
          
          // نتخطى التواريخ التي سبقت تاريخ اليوم
          if (sDate < now && i !== diffMonths) continue; 

          const v = [
            parseInt(user_id) || 1, fcmToken, 'حمل', 
            `متابعة الحمل - متبقي ${i} شهر`, 
            title || `تذكير بمتابعة حملك`, 
            false, sDate, null, null, longitude || 0, latitude || 0, extraData
          ];
          const resDb = await pool.query(query, v);
          ids.push(resDb.rows[0].id);
        }
        return res.status(200).json({ success: true, message: "تم جدولة أشهر الحمل عكسياً", ids });
      }
    }

    // التنفيذ للأقسام الأخرى (يأخذ التاريخ كما هو من الواجهة)
    const values = [
      parseInt(user_id) || 1, fcmToken, finalCategory, 
      title, body, false, 
      finalScheduledFor, 
      startDate ? new Date(startDate) : null, 
      endDate ? new Date(endDate) : null, 
      longitude || 0, latitude || 0, extraData
    ];

    const result = await pool.query(query, values);
    return res.status(200).json({ 
      success: true, 
      category: finalCategory, 
      applied_schedule: finalScheduledFor,
      db_id: result.rows[0].id 
    });

  } catch (error) {
    console.error('❌ Sync Error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
}
