// api/upload.js (Vercel Serverless Function)
import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { title, video_url, ad_type, ad_content, company_name } = req.body;

    try {
      // إدراج البيانات في جدول نيون باستخدام POSTGRES_URL المعرف في بيئتك
      await sql`
        INSERT INTO media_hub (title, video_url, ad_type, ad_content, company_name)
        VALUES (${title}, ${video_url}, ${ad_type}, ${ad_content}, ${company_name});
      `;
      return res.status(200).json({ message: 'تم الحفظ بنجاح في نيون!' });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}
