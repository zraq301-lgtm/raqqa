import { Client } from 'pg';
import { Webhook } from 'svix';

export default async function handler(req, res) {
  // التأكد من أن الطلب POST فقط
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  let client = null;

  try {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
    if (!WEBHOOK_SECRET) {
      console.error("❌ خطأ: يرجى إضافة CLERK_WEBHOOK_SECRET في إعدادات فيرسل");
      return res.status(500).json({ error: "Server configuration missing" });
    }

    // جلب الـ Headers في Node.js القياسي
    const svix_id = req.headers["svix-id"];
    const svix_timestamp = req.headers["svix-timestamp"];
    const svix_signature = req.headers["svix-signature"];

    if (!svix_id || !svix_timestamp || !svix_signature) {
      return res.status(400).json({ error: "Missing svix headers" });
    }

    // في بيئة Vercel Node.js، يأتي الـ body جاهزاً ومحللاً إذا تم إعداده، 
    // ولكن Svix يحتاج الـ string الخام، لذا نقوم بتحويله إذا كان كائناً
    const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    
    const wh = new Webhook(WEBHOOK_SECRET);
    let payload;
    
    try {
      payload = wh.verify(body, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      });
    } catch (err) {
      console.error("❌ فشل التحقق من توقيع الـ Webhook:", err.message);
      return res.status(400).json({ error: "Invalid webhook signature" });
    }

    if (payload.type === 'user.created') {
      const clerkId = payload.data.id;
      const email = payload.data.email_addresses?.[0]?.email_address;

      if (!clerkId || !email) {
        return res.status(400).json({ error: "Missing clerkId or email" });
      }

      if (!process.env.DATABASE_URL) {
        return res.status(500).json({ error: "Database URL missing on Vercel" });
      }

      client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }, 
      });

      await client.connect();

      const queryText = `
        INSERT INTO public.users (clerk_id, email, created_at) 
        VALUES ($1, $2, NOW()) 
        ON CONFLICT (clerk_id) DO UPDATE SET email = $2
        RETURNING clerk_id;
      `;
      const result = await client.query(queryText, [clerkId, email]);
      
      console.log(`[Clerk Webhook] 🚀 تم تسجيل هوية مستخدم جديد: ${result.rows[0].clerk_id}`);
      return res.status(200).json({ success: true, message: "User identity synchronized." });
    }

    return res.status(200).json({ message: "Webhook received but no action needed." });

  } catch (error) {
    console.error("🔥 Internal Error in Clerk Webhook Route:", error);
    return res.status(500).json({ error: "Internal Server Error", details: error.message });
  } finally {
    if (client) {
      await client.end();
    }
  }
}
