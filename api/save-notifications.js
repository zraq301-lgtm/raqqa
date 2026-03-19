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
    
    // --- 1. تحديد الفئة بدقة حسب كلمات الصور ---
    let finalCategory = 'عام';
    const checkText = ((category || "") + (title || "") + (body || "")).toLowerCase();

    if (checkText.includes('رضاعة') || checkText.includes('milk')) {
      finalCategory = 'رضاعة';
    } 
    else if (checkText.includes('رشاقة') || checkText.includes('fitness') || checkText.includes('بدني') || 
             checkText.includes('تغذية') || checkText.includes('نوم') || checkText.includes('قياسات') || 
             checkText.includes('حيوية') || checkText.includes('ماء')) {
      finalCategory = 'رشاقة';
    } 
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
    else if (checkText.includes('طبيب') || checkText.includes('استشارة') || checkText.includes('عظام') || checkText.includes('خبرة')) {
      finalCategory = 'طبيب';
    }

    // --- 2. إجبار استلام التاريخ من الواجهة (حل مشكلة تاريخ اليوم في نيون) ---
    // القاعدة: إذا أرسلت الواجهة أي موعد مستقبلي، نستخدمه هو أولاً.
    let finalScheduledFor;

    if (next_appointment) {
      finalScheduledFor = new Date(next_appointment);
    } else if (startDate && finalCategory === 'حيض') {
      finalScheduledFor = new Date(startDate);
    } else if (scheduled_for) {
      finalScheduledFor = new Date(scheduled_for);
    } else {
      finalScheduledFor = now; // الملاذ الأخير فقط
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

    const extraData = JSON.stringify({ 
      milk_amount, next_appointment, expected_due_date,
      ui_source_date: scheduled_for || startDate 
    });

    // --- 3. منطق الحمل العكسي ---
    if (finalCategory === 'حمل' && expected_due_date) {
      const dueDate = new Date(expected_due_date);
      let ids = [];
      let diffMonths = (dueDate.getFullYear() - now.getFullYear()) * 12 + (dueDate.getMonth() - now.getMonth());
      
      for (let i = 0; i <= diffMonths; i++) {
        let sDate = new Date(dueDate); 
        sDate.setMonth(dueDate.getMonth() - i); 
        if (sDate < now && i !== diffMonths) continue; 

        const v = [
          parseInt(user_id) || 1, fcmToken, 'حمل', 
          `متابعة الحمل - الشهر ${diffMonths - i + 1}`, 
          title || `تذكير بموعد الشهر الجديد`, 
          false, sDate, null, null, longitude || 0, latitude || 0, extraData
        ];
        const resDb = await pool.query(query, v);
        ids.push(resDb.rows[0].id);
      }
      return res.status(200).json({ success: true, message: "تمت الجدولة العكسية بنجاح", ids });
    }

    // الإدخال للأقسام العادية (سيستخدم التاريخ المستقبلي الذي حددناه أعلاه)
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
      applied_schedule: finalScheduledFor, // هذا هو التاريخ الذي سيظهر في نيون
      db_id: result.rows[0].id 
    });

  } catch (error) {
    console.error('❌ Sync Error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
}
