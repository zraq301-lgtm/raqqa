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

// الأقسام والـ IDs الخاصة بوردبريس (تمت إضافة المعرف الجديد)
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

    // --- الوظيفة (أ): جلب المقالات من وردبريس وحفظها في نيون (Sync) ---
    if (method === 'GET' && req.query.sync === 'wordpress') {
      for (const catId of WP_CATEGORY_IDS) {
        try {
          const wpRes = await fetch(`${WP_API_BASE}/posts?categories=${catId}&per_page=1`);
          const posts = await wpRes.json();
          if (posts && posts.length > 0) {
            const post = posts[0];
            await pool.query(`
              INSERT INTO notifications (title, body, category, post_id, is_sent, scheduled_for)
              VALUES ($1, $2, $3, $4, false, NOW())
              ON CONFLICT (post_id) DO NOTHING
            `, [post.title.rendered, post.excerpt.rendered.replace(/<[^>]*>/g, ''), String(catId), String(post.id)]);
          }
        } catch (e) { console.error(`Error syncing category ${catId}:`, e.message); }
      }
      if (!req.query.process) return res.status(200).json({ success: true, message: "تمت مزامنة المقالات بنجاح." });
    }

    // --- الوظيفة (ب): جلب الإشعارات المجدولة من نيون لإرسالها (GET) ---
    if (method === 'GET') {
      const { user_id } = req.query;
      const query = `
        SELECT id, title, body, category, fcm_token, scheduled_for, post_id
        FROM notifications 
        WHERE (user_id = $1 OR $1 IS NULL)
        AND is_sent = false
        AND scheduled_for >= NOW() - INTERVAL '1 day'
        AND scheduled_for <= NOW() + INTERVAL '1 day'
        ORDER BY scheduled_for ASC
        LIMIT 50
      `;
      const { rows } = await pool.query(query, [user_id || null]);
      notificationsToSend = rows;
    } 
    
    // --- الوظيفة (ج): استقبال إشعار مباشر (POST) ---
    else if (method === 'POST') {
      const { fcmToken, token, title, body, category, type, postId, image } = req.body;

      if (type === "wordpress_article" && postId) {
        const { rows: existing } = await pool.query(`SELECT id FROM sent_posts WHERE post_id = $1 LIMIT 1`, [String(postId)]);
        if (existing.length > 0) {
          return res.status(200).json({ success: true, message: "تم إرسال هذا المقال مسبقاً." });
        }
        notificationsToSend = [{ isWordPress: true, wpPostId: postId, title, body, category, wpImage: image }];
      } else {
        notificationsToSend = [{ fcm_token: fcmToken || token, title, body, category }];
      }
    }

    if (notificationsToSend.length === 0) {
      return res.status(200).json({ success: true, message: "لا توجد مهام إرسال حالياً." });
    }

    // --- معالجة الإرسال (الذكاء الاصطناعي و Firebase) ---
    const results = await Promise.all(notificationsToSend.map(async (item) => {
      const categoryKey = item.category || '10783713';
      const categoryLabel = CATEGORY_MAP[categoryKey] || 'رقة';
      const imageUrl = item.wpImage || `${BASE_ASSETS_URL}/${categoryKey}.png`;
      
      let finalTitle = item.title || "رقة 🌸";
      let finalBody = item.body || "اكتشفي الجديد في تطبيق رقة";

      // تحسين صياغة الإشعار عبر الذكاء الاصطناعي بناءً على محتوى الجدول
      if (item.id || item.isWordPress) {
        try {
          const aiRes = await fetch(AI_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              prompt: `بصفتك خبير محتوى، أعد صياغة هذا المقال لإرساله كإشعار Push جذاب وقصير جداً لمتابعات تطبيق رقة. 
              القسم: ${categoryLabel}
              العنوان الأصلي: ${finalTitle}
              المحتوى المختصر: ${finalBody}
              المطلوب: عنوان مشوق ونص إشعار محفز للنقر مع إيموجي مناسب.`
            })
          });
          const aiData = await aiRes.json();
          // تحديث العنوان والنص إذا توفرا من الذكاء الاصطناعي
          if (aiData.title) finalTitle = aiData.title;
          finalBody = aiData.message || aiData.text || aiData.body || finalBody;
        } catch (e) { console.warn("AI Error: Using original text."); }
      }

      const messagePayload = {
        notification: { title: finalTitle, body: finalBody, image: imageUrl },
        data: { 
          image: imageUrl, 
          category: String(categoryKey),
          post_id: String(item.post_id || item.wpPostId || ""),
          click_action: "FLUTTER_NOTIFICATION_CLICK"
        },
        android: { priority: "high", notification: { image: imageUrl, sound: "default" } },
        apns: { payload: { aps: { mutableContent: true, sound: "default" } }, fcm_options: { image: imageUrl } }
      };

      if (item.isWordPress || (!item.fcm_token && !item.token)) {
        messagePayload.topic = "all_users"; 
      } else {
        messagePayload.token = item.fcm_token || item.token;
      }

      try {
        const messageId = await admin.messaging().send(messagePayload);
        
        if (item.id) {
          await pool.query('UPDATE notifications SET is_sent = true WHERE id = $1', [item.id]);
        }
        
        if (item.isWordPress && item.wpPostId) {
          await pool.query('INSERT INTO sent_posts (post_id, title) VALUES ($1, $2) ON CONFLICT DO NOTHING', [String(item.wpPostId), finalTitle]);
        }
        
        return { status: 'sent', messageId };
      } catch (err) { return { status: 'error', error: err.message }; }
    }));

    return res.status(200).json({ success: true, results });

  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
