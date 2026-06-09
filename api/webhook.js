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

  // 2. استقبال بيانات المستخدم القادمة من Supabase Webhook
  const { record, type } = req.body;

  // التأكد من أن العملية هي إنشاء حساب جديد INSERT
  if (type === 'INSERT' && record) {
    // استخراج المعرف، الإيميل، وتوكن الإشعارات المستلم من ميتاداتا سوبابيز
    const { id, email, fcm_token } = record;

    try {
      console.log(`جاري تهيئة الحساب وإنشاء السكيما للمستخدم: ${email}`);

      /* استدعاء الدالة الذكية المخزنة في نيون:
        المعامل الأول: id (والذي يمثل الـ clerk_id أو supabase_id في الجدول المرجعي)
        المعامل الثاني: email
        المعامل الثالث: fcm_token (لتخزينه في عمود device_token)
      */
      const result = await sql`
        SELECT public.init_user_schema(
          ${id}, 
          ${email}, 
          ${fcm_token || null}
        ) AS created_schema_name;
      `;

      const schemaName = result[0]?.created_schema_name;

      console.log(`تم إنشاء السكيما بنجاح باسم: ${schemaName}`);

      return res.status(200).json({ 
        success: true, 
        message: 'User synced and full isolated schema created successfully',
        schema: schemaName
      });

    } catch (dbError) {
      // طباعة تفاصيل الخطأ الحقيقية في سجلات فيرسل لتسهيل التتبع
      console.error('Neon DB/Schema Initialization Error:', dbError.message);
      return res.status(500).json({ error: 'Failed to initialize user schema in Neon', details: dbError.message });
    }
  }

  return res.status(200).json({ received: true });
}
