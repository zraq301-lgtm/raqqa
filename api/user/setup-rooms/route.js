import { NextResponse } from 'next/server';
import { Client } from 'pg';

export async function POST(req) {
  let client = null;

  try {
    // قراءة البيانات المرسلة يدوياً من كامبوننت ProfileSetup مباشرة كـ JSON
    const payload = await req.json();
    console.log("[Setup API] ⚙️ تم استقبال طلب يدوي لتهيئة السكيما والجداول الـ 9.");

    // التحقق من صحة المتغيرات الممررة من دالة handleResetDatabase بالواجهة
    const clerkId = payload?.data?.id;
    const email = payload?.data?.email_addresses?.[0]?.email_address || payload?.data?.email;

    if (!clerkId || !email) {
      return NextResponse.json({ error: "Missing identity metadata (clerkId or email)" }, { status: 400 });
    }

    if (!process.env.DATABASE_URL) {
      console.error("❌ خطأ: متغير DATABASE_URL غير معرف في فيرسل");
      return NextResponse.json({ error: "Database infrastructure configuration missing" }, { status: 500 });
    }

    client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }, 
    });

    await client.connect();

    console.log(`[Neon DB] ⏳ جاري بدء الإجراء المخزن لبناء السكيما للمستخدم: ${email}`);

    // استدعاء الوظيفة الثقيلة والذكية لبناء السكيما والـ 9 جداول المنفصلة
    const result = await client.query(
      'SELECT public.init_user_schema($1, $2) as schema_name;', 
      [clerkId, email]
    );
    
    const createdSchema = result.rows[0].schema_name;
    console.log(`[Neon DB] ✨ تم فرش وبناء الغرف الـ 9 لـ السكيما المستقلة: ${createdSchema}`);
    
    return NextResponse.json({ 
      success: true, 
      message: `Schema ${createdSchema} initialized with 9 rooms successfully.` 
    }, { status: 200 });

  } catch (error) {
    console.error("🔥 Internal Error in Setup Rooms Route:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  } finally {
    // الأمان الهندسي الأهم لـ Serverless لمنع تراكم اتصالات الخادم المفتوحة
    if (client) {
      await client.end();
    }
  }
}
