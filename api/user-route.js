import { Client } from 'pg';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  let client = null;

  try {
    const payload = req.body;
    console.log("[Setup API] ⚙️ تم بدء معالجة الطلب اليدوي لبناء السكيما والغرف الـ 9.");

    const clerkId = payload?.data?.id;
    const email = payload?.data?.email_addresses?.[0]?.email_address || payload?.data?.email;

    if (!clerkId || !email) {
      return res.status(400).json({ error: "Missing identity parameters (clerkId or email)" });
    }

    if (!process.env.DATABASE_URL) {
      return res.status(500).json({ error: "DATABASE_URL environment variable is missing on Vercel" });
    }

    client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }, 
    });

    await client.connect();

    // استدعاء الفانكشن المسؤولة عن بناء جداول السكيما التسعة في نيون
    const result = await client.query(
      'SELECT public.init_user_schema($1, $2) as schema_name;', 
      [clerkId, email]
    );
    
    const createdSchema = result.rows[0].schema_name;
    console.log(`[Neon DB] ✨ تم فرش السكيما والغرف الـ 9 بنجاح: ${createdSchema}`);
    
    return res.status(200).json({ 
      success: true, 
      message: `Schema ${createdSchema} initialized with 9 tables successfully.` 
    });

  } catch (error) {
    console.error("🔥 Internal Error in Setup Rooms Route:", error);
    return res.status(500).json({ error: "Internal Server Error", details: error.message });
  } finally {
    if (client) {
      await client.end();
    }
  }
}
