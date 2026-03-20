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

  // استخراج البيانات (بما في ذلك next_period_date القادم من واجهة الحيض)
  let { user_id, fcmToken, category, title, body, scheduled_for, extra_data, note, next_period_date } = req.body;

  try {
    let finalDate = null;
    let finalValues;
    const query = `
      INSERT INTO notifications (user_id, fcm_token, category, title, body, scheduled_for, extra_data, is_sent)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `;

    // --- 1. منطق واجهة الحيض (استخراج وحفظ التاريخ المتوقع بدقة) ---
    if (category === 'menstrual_report' || category === 'حيض') {
      // الأولوية لـ next_period_date القادم من الحسابات البرمجية في الواجهة
      finalDate = next_period_date || scheduled_for || new Date().toISOString();

      finalValues = [
        parseInt(user_id) || 1,
        fcmToken || null,
        'menstrual_report',
        title || 'تاريخ الحيض المتوقع',
        body || 'تذكير بموعد الدورة القادمة',
        finalDate, // يُحفظ كما هو بدون طرح أي أيام
        JSON.stringify(extra_data || {}),
        false
      ];
    } 
    
    // --- 2. منطق واجهة الاستشارات والطبيب (طرح يومين للتذكير) ---
    else if (note !== undefined || category === 'medical' || category === 'pregnancy') {
      if (scheduled_for) {
        const dateObj = new Date(scheduled_for);
        if (!isNaN(dateObj.getTime())) {
          // هنا يتم تطبيق "التذكير المبكر" للمواعيد الطبية فقط
          dateObj.setDate(dateObj.getDate() - 2);
          finalDate = dateObj.toISOString();
        }
      }
      
      finalDate = finalDate || new Date().toISOString();
      const mergedExtraData = extra_data || {};
      if (note) mergedExtraData.note = note;

      finalValues = [
        parseInt(user_id) || 1,
        fcmToken || null,
        category || 'medical',
        title || 'تذكير موعد طبي',
        body || '',
        finalDate,
        JSON.stringify(mergedExtraData),
        false
      ];
    }

    // --- 3. المسار الافتراضي لأي حالات أخرى ---
    else {
      finalDate = scheduled_for || new Date().toISOString();
      finalValues = [
        parseInt(user_id) || 1,
        fcmToken || null,
        category || 'general',
        title || 'تذكير',
        body || '',
        finalDate,
        JSON.stringify(extra_data || {}),
        false
      ];
    }

    const result = await pool.query(query, finalValues);

    return res.status(200).json({ 
      success: true, 
      id: result.rows[0].id, 
      scheduled_at: finalDate,
      message: (category === 'menstrual_report' || category === 'حيض') 
        ? "تم حفظ موعد الدورة المتوقع بدقة ✅" 
        : "تمت جدولة التذكير الطبي (قبل الموعد بيومين) 🔔"
    });

  } catch (error) {
    console.error('❌ Database Error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
}
