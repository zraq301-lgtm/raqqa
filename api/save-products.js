import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  // 1. التأكد أن الطلب من نوع POST (الذي سيرسله جيت هب)
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // 2. الاتصال بقاعدة بيانات نيون
  const sql = neon(process.env.POSTGRES_PRISMA_URL);

  try {
    const productsJson = req.body; // البيانات القادمة من جيت هب بعد تحويلها لـ JSON

    // 3. عملية المسح والضخ (Transaction) لضمان عدم حدوث خطأ
    await sql.transaction([
      sql`TRUNCATE TABLE roqa_products`,
      sql`INSERT INTO roqa_products (product_data) VALUES (${JSON.stringify(productsJson)})`
    ]);

    return res.status(200).json({ message: 'تم تحديث المنتجات بنجاح في نيون' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'فشل في تحديث البيانات' });
  }
}
