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
    let finalCategory = category || 'general';

    // مصفوفة التصنيفات المطلوبة لتوحيد المسميات في قاعدة البيانات
    const categoryMap = {
      'حيض': 'menstrual',
      'menstrual_report': 'menstrual',
      'حمل': 'pregnancy',
      'pregnancy': 'pregnancy',
      'رضاعة': 'breastfeeding',
      'أمومة': 'motherhood',
      'رشاقة': 'fitness',
      'طبيب': 'medical',
      'medical': 'medical',
      'فقه': 'jurisprudence',
      'علاقات': 'relationships',
      'مشاعر': 'emotions'
    };

    // تحديد التصنيف النهائي بناءً على القيمة القادمة
    if (categoryMap[category]) {
      finalCategory = categoryMap[category];
    }

    const query = `
      INSERT INTO notifications (user_id, fcm_token, category, title, body, scheduled_for, extra_data, is_sent, location)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id
    `;

    const geoPoint = (latitude && longitude) ? `POINT(${longitude} ${latitude})` : null;

    // --- 1. منطق واجهة الحيض (تم تعديل الـ body ليحفظ التقرير) ---
    if (finalCategory === 'menstrual') {
      finalDate = next_period_date || scheduled_for || new Date().toISOString();

      finalValues = [
        parseInt(user_id) || 1,
        fcmToken || null,
        'menstrual',
        title || 'تقرير الحيض',
        body || 'تذكير بموعد الدورة القادمة', // هنا يحفظ التقرير في عمود body
        finalDate,
        JSON.stringify(extra_data || {}),
        false,
        geoPoint
      ];
    } 
    
    // --- 2. منطق واجهة الاستشارات والطبيب (الحفاظ على دالة التاريخ - يومين) ---
    else if (note !== undefined || finalCategory === 'medical' || finalCategory === 'pregnancy') {
      if (scheduled_for) {
        const dateObj = new Date(scheduled_for);
        if (!isNaN(dateObj.getTime())) {
          dateObj.setDate(dateObj.getDate() - 2); // الحفاظ على طرح اليومين
          finalDate = dateObj.toISOString();
        }
      }
      
      finalDate = finalDate || new Date().toISOString();
      const mergedExtraData = extra_data || {};
      if (note) mergedExtraData.note = note;

      finalValues = [
        parseInt(user_id) || 1,
        fcmToken || null,
        finalCategory,
        title || 'تذكير موعد',
        body || '',
        finalDate,
        JSON.stringify(mergedExtraData),
        false,
        geoPoint
      ];
    }

    // --- 3. المسار الافتراضي لبقية التصنيفات (الرشاقة، الفقه، المشاعر، إلخ) ---
    else {
      finalDate = scheduled_for || new Date().toISOString();
      finalValues = [
        parseInt(user_id) || 1,
        fcmToken || null,
        finalCategory,
        title || 'تذكير جديد',
        body || '',
        finalDate,
        JSON.stringify(extra_data || {}),
        false,
        geoPoint
      ];
    }

    const result = await pool.query(query, finalValues);

    return res.status(200).json({ 
      success: true, 
      id: result.rows[0].id, 
      scheduled_at: finalDate,
      category: finalCategory,
      message: (finalCategory === 'menstrual') 
        ? "تم حفظ تقرير الحيض في قاعدة البيانات ✅" 
        : `تمت جدولة التذكير بنجاح ضمن تصنيف ${finalCategory} 🔔`
    });

  } catch (error) {
    console.error('❌ Database Error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
}
