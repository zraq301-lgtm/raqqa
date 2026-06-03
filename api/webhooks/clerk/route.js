import { NextResponse } from 'next/server';
import { Client } from 'pg';
import { Webhook } from 'svix'; // مكتبة التحقق من أمان طلبات Clerk

export async function POST(req) {
  // تعريف متغير العميل خارج الـ try لتأمين إغلاقه في الـ finally
  let client = null;

  try {
    // 1. التحقق من أمان الـ Webhook لمنع أي طلبات خبيثة خارجية
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
    
    if (!WEBHOOK_SECRET) {
      console.error("خطأ: يرجى إضافة CLERK_WEBHOOK_SECRET في إعدادات فيرسل");
      return NextResponse.json({ error: "Server configuration missing" }, { status: 500 });
    }

    // جلب الـ Headers المطلوبة للتحقق من التشفير
    const headerPayload = req.headers;
    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");

    if (!svix_id || !svix_timestamp || !svix_signature) {
      return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
    }

    // جلب نص الطلب الخام للتحقق من التوقيع الرقمي
    const body = await req.text();
    const wh = new Webhook(WEBHOOK_SECRET);
    
    let evt;
    try {
      evt = wh.verify(body, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      });
    } catch (err) {
      console.error("فشل التحقق من توقيع الـ Webhook القادم:", err.message);
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
    }

    // 2. معالجة الحدث بعد التأكد من أمانه 
    const payload = evt; // البيانات الموثوقة الآن

    if (payload.type === 'user.created') {
      const clerkId = payload.data.id;
      const email = payload.data.email_addresses[0]?.email_address;

      if (!email) {
        return NextResponse.json({ error: "Missing email from Clerk" }, { status: 400 });
      }

      // 3. الاتصال بـ نيون باستخدام DATABASE_URL الممرر عبر فيرسل
      client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }, 
      });

      await client.connect();

      // 4. استدعاء الوظيفة الذكية المنشأة في نيون لبناء السكيما والـ 9 جداول
      const result = await client.query(
        'SELECT public.init_user_schema($1, $2) as schema_name;', 
        [clerkId, email]
      );
      
      const createdSchema = result.rows[0].schema_name;

      console.log(`[Vercel & Neon] تم إنشاء السكيما والجداول الـ 9 بنجاح للمستخدمة: ${createdSchema}`);
      
      return NextResponse.json({ 
        success: true, 
        message: `Schema ${createdSchema} initialized successfully.` 
      }, { status: 200 });
    }

    return NextResponse.json({ message: "Event received but no action needed." }, { status: 200 });

  } catch (error) {
    console.error("Internal Error in Clerk Webhook:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  } finally {
    // الضمان الهندسي الأهم لسيرفرات Vercel Serverless:
    // إغلاق الاتصال دائماً وأبداً سواء نجح الطلب أو فشل لمنع استهلاك اتصالات نيون
    if (client) {
      await client.end();
    }
  }
}
