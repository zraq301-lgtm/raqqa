import { NextResponse } from 'next/server';
import { Client } from 'pg';
import { Webhook } from 'svix'; // مكتبة التحقق من أمان طلبات Clerk

export async function POST(req) {
  let client = null;

  try {
    const headerPayload = req.headers;
    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");

    let payload;

    // 1. فحص هل الطلب قادم من Clerk (يحتوي على هيدرز Svix) أم طلب يدوي من الواجهة
    if (svix_id && svix_timestamp && svix_signature) {
      // الطلب قادم من Clerk -> نطبق الحقق الصارم لحماية الـ Webhook
      const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
      if (!WEBHOOK_SECRET) {
        console.error("خطأ: يرجى إضافة CLERK_WEBHOOK_SECRET في إعدادات فيرسل");
        return NextResponse.json({ error: "Server configuration missing" }, { status: 500 });
      }

      const body = await req.text();
      const wh = new Webhook(WEBHOOK_SECRET);
      
      try {
        payload = wh.verify(body, {
          "svix-id": svix_id,
          "svix-timestamp": svix_timestamp,
          "svix-signature": svix_signature,
        });
      } catch (err) {
        console.error("فشل التحقق من توقيع الـ Webhook القادم من Clerk:", err.message);
        return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
      }
    } else {
      // الطلب يدوي وقادم مباشرة من واجهة التطبيق الخاص بك (Manual Trigger)
      // نقرأ البيانات مباشرة كـ JSON
      payload = await req.json();
      console.log("[API] تم استقبال طلب تهيئة يدوي مباشرة من واجهة التطبيق.");
    }

    // 2. معالجة البيانات بعد استخراج الـ payload بنجاح من أي من المصدرين
    if (payload && payload.type === 'user.created') {
      const clerkId = payload.data.id;
      // جلب الإيميل بشكل مرن يدعم صيغة Clerk وصيغة الطلب اليدوي الخاص بك
      const email = payload.data.email_addresses?.[0]?.email_address || payload.data.email;

      if (!clerkId || !email) {
        return NextResponse.json({ error: "Missing clerkId or email in data payload" }, { status: 400 });
      }

      // 3. الاتصال بقاعدة بيانات نيون (Neon)
      if (!process.env.DATABASE_URL) {
        console.error("خطأ: متغير DATABASE_URL غير معرف في فيرسل");
        return NextResponse.json({ error: "Database configuration missing" }, { status: 500 });
      }

      client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }, 
      });

      await client.connect();

      // 4. استدعاء وظيفة بناء الجداول الـ 9 داخل نيون
      const result = await client.query(
        'SELECT public.init_user_schema($1, $2) as schema_name;', 
        [clerkId, email]
      );
      
      const createdSchema = result.rows[0].schema_name;
      console.log(`[Vercel & Neon] تم بناء السكيما بنجاح للمستخدم: ${createdSchema}`);
      
      return NextResponse.json({ 
        success: true, 
        message: `Schema ${createdSchema} initialized successfully.` 
      }, { status: 200 });
    }

    return NextResponse.json({ message: "Event received but no action taken." }, { status: 200 });

  } catch (error) {
    console.error("Internal Error in Clerk Webhook Route:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  } finally {
    // إغلاق الاتصال دائماً لحماية خادم نيون وسيرفرليس فيرسل
    if (client) {
      await client.end();
    }
  }
}
