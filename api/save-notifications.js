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
    
    // --- 1. تحديد الفئة بدقة (تم إعادة ترتيب الأولويات) ---
    let finalCategory = 'عام';
    const checkText = ((category || "") + (title || "") + (body || "")).toLowerCase();

    // فحص الفئات الخاصة أولاً لمنع اختلاطها بكلمة "طبيب"
    if (checkText.includes('رضاعة') || checkText.includes('milk')) {
      finalCategory = 'رضاعة';
    } else if (checkText.includes('أمومة') || checkText.includes('طفل')) {
      finalCategory = 'أمومة';
    } else if (checkText.includes('رشاقة') || checkText.includes('fitness')) {
      finalCategory = 'رشاقة';
    } else if (checkText.includes('فقه') || checkText.includes('fiqh')) {
      finalCategory = 'فقه';
    } else if (checkText.includes('مشاعر') || checkText.includes('mood')) {
      finalCategory = 'مشاعر';
    } else if (checkText.includes('حيض') || checkText.includes('دورة') || checkText.includes('period')) {
      finalCategory = 'حيض';
    } else if (checkText.includes('حمل') || checkText.includes('pregnancy')) {
      finalCategory = 'حمل';
    } else if (checkText.includes('حميمية') || checkText.includes('marriage')) {
      finalCategory = 'حميمية';
    } else if (checkText.includes('طبيب') || checkText.includes('استشارة') || checkText.includes('عظام') || checkText.includes('medical')) {
      finalCategory = 'طبيب';
    }

    // --- 2. ضبط موعد الطبيب القادم ---
    // إذا وجد موعد طبيب قادم من الواجهة نعتمد عليه فوراً
    let finalScheduledFor = scheduled_for ? new Date(scheduled_for) : now;
    
    if (next_appointment) {
        finalScheduledFor = new Date(next_appointment);
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

    // --- 3. منطق الحمل (إنشاء صفوف للأشهر المتبقية بالعكس) ---
    if (finalCategory === 'حمل' && expected_due_date) {
      const dueDate = new Date(expected_due_date);
      let ids = [];
      
      // حساب الفرق بالأشهر بين الآن وتاريخ الولادة
      let diffMonths = (dueDate.getFullYear() - now.getFullYear()) * 12 + (dueDate.getMonth() - now.getMonth());
      
      // إنشاء سجل لكل شهر متبقي من الآن وحتى تاريخ الولادة
      for (let i = 0; i <= diffMonths; i++) {
        let sDate = new Date(dueDate); 
        sDate.setMonth(dueDate.getMonth() - i); // الرجوع للخلف من تاريخ الولادة
        
        // إذا كان التاريخ المحسوب قد مضى، لا ننشئ له سجل (اختياري)
        if (sDate < now && i !== diffMonths) continue; 

        const v = [
          parseInt(user_id) || 1, fcmToken, 'حمل', 
          `متابعة الحمل - شهر ${diffMonths - i + 1}`, 
          `تذكير بموعد الشهر القادم بناءً على تاريخ الولادة المتوقع`, 
          false, sDate, null, null, longitude || 0, latitude || 0, extraData
        ];
        const resDb = await pool.query(query, v);
        ids.push(resDb.rows[0].id);
      }
      return res.status(200).json({ success: true, message: "تم جدولة أشهر الحمل بنجاح", ids });
    }

    // للإدخالات العادية (غير الحمل)
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
