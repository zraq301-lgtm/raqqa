import pkg from 'pg';
const { Pool } = pkg;

// إعداد الاتصال بقاعدة بيانات نيون
const pool = new Pool({
  connectionString: process.env.DATABASE_URL + (process.env.DATABASE_URL.includes('?') ? '&' : '?') + 'sslmode=verify-full',
  ssl: { rejectUnauthorized: false, checkServerIdentity: () => undefined }
});

export default async function handler(req, res) {
  // السماح بطلبات POST فقط
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  // استلام البيانات من الواجهة
  let { 
    fcmToken, 
    user_id, 
    category, 
    title, 
    body, 
    scheduled_for, 
    startDate, 
    endDate 
  } = req.body;

  try {
    // 1. معالجة التواريخ: تحويل النصوص القادمة من الواجهة إلى صيغة تاريخ صالحة لقاعدة البيانات
    const finalStartDate = startDate ? new Date(startDate) : new Date();
    const finalEndDate = endDate ? new Date(endDate) : null;
    const finalScheduledFor = scheduled_for ? new Date(scheduled_for) : finalStartDate;

    // 2. التعديل المطلوب لخدمة منصة Make:
    // جعل الحالة دائماً false لكي يظهر السجل كـ "جديد" أو "غير معالج" في ميك
    const isSentStatus = false; 

    // 3. استعلام الإدخال في جدول الإشعارات
    const query = `
      INSERT INTO notifications (
        user_id, 
        fcm_token, 
        category, 
        title, 
        body, 
        is_sent, 
        scheduled_for, 
        period_start_date, 
        period_end_date
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
      RETURNING id
    `;

    // 4. ترتيب القيم مع ضمان وجود قيم افتراضية لمنع الأخطاء
    const values = [
      isNaN(parseInt(user_id)) ? 1 : parseInt(user_id),
      fcmToken || null,
      category || 'general', // هنا سترسل الواجهة 'pregnancy' للحوامل
      title || 'تحديث من رقة',
      body || '',
      isSentStatus, // القيمة المستهدفة FALSE
      finalScheduledFor,
      finalStartDate,
      finalEndDate
    ];

    const result = await pool.query(query, values);

    // الرد النهائي بنجاح العملية
    return res.status(200).json({ 
      success: true, 
      db_id: result.rows[0].id,
      message: "تم الحفظ بنجاح والحالة FALSE لانتظار معالجة منصة Make",
      tracking_info: {
        category: category,
        start_date: finalStartDate.toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Neon Insertion Error:', error.message);
    return res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
}
