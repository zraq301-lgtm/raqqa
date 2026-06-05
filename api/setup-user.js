import { Client } from 'pg';

export default async function handler(req, res) {
  // استقبال الطلب من الـ Frontend
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { userId, email } = req.body;

  if (!userId || !email) {
    return res.status(400).json({ error: "بيانات المستخدم ناقصة" });
  }

  // الاتصال بـ نيون باستخدام الرابط الموجود في إعدادات فيرسل
  const client = new Client({
    connectionString: process.env.DATABASE_URL, // تأكد أن هذا الرابط هو الخاص بـ Neon
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();

    // 1. تنفيذ الدالة داخل نيون لفرش الجداول
    // ملاحظة: استبدلنا clerk_id بـ userId الآتي من سوبابيز
    const result = await client.query(
      'SELECT public.init_user_schema($1, $2) as schema_name;',
      [userId, email]
    );

    const schemaName = result.rows[0].schema_name;

    return res.status(200).json({
      success: true,
      message: `تم إنشاء مساحة المستخدمة بنجاح: ${schemaName}`,
    });

  } catch (error) {
    console.error("خطأ في نيون:", error);
    return res.status(500).json({ error: "فشل إنشاء الجداول في نيون", details: error.message });
  } finally {
    await client.end();
  }
}
