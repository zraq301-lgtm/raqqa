import pkg from 'pg';
import admin from 'firebase-admin';

const { Pool } = pkg;

const serviceAccount = {
  "type": "service_account",
  "project_id": "raqqa-43dc8",
  "client_email": "firebase-adminsdk-fbsvc@raqqa-43dc8.iam.gserviceaccount.com",
  "private_key": process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
};

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 1
});

const CATEGORY_MAP = {
  '788594722': 'العناية بالبشرة',
  '788519318': 'الأناقة',
  '768006428': 'الصحة',
  '788485478': 'الأمومة',
  '10783713': 'عام', 
  '788402012': 'الرشاقة',
  '347212703': 'وصفات'
};

export default async function handler(req, res) {
  const { method, headers } = req;
  const AI_API_URL = "https://raqqa-hjl8.vercel.app/api/raqqa-ai";

  try {
    if (headers['zazotona'] !== '12sonds25') return res.status(401).json({ error: 'Unauthorized' });
    if (method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    // استلام وتنظيف الـ ID
    const rawPostId = req.body.postId;
    const cleanId = String(rawPostId).trim();
    const { title, category, image, type } = req.body;

    console.log(`Checking Database for Post ID: "${cleanId}"`);

    // 1. الفحص الصارم
    const checkQuery = `SELECT post_id FROM sent_posts WHERE post_id = $1 OR post_id = $2 LIMIT 1`;
    // نفحص الرقم كـ نص وكـ رقم احتياطاً
    const { rows: existing } = await pool.query(checkQuery, [cleanId, cleanId.replace(/\s/g, '')]);

    if (existing.length > 0) {
      console.log(`[STOP] Post ${cleanId} already exists in Neon. Skipping Firebase.`);
      return res.status(200).json({ success: true, skipped: true, message: "موجود مسبقاً" });
    }

    // 2. إذا لم يوجد، نبدأ عملية الإرسال
    console.log(`[PROCEED] Post ${cleanId} is new. Starting AI and Firebase...`);

    const categoryLabel = CATEGORY_MAP[category] || 'رقة';
    let finalTitle = title;
    let finalBody = "مقال جديد بانتظارك في تطبيق رقة 🌸";

    // طلب الذكاء الاصطناعي
    try {
      const aiRes = await fetch(AI_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: `صيغي إشعاراً قصيراً جداً لقسم ${categoryLabel} بعنوان: ${finalTitle}. اجعليه جذاباً جداً.`
        })
      });
      const aiData = await aiRes.json();
      finalTitle = aiData.title || finalTitle;
      finalBody = aiData.message || aiData.text || aiData.body || finalBody;
    } catch (e) { console.error("AI Error"); }

    // إرسال Firebase
    const messagePayload = {
      notification: { title: finalTitle, body: finalBody, image: image },
      data: { image, category: String(category), post_id: cleanId, click_action: "FLUTTER_NOTIFICATION_CLICK" },
      topic: "all_users"
    };

    const messageId = await admin.messaging().send(messagePayload);

    // 3. التسجيل في قاعدة البيانات (أهم خطوة)
    await pool.query(
      `INSERT INTO sent_posts (post_id, title) VALUES ($1, $2) ON CONFLICT DO NOTHING`, 
      [cleanId, finalTitle]
    );

    console.log(`[DONE] Post ${cleanId} saved to Neon.`);
    return res.status(200).json({ success: true, status: "sent", messageId });

  } catch (error) {
    console.error("Critical Error:", error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
}
