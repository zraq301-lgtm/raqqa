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
    // توحيد مفتاح التوثيق للـ GET و الـ POST لضمان الأمان
    if (headers['zazotona'] !== '12sonds25') {
      return res.status(401).json({ success: false, error: 'Unauthorized Access' });
    }

    let notificationsToSend = [];

    // --- منطق جلب البيانات من نيون (GET) ---
    if (method === 'GET') {
      const { user_id } = req.query;
      // تم تبسيط الاستعلام لحل مشكلة "عدم الجلب":
      // جعلناه يجلب أي إشعار وقته "الآن أو قبل الآن" ولم يُرسل بعد
      const query = `
        SELECT id, title, body, category, fcm_token, scheduled_for 
        FROM notifications 
        WHERE (user_id = $1 OR $1 IS NULL)
        AND is_sent = false
        AND scheduled_for <= NOW() + INTERVAL '5 minutes'
        ORDER BY scheduled_for ASC
        LIMIT 20
      `;
      const { rows } = await pool.query(query, [user_id || null]);
      notificationsToSend = rows;

    } 
    // --- منطق استقبال بيانات وردبريس أو الإرسال اليدوي (POST) ---
    else if (method === 'POST') {
      const { fcmToken, token, title, body, category, scheduled_for, type, postId, image } = req.body;

      if (type === "wordpress_article" && postId) {
        // فحص التكرار
        const { rows: existing } = await pool.query(`SELECT post_id FROM sent_posts WHERE post_id = $1 LIMIT 1`, [String(postId)]);
        
        if (existing.length > 0) {
          return res.status(200).json({ success: true, message: "Skipped: Post already sent." });
        }

        notificationsToSend = [{ 
          isWordPress: true, 
          wpPostId: postId,
          fcm_token: null, 
          title: title, 
          body: body, 
          category: category || 'general',
          wpImage: image 
        }];
      } else {
        // إرسال يدوي عادي
        notificationsToSend = [{ fcm_token: fcmToken || token, title, body, category, scheduled_for }];
      }
    }

    if (notificationsToSend.length === 0) {
      return res.status(200).json({ success: true, message: "لا توجد إشعارات حالياً." });
    }

    // --- معالجة الإرسال الفعلي لـ Firebase ---
    const results = await Promise.all(notificationsToSend.map(async (item) => {
      const categoryKey = item.category || 'general';
      const categoryLabel = CATEGORY_MAP[categoryKey] || 'عام';
      const imageUrl = item.wpImage || `${BASE_ASSETS_URL}/${categoryKey}.png`;
      
      let finalTitle = item.title || "رقة 🌸";
      let finalBody = item.body || "لديكِ تحديث جديد من رقة";

      // محاولة تحسين النص بالذكاء الاصطناعي
      try {
        const aiRes = await fetch(AI_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            prompt: `اكتبي إشعاراً رقيقاً لـ "${categoryLabel}" بعنوان "${finalTitle}" ومحتوى "${finalBody}"`
          })
        });
        if (aiRes.ok) {
          const aiData = await aiRes.json();
          const aiMsg = aiData.message || aiData.text || aiData.response;
          if (aiMsg) finalBody = aiMsg;
        }
      } catch (e) { console.warn("AI skipped."); }

      // كائن الرسالة لـ Firebase
      const messagePayload = {
        notification: { title: finalTitle, body: finalBody, image: imageUrl },
        data: { 
          image: imageUrl, 
          category: categoryKey,
          post_id: item.wpPostId ? String(item.wpPostId) : "" 
        },
        android: { priority: "high", notification: { image: imageUrl, channelId: "default", sound: "default" } },
        apns: { payload: { aps: { mutableContent: true, sound: "default" } }, fcm_options: { image: imageUrl } }
      };

      // تحديد الوجهة
      if (item.isWordPress) {
        messagePayload.topic = "all_users";
      } else if (item.fcm_token) {
        messagePayload.token = item.fcm_token;
      } else {
        return { status: 'error', error: 'No token or topic' };
      }

      try {
        const messageId = await admin.messaging().send(messagePayload);
        
        // التحديثات بعد النجاح
        if (item.id) {
          // إذا كان من نيون، نحذفه لضمان عدم التكرار
          await pool.query('DELETE FROM notifications WHERE id = $1', [item.id]);
        }
        
        if (item.isWordPress && item.wpPostId) {
          // إذا كان وردبريس، نسجله في جدول الـ sent_posts
          await pool.query('INSERT INTO sent_posts (post_id, title) VALUES ($1, $2) ON CONFLICT DO NOTHING', [String(item.wpPostId), finalTitle]);
        }
        
        return { status: 'sent', messageId };
      } catch (err) {
        console.error("Firebase Send Error:", err.message);
        return { status: 'error', error: err.message };
      }
    }));

    return res.status(200).json({ success: true, results });

  } catch (error) {
    console.error("Main Handler Error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
