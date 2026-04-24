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
  const BASE_ASSETS_URL = "https://raqqa-hjl8.vercel.app/assets/notifications";

  try {
    if (headers['zazotona'] !== '12sonds25') {
      return res.status(401).json({ success: false, error: 'Unauthorized Access' });
    }

    if (method !== 'POST') {
      return res.status(405).json({ success: false, error: 'Method Not Allowed' });
    }

    // تنظيف البيانات القادمة لضمان عدم وجود مسافات خفية
    const postIdRaw = req.body.postId;
    const cleanPostId = String(postIdRaw).trim();
    const { title, body, category, image, type } = req.body;

    if (!cleanPostId || cleanPostId === "undefined" || cleanPostId === "null") {
       return res.status(400).json({ success: false, error: 'Invalid Post ID' });
    }

    // 1. الفحص الصارم في قاعدة البيانات
    if (type === "wordpress_article") {
      const checkQuery = `SELECT id FROM sent_posts WHERE TRIM(CAST(post_id AS TEXT)) = $1 LIMIT 1`;
      const { rows: existing } = await pool.query(checkQuery, [cleanPostId]);

      if (existing.length > 0) {
        console.log(`[ALREADY SENT] Skipping Post ID: ${cleanPostId}`);
        return res.status(200).json({ 
          success: true, 
          skipped: true, 
          message: `المقال ${cleanPostId} موجود مسبقاً في قاعدة البيانات.` 
        });
      }
    }

    // 2. إذا وصلنا هنا يعني المقال جديد فعلاً
    const categoryKey = category || '10783713';
    const categoryLabel = CATEGORY_MAP[categoryKey] || 'رقة';
    const imageUrl = image || `${BASE_ASSETS_URL}/${categoryKey}.png`;
    
    let finalTitle = title || "رقة 🌸";
    let finalBody = body || "اكتشفي الجديد في تطبيق رقة";

    // 3. الذكاء الاصطناعي
    try {
      const aiRes = await fetch(AI_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: `بصفتك خبيرة محتوى، صِيغي إشعاراً جذاباً جداً وقصيراً. القسم: ${categoryLabel}. العنوان: ${finalTitle}.`
        })
      });
      const aiData = await aiRes.json();
      finalTitle = aiData.title || finalTitle;
      finalBody = aiData.message || aiData.text || aiData.body || finalBody;
    } catch (e) { console.warn("AI Error, using original."); }

    // 4. إرسال Firebase
    const messagePayload = {
      notification: { title: finalTitle, body: finalBody, image: imageUrl },
      data: { 
        image: imageUrl, 
        category: String(categoryKey),
        post_id: cleanPostId,
        click_action: "FLUTTER_NOTIFICATION_CLICK"
      },
      topic: "all_users"
    };

    const messageId = await admin.messaging().send(messagePayload);

    // 5. الحفظ في نيون - الخطوة الأهم
    // استخدمنا ON CONFLICT لضمان عدم حدوث خطأ إذا حاول الأكشن الإرسال مرتين في نفس اللحظة
    await pool.query(
      `INSERT INTO sent_posts (post_id, title, sent_at) 
       VALUES ($1, $2, NOW()) 
       ON CONFLICT (post_id) DO NOTHING`, 
      [cleanPostId, finalTitle]
    );

    console.log(`[SUCCESS] Notification sent for Post ID: ${cleanPostId}`);
    return res.status(200).json({ success: true, messageId, status: "sent", postId: cleanPostId });

  } catch (error) {
    console.error("API Error:", error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
}
