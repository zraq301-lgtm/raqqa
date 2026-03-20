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

  let { user_id, fcmToken, category, title, body, scheduled_for, extra_data, note } = req.body;

  try {
    let finalDate = null;

    // --- تحديد المنطق بناءً على النوع ---
    
    let finalValues;
    const query = `
      INSERT INTO notifications (user_id, fcm_token, category, title, body, scheduled_for, extra_data, is_sent)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `;

    // الحالة الأولى: إذا كان التصنيف "حيض" (يعمل بمنطق الكود الأول تماماً)
    if (category === 'حيض') {
      // هنا نحفظ التاريخ كما جاء من الواجهة (أو بالمنطق الذي كان ينجح معك سابقاً)
      finalDate = scheduled_for ? new Date(scheduled_for).toISOString() : new Date().toISOString();

      finalValues = [
        parseInt(user_id) || 1,
        fcmToken || null,
        'حيض',
        title || 'تذكير الدورة الشهرية',
        body || '',
        finalDate,
        JSON.stringify(extra_data || {}),
        false
      ];
    } 
    // الحالة الثانية: إذا وجد note أو كانت استشارة طبيب/حمل (منطق طرح يومين)
    else if (note !== undefined || category === 'medical' || category === 'pregnancy') {
      if (scheduled_for) {
        const dateObj = new Date(scheduled_for);
        if (!isNaN(dateObj.getTime())) {
          dateObj.setDate(dateObj.getDate() - 2); // طرح يومين فقط لمواعيد الأطباء
          finalDate = dateObj.toISOString();
        }
      }
      
      if (!finalDate) finalDate = new Date().toISOString();

      const mergedExtraData = extra_data || {};
      if (note) mergedExtraData.note = note;

      finalValues = [
        parseInt(user_id) || 1,
        fcmToken || null,
        category || 'medical',
        title || 'تذكير موعد',
        body || '',
        finalDate,
        JSON.stringify(mergedExtraData),
        false
      ];
    }
    // حالة احتياطية لأي بيانات أخرى
    else {
      finalDate = scheduled_for ? new Date(scheduled_for).toISOString() : new Date().toISOString();
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
      message: category === 'حيض' ? "تم تسجيل بيانات الحيض بنجاح" : "تمت جدولة الموعد (قبل التاريخ بيومين)"
    });

  } catch (error) {
    console.error('❌ Database Error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
}
