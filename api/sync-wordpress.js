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
  const { method, headers, query } = req;
  const AI_API_URL = "https://raqqa-hjl8.vercel.app/api/raqqa-ai";
  const WP_API_BASE = "https://public-api.wordpress.com/wp/v2/sites/raqqastor3.wordpress.com";

  try {
    // 1. التحقق الأمني
    if (headers['zazotona'] !== '12sonds25') {
      return res.status(401).json({ error: 'Unauthorized Access' });
    }

    // 2. السماح بطلب GET (القادم من الأكشن الجديد)
    if (method === 'GET' && query.sync === 'wordpress') {
      console.log("--- Starting Full Sync Logic ---");
      let results = [];

      for (const catId of Object.keys(CATEGORY_MAP)) {
        // جلب المقال من وردبريس
        const wpRes = await fetch(`${WP_API_BASE}/posts?categories=${catId}&per_page=1&_embed`);
        const posts = await wpRes.json();

        if (posts && posts.length > 0) {
          const post = posts[0];
          const cleanId = String(post.id).trim();

          // الفحص في نيون
          const { rows: existing } = await pool.query(
            `SELECT post_id FROM sent_posts WHERE post_id = $1 LIMIT 1`, [cleanId]
          );

          if (existing.length === 0) {
            // مقال جديد تماماً
            const categoryLabel = CATEGORY_MAP[catId];
            const featuredImage = post.jetpack_featured_media_url || (post._embedded?.['wp:featuredmedia']?.[0]?.source_url) || "";
            let finalTitle = post.title.rendered;
            let finalBody = "اكتشفي أسرار الجمال الجديدة في تطبيق رقة 🌸";

            // طلب الذكاء الاصطناعي
            try {
              const aiRes = await fetch(AI_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  prompt: `صيغي إشعاراً جذاباً لقسم ${categoryLabel} بعنوان: ${finalTitle}.` 
                })
              });
              const aiData = await aiRes.json();
              finalTitle = aiData.title || finalTitle;
              finalBody = aiData.message || aiData.text || finalBody;
            } catch (e) { console.warn("AI Error, skipping AI."); }

            // إرسال Firebase
            const messagePayload = {
              notification: { title: finalTitle, body: finalBody, image: featuredImage },
              data: { image: featuredImage, category: String(catId), post_id: cleanId, click_action: "FLUTTER_NOTIFICATION_CLICK" },
              topic: "all_users"
            };
            const messageId = await admin.messaging().send(messagePayload);

            // الحفظ في نيون
            await pool.query(
              `INSERT INTO sent_posts (post_id, title) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
              [cleanId, finalTitle]
            );

            results.push({ cat: categoryLabel, id: cleanId, status: 'sent' });
          } else {
            results.push({ cat: CATEGORY_MAP[catId], id: cleanId, status: 'skipped' });
          }
        }
      }
      return res.status(200).json({ success: true, results });
    }

    // إذا كان الطلب POST (للتوافق مع الأنظمة القديمة إن وجدت)
    if (method === 'POST') {
      // ... كود الـ POST القديم الخاص بك يمكن أن يبقى هنا أو تكتفي بـ GET ...
      return res.status(200).json({ message: "Please use GET with sync=wordpress for automation" });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });

  } catch (error) {
    console.error("API Error:", error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
}
