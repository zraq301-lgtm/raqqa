import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  // استقبال البيانات القادمة من الأندرويد
  // ملحوظة: استبدلنا userToken بـ clerkId ليتطابق مع نظام الحسابات الجديد
  const { clerkId, email, localData, targetTable } = req.body;

  if (!email || !localData || !targetTable) {
    return res.status(400).json({ success: false, error: 'بيانات المزامنة ناقصة ❌' });
  }

  const sql = neon(process.env.DATABASE_URL);

  try {
    // 1. التحقق من وجود المستخدم وجلب اسم السكيما الخاصة به من الجدول العام الصحيح global_users
    const userRows = await sql`
      SELECT schema_name 
      FROM public.global_users 
      WHERE email = ${email} AND clerk_id = ${clerkId}
    `;
    
    if (userRows.length === 0) {
      return res.status(401).json({ success: false, error: 'جلسة المستخدم غير صالحة أو غير مسجل في النظام الموحد 🔒' });
    }

    // جلب اسم السكيما الحقيقي والمستقل للمستخدم (مثل user_clerk123)
    const userSchemaName = userRows[0].schema_name; 

    // 2. فحص نوع الجدول المستهدف (targetTable) لصب البيانات بالشكل الصحيح
    const dataString = JSON.stringify(localData);

    // إذا كان الجدول المستهدف من الجداول العامة المعتمدة على payload نصي (مثل offline_events, health, feelings, intimacy, swing, insight)
    if (['offline_events', 'health', 'feelings', 'intimacy', 'swing', 'insight', 'motherhood_tracker', 'fitness_wellness', 'doctor_appointments', 'marital_intimacy', 'psychological_wellness'].includes(targetTable)) {
      
      // فحص إذا كان الجدول يحتوي على عمود payload أو يحتاج هيكلة مرنة
      try {
        await sql(`
          INSERT INTO ${userSchemaName}.${targetTable} (payload, synced_at)
          VALUES ($1, NOW());
        `, [dataString]);
      } catch (tableErr) {
        // خطة احتياطية إذا كانت الجداول تستخدم عمود إدخال إضافي JSONB مثل الـ Trackers الأصلية
        await sql(`
          INSERT INTO ${userSchemaName}.${targetTable} (additional_data)
          VALUES ($1::jsonb);
        `, [dataString]);
      }

    } else {
      // الجداول الخاصة بالـ Trackers (مثل period_tracker أو pregnancy_tracker أو breastfeeding_tracker)
      // صب البيانات مباشرة داخل عمود الـ additional_data كـ JSONB
      await sql(`
        INSERT INTO ${userSchemaName}.${targetTable} (additional_data)
        VALUES ($1::jsonb);
      `, [dataString]);
    }

    return res.status(200).json({ 
      success: true, 
      message: `تمت المزامنة وحفظ البيانات بنجاح في جدولك المستهدف [${targetTable}] داخل مساحتك المعزولة ✨` 
    });

  } catch (error) {
    console.error("❌ خطأ أثناء مزامنة بيانات الأندرويد:", error);
    return res.status(500).json({ success: false, error: 'فشل خادم نيون في معالجة وحفظ بيانات المزامنة', details: error.message });
  }
}
