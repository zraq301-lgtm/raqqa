import { neon } from '@neondatabase/serverless';

// الاتصال بقاعدة بيانات Neon باستخدام المتغير الأول
const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  // استقبال الطلبات من نوع POST فقط
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // 1. قراءة الـ secret المرسل في الرابط والتحقق منه مع المتغير الثاني
  const { secret } = req.query;
  const WEBHOOK_SECRET = process.env.SUPABASE_WEBHOOK_SECRET;

  if (!secret || secret !== WEBHOOK_SECRET) {
    return res.status(401).json({ error: 'Unauthorized request' });
  }

  // 2. استقبال بيانات المستخدم القادمة من Supabase
  const { record, type } = req.body;

  // التأكد من أن العملية هي إنشاء حساب جديد INSERT
  if (type === 'INSERT' && record) {
    const { id, email } = record;

    try {
      // إدخال الـ ID والـ Email في قاعدة بيانات Neon
      await sql`
        INSERT INTO users (id, email)
        VALUES (${id}, ${email})
        ON CONFLICT (id) DO NOTHING;
      `;

      return res.status(200).json({ success: true, message: 'User synced to Neon successfully' });
    } catch (dbError) {
      console.error('Neon DB Error:', dbError);
      return res.status(500).json({ error: 'Database insertion failed' });
    }
  }

  return res.status(200).json({ received: true });
}
