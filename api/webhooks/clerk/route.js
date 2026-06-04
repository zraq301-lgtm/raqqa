import { NextResponse } from 'next/server';
import { Client } from 'pg';
import { Webhook } from 'svix';

export async function POST(req) {
  let client = null;

  try {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
    if (!WEBHOOK_SECRET) {
      console.error("❌ خطأ: يرجى إضافة CLERK_WEBHOOK_SECRET في إعدادات فيرسل");
      return NextResponse.json({ error: "Server configuration missing" }, { status: 500 });
    }

    // جلب الـ Headers المطلوبة للتحقق من التوقيع الرقمي لـ Clerk
    const headerPayload = req.headers;
    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");

    if (!svix_id || !svix_timestamp || !svix_signature) {
      return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
    }

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
      console.error("❌ فشل التحقق من توقيع الـ Webhook:", err.message);
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
    }

    const payload = evt;

    if (payload.type === 'user.created') {
      const clerkId = payload.data.id;
      const email = payload.data.email_addresses?.[0]?.email_address;

      if (!clerkId || !email) {
        return NextResponse.json({ error: "Missing clerkId or email from Clerk payload" }, { status: 400 });
      }

      if (!process.env.DATABASE_URL) {
        return NextResponse.json({ error: "Database URL missing on Vercel" }, { status: 500 });
      }

      client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }, 
      });

      await client.connect();

      // تسجيل أولي سريع جداً للمستخدم لضمان وجود الهوية داخل نيون فوراً
      // (ملاحظة: يمكنك إعداد جدول مبسط لحفظ الحسابات الأساسية قبل التهيئة الشاملة)
      const queryText = `
        INSERT INTO public.users (clerk_id, email, created_at) 
        VALUES ($1, $2, NOW()) 
        ON CONFLICT (clerk_id) DO UPDATE SET email = $2
        RETURNING clerk_id;
      `;
      const result = await client.query(queryText, [clerkId, email]);
      
      console.log(`[Clerk Webhook] 🚀 تم تسجيل هوية مستخدم جديد بنجاح: ${result.rows[0].clerk_id}`);
      
      return NextResponse.json({ 
        success: true, 
        message: "User identity synchronized successfully." 
      }, { status: 200 });
    }

    return NextResponse.json({ message: "Webhook received but ignoring event." }, { status: 200 });

  } catch (error) {
    console.error("🔥 Internal Error in Clerk Webhook Route:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  } finally {
    if (client) {
      await client.end();
    }
  }
}
