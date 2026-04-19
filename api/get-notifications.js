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
  'menstrual': 'menstrual',
  'pregnancy': 'pregnancy',
  'breastfeeding': 'breastfeeding',
  'motherhood': 'motherhood',
  'fitness': 'الرشاقة',
  'medical': 'medical',
  'jurisprudence': 'jurisprudence',
  'relationships': 'relationships',
  'emotions': 'emotions',
  'general': 'general'
};

export default async function handler(req, res) {
  const { method, headers } = req;
  const AI_API_URL = "https://raqqa-hjl8.vercel.app/api/raqqa-ai";
  const BASE_ASSETS_URL = "https://raqqa-hjl8.vercel.app/assets/notifications";

  try {
    if (headers['zazotona'] !== '12sonds25') {
      return res.status(401).json({ success: false, error: 'Unauthorized Access' });
    }

    let notificationsToSend = [];

    // --- الوظيفة الأولى: جلب الإشعارات الخاصة من نيون (GET) ---
    if (method === 'GET') {
      const { user_id } = req.query;
      const query = `
        SELECT id, title, body, category, fcm_token, scheduled_for 
        FROM notifications 
        WHERE (user_id = $1 OR $1 IS NULL)
        AND is_sent = false
        AND scheduled_for <= NOW() + INTERVAL '1 day'
        ORDER BY scheduled_for ASC
        LIMIT 50
      `;
      const { rows } = await pool.query(query, [user_id || null]);
      notificationsToSend = rows;
    } 
    // --- الوظيفة الثانية: استقبال مقال وردبريس (POST) ---
    else if (method === 'POST') {
      const { fcmToken, token, title, body, category, type, postId, image } = req.body;

      if (type === "wordpress_article" && postId) {
        // فحص هل المقال أُرسل من قبل لمنع الإزعاج
        const { rows: existing } = await pool.query(`SELECT post_id FROM sent_posts WHERE post_id = $1 LIMIT 1`, [String(postId)]);
        if (existing.length > 0) {
          return res.status(200).json({ success: true, message: "تم إرسال هذا المقال مسبقاً لجميع المستخدمين." });
        }

        notificationsToSend = [{ 
          isWordPress: true, // علامة فارقة للإرسال الجماعي
          wpPostId: postId,
          title: title, 
          body: body, 
          category: category || 'general',
          wpImage: image 
        }];
      } else {
        // إرسال يدوي لشخص محدد عبر التوكن
        notificationsToSend = [{ fcm_token: fcmToken || token, title, body, category }];
      }
    }

    if (notificationsToSend.length === 0) {
      return res.status(200).json({ success: true, message: "لا توجد مهام إرسال حالياً." });
    }

    const results = await Promise.all(notificationsToSend.map(async (item) => {
      const categoryKey = item.category || 'general';
      const categoryLabel = CATEGORY_MAP[categoryKey] || 'عام';
      const imageUrl = item.wpImage || `${BASE_ASSETS_URL}/${categoryKey}.png`;
      
      let finalTitle = item.title || "رقة 🌸";
      let finalBody = item.body || "اكتشفي الجديد في تطبيق رقة";

      // تحسين النص بالذكاء الاصطناعي (اختياري)
      try {
        const aiRes = await fetch(AI_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            prompt: `اكتبي إشعاراً ملائماً لـ "${categoryLabel}" بعنوان "${finalTitle}" ومحتوى "${finalBody}"`
          })
        });
        if (aiRes.ok) {
          const aiData = await aiRes.json();
          finalBody = aiData.message || aiData.text || finalBody;
        }
      } catch (e) { console.warn("AI skipped."); }

      const messagePayload = {
        notification: { title: finalTitle, body: finalBody, image: imageUrl },
        data: { 
          image: imageUrl, 
          category: categoryKey,
          post_id: item.wpPostId ? String(item.wpPostId) : (item.id ? String(item.id) : ""),
          click_action: "FLUTTER_NOTIFICATION_CLICK"
        },
        android: { priority: "high", notification: { image: imageUrl, channelId: "default", sound: "default" } },
        apns: { payload: { aps: { mutableContent: true, sound: "default" } }, fcm_options: { image: imageUrl } }
      };

      // --- تطبيق المنطق الذي شرحته لك ---
      if (item.isWordPress) {
        // إرسال لجميع الأجهزة (Topic)
        messagePayload.topic = "all_users"; 
      } else if (item.fcm_token) {
        // إرسال لجهاز المستخدم صاحب الإشعار فقط (Token)
        messagePayload.token = item.fcm_token;
      } else {
        return { status: 'error', error: 'No destination available' };
      }

      try {
        const messageId = await admin.messaging().send(messagePayload);
        
        // تحديث قاعدة البيانات
        if (item.id) {
          await pool.query('DELETE FROM notifications WHERE id = $1', [item.id]);
        }
        if (item.isWordPress && item.wpPostId) {
          await pool.query('INSERT INTO sent_posts (post_id, title) VALUES ($1, $2) ON CONFLICT (post_id) DO NOTHING', [String(item.wpPostId), finalTitle]);
        }
        
        return { status: 'sent', messageId };
      } catch (err) {
        return { status: 'error', error: err.message };
      }
    }));

    return res.status(200).json({ success: true, results });

  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
