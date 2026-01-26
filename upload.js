import { db } from '@vercel/postgres';

export default async function handler(req, res) {
  // تفعيل CORS للسماح بالوصول من لوحة الإدارة الخاصة بكِ
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { title, video_url, ad_type, ad_content, company_name } = req.body;

  try {
    const client = await db.connect();
    
    // إدخال البيانات في جدول نيون
    // ملاحظة: تأكدي من إنشاء الجدول في نيون أولاً بنفس هذه الأسماء
    await client.sql`
      INSERT INTO videos_table (title, video_url, ad_type, ad_content, company_name)
      VALUES (${title}, ${video_url}, ${ad_type}, ${ad_content}, ${company_name});
    `;

    return res.status(200).json({ success: true, message: "تم الحفظ في نيون بنجاح!" });
  } catch (error) {
    console.error('Neon Connection Error:', error);
    return res.status(500).json({ 
      error: "فشل الاتصال بـ Neon", 
      details: error.message 
    });
  }
}
