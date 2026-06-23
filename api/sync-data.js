 import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  // استقبال توكن المستخدم، والبيانات المحلية المراد حفظها في جداوله
  const { userToken, email, localData, targetTable } = req.body;

  if (!email || !localData || !targetTable) {
    return res.status(400).json({ success: false, error: 'بيانات المزامنة ناقصة ❌' });
  }

  const sql = neon(process.env.DATABASE_URL);

  try {
    // 1. التحقق من توكن المستخدم وأنه مسجل في السكيما العامة public
    const userRows = await sql`SELECT id FROM public.users WHERE email = ${email} AND user_token = ${userToken}`;
    
    if (userRows.length === 0) {
      return res.status(401).json({ success: false, error: 'جلسة المستخدم غير صالحة أو غير مسجل 🔒' });
    }

    const userId = userRows[0].id;
    // اسم السكيما الديناميكية الخاصة بالمستخدم بناءً على الـ ID الخاص به
    const userSchemaName = `user_${userId}`; 

    // 2. إدخال البيانات القادمة من الأندرويد داخل جدول المستخدم المحدد ديناميكياً
    // تحويل البيانات لـ JSON لإدخالها بأمان
    const dataString = JSON.stringify(localData);

    // استعلام ديناميكي لإدخال البيانات في سكيما العميل (مثلاً في جدول الـ offline_events أو المحتوى الخاص به)
    // ملاحظة: تأكد من تطابق أسماء الأعمدة في جداول السكيما الديناميكية لديك
    await sql(`
      INSERT INTO ${userSchemaName}.${targetTable} (payload, synced_at)
      VALUES ($1, NOW());
    `, [dataString]);

    return res.status(200).json({ success: true, message: 'تمت المزامنة وحفظ البيانات بنجاح في جداولك الحية ✨' });

  } catch (error) {
    console.error("❌ خطأ أثناء مزامنة بيانات الأندرويد:", error);
    return res.status(500).json({ success: false, error: 'فشل خادم نيون في حفظ البيانات', details: error.message });
  }
}
