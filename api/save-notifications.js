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
    
    // --- 1. تحديد الفئة بالعربي لضبط شكل الجدول ---
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
    } else if (checkText.includes('أمومة') || checkText.includes('طفل')) {
      finalCategory = 'أمومة';
    } else if (checkText.includes('رشاقة') || checkText.includes('fitness')) {
      finalCategory = 'رشاقة';
    } else if (checkText.includes('فقه') || checkText.includes('fiqh')) {
      finalCategory = 'فقه';
    } else if (checkText.includes('حميمية') || checkText.includes('marriage')) {
      finalCategory = 'حميمية';
    } else if (checkText.includes('مشاعر') || checkText.includes('mood')) {
      finalCategory = 'مشاعر';
    }

    // --- 2. إجبار التواريخ لتطابق الواجهة بالضبط ---
    
    // الأولوية لـ scheduled_for القادم من التطبيق، ثم startDate (موعد الدورة القادمة)، ثم الآن
    let finalScheduledFor = scheduled_for ? new Date(scheduled_for) : (startDate ? new Date(startDate) : now);
    
    // في حالة الطبيب: إذا أرسلت الواجهة موعداً، نجدول قبلها بـ 48 ساعة، وإلا نلتزم بالموعد المرسل
    if (finalCategory === 'طبيب' && next_appointment) {
      finalScheduledFor = new Date(new Date(next_appointment).getTime() - (2 * 24 * 60 * 60 * 1000));
    }

    // تجهيز تواريخ الأعمدة لتظهر في Neon (منع الـ NULL)
    const dbStartDate = startDate ? new Date(startDate) : (finalCategory === 'حيض' ? finalScheduledFor : null);
    const dbEndDate = endDate ? new Date(endDate) : null;

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
      ui_source_date: scheduled_for || startDate 
    });

    const values = [
      parseInt(user_id) || 1, fcmToken, finalCategory, 
      title, body, false, 
      finalScheduledFor, 
      dbStartDate, 
      dbEndDate, 
      longitude || 0, latitude || 0, extraData
    ];

    // منطق الحمل: إذا كانت الواجهة ترسل تاريخ ولادة، نجدول شهور بناءً عليه
    if (finalCategory === 'حمل' && expected_due_date) {
      const dueDate = new Date(expected_due_date);
      let months = (dueDate.getFullYear() - now.getFullYear()) * 12 + (dueDate.getMonth() - now.getMonth());
      let ids = [];
      for (let i = 0; i <= months; i++) {
        let sDate = new Date(); sDate.setMonth(now.getMonth() + i);
        // نضع اليوم الأول من كل شهر للتذكير
        const v = [parseInt(user_id) || 1, fcmToken, 'حمل', title, `متابعة شهرك الجديد من الحمل`, false, sDate, null, null, longitude || 0, latitude || 0, extraData];
        const resDb = await pool.query(query, v);
        ids.push(resDb.rows[0].id);
      }
      return res.status(200).json({ success: true, message: "تم التزامن مع واجهة الحمل", ids });
    }

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
