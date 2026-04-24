import pkg from 'pg';
import admin from 'firebase-admin';

const { Pool } = pkg;

// 1. إعداد Firebase Admin (Singleton)
const serviceAccount = {
  "type": "service_account",
  "project_id": "raqqa-43dc8",
  "client_email": "firebase-adminsdk-fbsvc@raqqa-43dc8.iam.gserviceaccount.com",
  "private_key": process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
};

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

// 2. إعداد قاعدة بيانات نيون
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

const WP_CATEGORY_IDS = [788594722, 788519318, 768006428, 788485478, 10783713, 788402012, 347212703];

export default async function handler(req, res) {
  const { method, headers } = req;
  const AI_API_URL = "https://raqqa-hjl8.vercel.app/api/raqqa-ai";
  const BASE_ASSETS_URL = "https://raqqa-hjl8.vercel.app/assets/notifications";
  const WP_API_BASE = "https://public-api.wordpress.com/wp/v2/sites/raqqastor3.wordpress.com";

  try {
    if (headers['zazotona'] !== '12sonds25') {
      return res.status(401).json({ success: false, error: 'Unauthorized Access' });
    }

    let notificationsToSend = [];

    // --- الوظيفة (أ): جلب المقالات مع الصور والتحقق من التكرار ---
    if (method === 'GET' && req.query.sync === 'wordpress') {
      for (const catId of WP_CATEGORY_IDS) {
        try {
          // أضفنا _embed لجلب بيانات الوسائط (المعلومات الإضافية مثل الصور)
          const wpRes = await fetch(`${WP_API_BASE}/posts?categories=${catId}&per_page=1&_embed`);
          const posts = await wpRes.json();
          
          if (posts && posts.length > 0) {
            const post = posts[0];
            const postIdStr = String(post.id);

            const { rows: existing } = await pool.query(
              `SELECT id FROM sent_posts WHERE post_id = $1 LIMIT 1`,
              [postIdStr]
            );

            if (existing.length === 0) {
              // محاولة استخراج الصورة من عدة مصادر محتملة في رد ووردبريس
              const featuredImage = 
                post.jetpack_featured_media_url || 
                (post._embedded && post._embedded['wp:featuredmedia'] && post._embedded['wp:featuredmedia'][0]?.source_url) ||
                null;

              notificationsToSend.push({
                isWordPress: true,
                wpPostId: postIdStr,
                title: post.title.rendered,
                body: post.excerpt.rendered.replace(/<[^>]*>/g, ''),
                category: String(catId),
                wpImage: featuredImage
              });
            }
          }
        } catch (e) { 
          console.error(`Error checking category ${catId}:`, e.message); 
        }
      }
    }

    // --- الوظيفة (ب): POST ---
    else if (method === 'POST') {
      const { fcmToken, token, title, body, category, type, postId, image } = req.body;
      if (type === "wordpress_article" && postId) {
        const { rows: existing } = await pool.query(`SELECT id FROM sent_posts WHERE post_id = $1 LIMIT 1`, [String(postId)]);
        if (existing.length > 0) return res.status(200).json({ success: true, message: "تم الإرسال مسبقاً." });
        notificationsToSend = [{ isWordPress: true, wpPostId: postId, title, body, category, wpImage: image }];
      } else {
        notificationsToSend = [{ fcm_token: fcmToken || token, title, body, category, wpImage: image }];
      }
    }

    if (notificationsToSend.length === 0) {
      return res.status(200).json({ success: true, message: "لا يوجد جديد." });
    }

    const results = await Promise.all(notificationsToSend.map(async (item) => {
      const categoryKey = item.category || '10783713';
      const categoryLabel = CATEGORY_MAP[categoryKey] || 'رقة';
      
      // إذا لم توجد صورة للمقال، نستخدم الصورة الافتراضية للقسم
      const imageUrl = item.wpImage || `${BASE_ASSETS_URL}/${categoryKey}.png`;
      
      let finalTitle = item.title;
      let finalBody = item.body;

      // صياغة الإشعار بالذكاء الاصطناعي
      try {
        const aiRes = await fetch(AI_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            prompt: `بصفتك خبيرة محتوى لتطبيق "رقة" النسائي، حولي هذا العنوان والمحتوى إلى إشعار دفع (Push Notification) مشوق وقصير جداً.
            القسم: ${categoryLabel}
            العنوان: ${finalTitle}
            المحتوى: ${finalBody}
            اجعلي الأسلوب أنثوي، جذاب، واستخدمي إيموجي رقيق.`
          })
        });
        const aiData = await aiRes.json();
        finalTitle = aiData.title || finalTitle;
        finalBody = aiData.message || aiData.text || aiData.body || finalBody;
      } catch (e) { console.warn("AI Error, using original."); }

      const messagePayload = {
        notification: { 
          title: finalTitle, 
          body: finalBody, 
          image: imageUrl // صورة الإشعار الأساسية
        },
        data: { 
          image: imageUrl, 
          category: String(categoryKey),
          post_id: String(item.wpPostId || ""),
          click_action: "FLUTTER_NOTIFICATION_CLICK"
        },
        android: { 
          priority: "high", 
          notification: { image: imageUrl, sound: "default" } 
        },
        apns: { 
          payload: { aps: { mutableContent: true, sound: "default" } }, 
          fcm_options: { image: imageUrl } 
        },
        topic: "all_users"
      };

      try {
        const messageId = await admin.messaging().send(messagePayload);
        if (item.wpPostId) {
          await pool.query(
            'INSERT INTO sent_posts (post_id, title) VALUES ($1, $2) ON CONFLICT (post_id) DO NOTHING', 
            [String(item.wpPostId), finalTitle]
          );
        }
        return { status: 'sent', messageId };
      } catch (err) { return { status: 'error', error: err.message }; }
    }));

    return res.status(200).json({ success: true, results });

  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
