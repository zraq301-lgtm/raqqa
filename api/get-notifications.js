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

const TEMPLATES = {
  'period': { t: "رقة تذكركِ 🌸", b: "سيدتي، اقترب موعد أيامكِ الهادئة.. كوني مستعدة لتدليل نفسكِ رعايةً وراحة." },
  'pregnancy': { t: "رحلة الأمومة ✨", b: "تذكير رقيق لمتابعة نمو جنينكِ.. رقة معكِ في كل خطوة من هذه الرحلة." },
  'mood': { t: "رقة تهتم بقلبكِ ✨", b: "كيف حالكِ اليوم؟ خذي نفساً عميقاً، وتذكري أن مشاعركِ دائماً محل تقدير." },
  'default': { t: "تنبيه من رقة 🌸", b: "لديكِ تحديث جديد في التطبيق المخصص لراحتكِ." }
};

export default async function handler(req, res) {
  const { method, headers } = req;
  const AI_API_URL = "https://raqqa-hjl8.vercel.app/api/raqqa-ai";
  const BASE_ASSETS_URL = "https://raqqa-hjl8.vercel.app/assets/notifications";

  try {
    if (method === 'GET' && headers['zazotona'] !== '12sonds25') {
      return res.status(401).json({ success: false, error: 'Unauthorized Access' });
    }

    let notificationsToSend = [];

    if (method === 'GET') {
      const { user_id } = req.query;
      // --- التعديل الجوهري في الاستعلام (Query) ---
      // الشرط الآن: أن يكون موعد الإشعار أكبر من الوقت الحالي (أو يساويه) وأصغر من الغد
      const query = `
        SELECT id, title, body, category, fcm_token, scheduled_for 
        FROM notifications 
        WHERE (user_id = $1 OR $1 IS NULL)
        AND is_sent = false
        AND scheduled_for >= NOW() - INTERVAL '15 minutes' -- السماح بهامش بسيط لو تأخر الكرون جوب
        AND scheduled_for <= NOW() + INTERVAL '1 day' -- حتى يوم مستقبلي
        ORDER BY scheduled_for ASC
        LIMIT 10
      `;
      const { rows } = await pool.query(query, [user_id || null]);
      notificationsToSend = rows;
    } else if (method === 'POST') {
      const { fcmToken, token, title, body, category } = req.body;
      notificationsToSend = [{ fcm_token: fcmToken || token, title, body, category }];
    }

    if (notificationsToSend.length === 0) {
      return res.status(200).json({ success: true, message: "No notifications due now." });
    }

    const results = await Promise.all(notificationsToSend.map(async (item) => {
      const category = item.category || 'default';
      const template = TEMPLATES[category] || TEMPLATES.default;
      
      let finalTitle = item.title || template.t;
      let finalBody = item.body || template.b;

      // ذكاء اصطناعي مكثف
      try {
        const aiRes = await fetch(AI_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            prompt: `أنتِ "رقة"، صديقتنا الحنونة. أعيدي صياغة هذا النص ليكون دافئاً ومحفزاً جداً (أكثر من 15 كلمة) مع إيموجي كثيرة 🌸💖✨: "${finalBody}"` 
          })
        });
        
        if (aiRes.ok) {
          const aiData = await aiRes.json();
          finalBody = aiData.message || aiData.text || finalBody;
        }
      } catch (e) { console.warn("AI logic skipped."); }

      const imageUrl = `${BASE_ASSETS_URL}/${category}.png`;

      const messagePayload = {
        token: item.fcm_token,
        notification: { title: finalTitle, body: finalBody, image: imageUrl },
        data: { image: imageUrl, category: category },
        android: { 
          priority: "high", 
          notification: { 
            image: imageUrl, 
            channelId: "default", 
            notificationPriority: "PRIORITY_MAX" 
          } 
        },
        apns: { 
          payload: { aps: { mutableContent: true, sound: "default" } }, 
          fcm_options: { image: imageUrl } 
        }
      };

      try {
        const messageId = await admin.messaging().send(messagePayload);
        if (item.id) {
          await pool.query('UPDATE notifications SET is_sent = true WHERE id = $1', [item.id]);
        }
        return { id: item.id, status: 'sent', messageId };
      } catch (err) {
        return { id: item.id, status: 'error', error: err.message };
      }
    }));

    return res.status(200).json({ success: true, results });

  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
