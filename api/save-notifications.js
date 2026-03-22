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
  max: 1
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  let { user_id, fcmToken, category, title, body, scheduled_for, extra_data, note, next_period_date, latitude, longitude } = req.body;

  try {
    let finalDate = null;
    let finalValues;
    
    // مصفوفة التصنيفات لتوحيد المسميات كما طلبت
    const categoryMap = {
      'حيض': 'menstrual',
      'menstrual_report': 'menstrual',
      'حمل': 'pregnancy',
      'pregnancy': 'pregnancy',
      'رضاعة': 'breastfeeding',
      'breastfeeding': 'breastfeeding',
      'أمومة': 'motherhood',
      'motherhood': 'motherhood',
      'رشاقة': 'fitness',
      'fitness': 'fitness',
      'طبيب': 'medical',
      'medical': 'medical',
      'فقه': 'jurisprudence',
      'علاقات': 'relationships',
      'مشاعر': 'emotions'
    };

    let finalCategory = categoryMap[category] || category || 'general';

    const query = `
      INSERT INTO notifications (user_id, fcm_token, category, title, body, scheduled_for, extra_data, is_sent, location)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id
    `;

    const geoPoint = (latitude && longitude) ? `POINT(${longitude} ${latitude})` : null;
    const now = new Date().toISOString();

    // --- 1. منطق واجهة الحيض ---
    if (finalCategory === 'menstrual') {
      finalDate = next_period_date || scheduled_for || now;
      
      finalValues = [
        parseInt(user_id) || 1, fcmToken || null, 'menstrual',
        title || 'تقرير الحيض', body || '', finalDate,
        JSON.stringify(extra_data || {}), false, geoPoint
      ];
    } 

    // --- 2. منطق الرشاقة (تسجيل اليوم الحالي + يوم مستقبلي) ---
    else if (finalCategory === 'fitness') {
      // تسجيل البيانات لليوم الحالي (يوم الإرسال)
      finalDate = now; 
      // ملاحظة: إذا كنت تقصد جدولة تنبيه لموعد مستقبلي بجانب التسجيل الحالي، 
      // فالكود هنا يسجل العملية بتاريخ اللحظة الحالية لضمان الأرشفة اليومية.
      
      finalValues = [
        parseInt(user_id) || 1, fcmToken || null, 'fitness',
        title || 'نشاط رشاقة', body || '', scheduled_for || now,
        JSON.stringify(extra_data || {}), false, geoPoint
      ];
    }

    // --- 3. منطق الرضاعة والحمل (تسجيل باليوم الحالي) ---
    else if (finalCategory === 'breastfeeding' || finalCategory === 'pregnancy') {
      finalDate = now; // التسجيل باليوم الحالي كما طلبت
      
      finalValues = [
        parseInt(user_id) || 1, fcmToken || null, finalCategory,
        title || 'تسجيل جديد', body || '', finalDate,
        JSON.stringify(extra_data || {}), false, geoPoint
      ];
    }

    // --- 4. منطق الطبيب والاستشارات (الحفاظ على طرح يومين) ---
    else if (finalCategory === 'medical' || note !== undefined) {
      if (scheduled_for) {
        const dateObj = new Date(scheduled_for);
        if (!isNaN(dateObj.getTime())) {
          dateObj.setDate(dateObj.getDate() - 2); 
          finalDate = dateObj.toISOString();
        }
      }
      finalDate = finalDate || now;
      const mergedExtraData = extra_data || {};
      if (note) mergedExtraData.note = note;

      finalValues = [
        parseInt(user_id) || 1, fcmToken || null, finalCategory,
        title || 'تذكير موعد', body || '', finalDate,
        JSON.stringify(mergedExtraData), false, geoPoint
      ];
    }

    // --- 5. المسار الافتراضي (باقي الفئات مع حفظ تواريخها الأصلية) ---
    else {
      finalDate = scheduled_for || now;
      finalValues = [
        parseInt(user_id) || 1, fcmToken || null, finalCategory,
        title || 'تذكير', body || '', finalDate,
        JSON.stringify(extra_data || {}), false, geoPoint
      ];
    }

    const result = await pool.query(query, finalValues);

    return res.status(200).json({ 
      success: true, 
      id: result.rows[0].id, 
      category: finalCategory,
      scheduled_at: finalDate,
      message: "تم حفظ البيانات وتصنيفها بنجاح ✅"
    });

  } catch (error) {
    console.error('❌ Database Error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
}
