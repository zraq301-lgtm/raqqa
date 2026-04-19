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
  try {
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  } catch (e) {
    console.error("Firebase Admin Init Error:", e);
  }
}

// 2. إعداد قاعدة بيانات نيون
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 1 // مهم جداً في Vercel لمنع تجاوز عدد الاتصالات المسموح به
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
    // التحقق من التوثيق
    if (headers['zazotona'] !== '12sonds25') {
      return res.status(401).json({ success: false, error: 'Unauthorized Access' });
    }

    // --- الجزء الخاص بجلب مقالات وردبريس وتخزينها في نيون ---
    if (method === 'GET' && req.query.sync === 'wordpress') {
      for (const catId of WP_CATEGORY_IDS) {
        try {
          const wpResponse = await fetch(`${WP_API_BASE}/posts?categories=${catId}&per_page=1`);
          const posts = await wpResponse.json();
          
          if (Array.isArray(posts) && posts.length > 0) {
            const post = posts[0];
            await pool.query(`
              INSERT INTO notifications (title, body, category, post_id, is_sent, scheduled_for)
              VALUES ($1, $2, $3, $4, false, NOW())
              ON CONFLICT (post_id) DO NOTHING
            `, [
              post.title.rendered, 
              post.excerpt.rendered.replace(/<[^>]*>/g, '').substring(0, 200), 
              String(catId), 
              String(post.id)
            ]);
          }
        } catch (e) { console.error(`WP Sync Error for ${catId}:`, e.message); }
      }
    }

    let notificationsToSend = [];

    if (method === 'GET') {
      const { user_id } = req.query;
      const { rows } = await pool.query(`
        SELECT id, title, body, category, fcm_token, post_id
        FROM notifications 
        WHERE (user_id = $1 OR $1 IS NULL)
        AND is_sent = false
        AND scheduled_for <= NOW()
        ORDER BY scheduled_for ASC
        LIMIT 10
      `, [user_id || null]);
      notificationsToSend = rows;
    } 
    else if (method === 'POST') {
      const { fcmToken, title, body, category, type, postId, image } = req.body;
      
      if (postId) {
        const { rows: existing } = await pool.query(`SELECT id FROM notifications WHERE post_id = $1 AND is_sent = true LIMIT 1`, [String(postId)]);
        if (existing.length > 0) return res.status(200).json({ success: true, message: "Sent before." });
      }

      notificationsToSend = [{ 
        fcm_token: fcmToken, 
        title, body, category, 
        post_id: postId, wpImage: image,
        isWordPress: type === "wordpress_article"
      }];
    }

    if (notificationsToSend.length === 0) {
      return res.status(200).json({ success: true, message: "No pending tasks." });
    }

    const results = await Promise.all(notificationsToSend.map(async (item) => {
      const categoryKey = item.category || '10783713';
      const categoryLabel = CATEGORY_MAP[categoryKey] || 'رقة';
      const imageUrl = item.wpImage || `${BASE_ASSETS_URL}/${categoryKey}.png`;
      
      let finalTitle = item.title || "رقة 🌸";
      let finalBody = item.body || "اكتشفي الجديد في تطبيق رقة";

      // تحسين النص بالذكاء الاصطناعي للسجلات القادمة من نيون
      if (item.id) {
        try {
          const aiRes = await fetch(AI_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              prompt: `بناءً على مقال "${finalTitle}" في قسم "${categoryLabel}"، اكتب إشعاراً قصيراً جداً.` 
            })
          });
          const aiData = await aiRes.json();
          finalBody = aiData.message || aiData.text || finalBody;
        } catch (e) { console.warn("AI skipped."); }
      }

      const message = {
        notification: { title: finalTitle, body: finalBody, image: imageUrl },
        data: { image: imageUrl, category: String(categoryKey), post_id: String(item.post_id || "") },
        android: { priority: "high", notification: { image: imageUrl, channelId: "default" } },
        apns: { payload: { aps: { mutableContent: true } }, fcm_options: { image: imageUrl } }
      };

      if (item.isWordPress || !item.fcm_token) {
        message.topic = "all_users";
      } else {
        message.token = item.fcm_token;
      }

      try {
        await admin.messaging().send(message);
        if (item.id) {
          await pool.query('UPDATE notifications SET is_sent = true WHERE id = $1', [item.id]);
        }
        return { status: 'success', id: item.id || item.post_id };
      } catch (e) {
        return { status: 'error', error: e.message };
      }
    }));

    return res.status(200).json({ success: true, results });

  } catch (error) {
    console.error("Critical Error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
