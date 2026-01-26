import { createPool } from '@vercel/postgres';

// إنشاء اتصال مستقر باستخدام المفتاح الظاهر في إعداداتك
const pool = createPool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false } // ضروري لتجنب مشاكل شهادات SSL مع Neon
});

export default async function handler(req, res) {
  // تفعيل CORS للسماح بالطلبات من واجهة الإدارة
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'الطريقة غير مسموح بها' });
  }

  const { title, video_url, ad_type, ad_content, company_name } = req.body;

  // التحقق من وجود البيانات الأساسية
  if (!title || !video_url) {
    return res.status(400).json({ error: 'يرجى إدخال عنوان الفيديو والرابط' });
  }

  let client;
  try {
    client = await pool.connect();
    
    // تنفيذ الاستعلام لإدخال الفيديو وبيانات الإعلان في جدول نيون
    const query = `
      INSERT INTO media_hub (title, video_url, ad_type, ad_content, company_name)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id;
    `;
    
    const values = [title, video_url, ad_type, ad_content, company_name];
    const result = await client.query(query, values);

    return res.status(200).json({ 
      success: true, 
      message: 'تم الحفظ بنجاح!', 
      id: result.rows[0].id 
    });

  } catch (error) {
    console.error('Database Error:', error);
    return res.status(500).json({ 
      error: 'فشل الاتصال بقاعدة البيانات', 
      details: error.message 
    });
  } finally {
    if (client) client.release(); // إغلاق الاتصال فوراً لتوفير موارد نيون
  }
}
