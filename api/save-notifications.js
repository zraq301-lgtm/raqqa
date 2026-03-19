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
    const checkText = ((category || "") + (title || "") + (body || "")).toLowerCase();
    
    // --- 1. تحديد الفئة بناءً على أقسام واجهة الحمل الجديدة ---
    let finalCategory = 'عام';

    if (checkText.includes('جنين') || checkText.includes('حمل') || checkText.includes('أسابيع') || 
        checkText.includes('فحوصات') || checkText.includes('مكملات') || checkText.includes('ولادة') || 
        expected_due_date) {
      finalCategory = 'حمل';
    } 
    else if (checkText.includes('رضاعة') || checkText.includes('milk')) {
      finalCategory = 'رضاعة';
    } 
    else if (checkText.includes('رشاقة') || checkText.includes('fitness') || checkText.includes('تغذية') || 
             checkText.includes('نوم') || checkText.includes('بدني')) {
      finalCategory = 'رشاقة';
    } 
    else if (checkText.includes('مشاعر') || checkText.includes('mood') || checkText.includes('علاقات') || 
             checkText.includes('ود') || checkText.includes('ذات')) {
      finalCategory = 'مشاعر';
    } 
    else if (checkText.includes('طبيب') || checkText.includes('استشارة') || checkText.includes('عظام') || next_appointment) {
      finalCategory = 'طبيب';
    } else if (checkText.includes('حيض') || checkText.includes('دورة')) {
      finalCategory = 'حيض';
    }

    // --- 2. استلام التاريخ من الواجهة حصراً (دون وضع تاريخ اليوم كبديل) ---
    let finalScheduledFor = next_appointment ? new Date(next_appointment) : 
                           (startDate ? new Date(startDate) : 
                           (scheduled_for ? new Date(scheduled_for) : null));

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
      ui_source_date: scheduled_for || startDate || next_appointment 
    });

    // --- 3. الجدولة العكسية من تاريخ الولادة ---
    if (finalCategory === 'حمل' && expected_due_date) {
      const dueDate = new Date(expected_due_date);
      const nowRef = new Date(); 
      let ids = [];
      let diffMonths = (dueDate.getFullYear() - nowRef.getFullYear()) * 12 + (dueDate.getMonth() - nowRef.getMonth());
      
      if (diffMonths >= 0) {
        for (let i = 0; i <= diffMonths; i++) {
          let sDate = new Date(dueDate); 
          sDate.setMonth(dueDate.getMonth() - i); 
          
          const v = [
            parseInt(user_id) || 1, fcmToken, 'حمل', 
            `متابعة الحمل - الشهر ${diffMonths - i + 1}`, 
            title || `تذكير بخصوص ${body || 'تطورات الحمل والجنين'}`, 
            false, sDate, null, null, longitude || 0, latitude || 0, extraData
          ];
          const resDb = await pool.query(query, v);
          ids.push(resDb.rows[0].id);
        }
        return res.status(200).json({ success: true, message: "تمت الجدولة العكسية لكل أقسام الحمل", ids });
      }
    }

    // للأقسام العادية - يتم الحفظ بالتاريخ القادم من الواجهة
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
