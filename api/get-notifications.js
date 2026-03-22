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

// القوالب المحدثة بناءً على الصورة المرفقة
const TEMPLATES = {
  'menstrual_report': { t: "رقة تذكركِ 🌸", b: "سيدتي، اقترب موعد أيامكِ الهادئة.. كوني مستعدة لتدليل نفسكِ رعايةً وراحة." },
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
      const query = `
        SELECT id, title, body, category, fcm_token, scheduled_for 
        FROM notifications 
        WHERE (user_id = $1 OR $1 IS NULL)
        AND is_sent = false
        AND scheduled_for >= NOW() - INTERVAL '15 minutes'
        AND scheduled_for <= NOW() + INTERVAL '1 day'
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
      // الاعتماد على التصنيف القادم من قاعدة البيانات (مثل menstrual_report)
      const category = item.category || 'default';
      const template = TEMPLATES[category] || TEMPLATES.default;
      
      let finalTitle = item.title || template.t;
      let rawBody = item.body || template.b;
      let finalBody = rawBody;

      // --- منطق الذكاء الاصطناعي المتطور (تحليل البيانات + تحديد الطول) ---
      try {
        const aiRes = await fetch(AI_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            prompt: `أنتِ "رقة". حللي البيانات التالية بعناية (العنوان: "${finalTitle}"، النص الأصلي: "${rawBody}"). 
            اكتبي إشعاراً متخصصاً جداً بأسلوب حنون ودافيء. 
            شروط صارمة:
            1. يجب أن يكون طول النص 15 كلمة تقريباً (لا يقل عن 13 ولا يزيد عن 17).
            2. استخدمي إيموجي رقيقة 🌸✨.
            3. لا تكرري كلمات العنوان في النص، بل اكتبي محتوى جديداً يكمل المعنى.`
          })
        });
        
        if (aiRes.ok) {
          const aiData = await aiRes.json();
          const aiMessage = aiData.message || aiData.text || aiData.response;
          if (aiMessage && aiMessage.length > 10) finalBody = aiMessage;
        }
      } catch (e) { 
        console.warn("AI logic failed, using default text."); 
      }

      // جلب الصورة بناءً على الاسم الموجود في الصورة (menstrual_report.png)
      const imageUrl = `${BASE_ASSETS_URL}/${category}.png`;

      const messagePayload = {
        token: item.fcm_token,
        notification: { 
          title: finalTitle, 
          body: finalBody, 
          image: imageUrl 
        },
        data: { 
          image: imageUrl, 
          category: category,
          click_action: "FLUTTER_NOTIFICATION_CLICK"
        },
        android: { 
          priority: "high", 
          notification: { 
            image: imageUrl, 
            channelId: "default", 
            notificationPriority: "PRIORITY_MAX" 
          } 
        },
        apns: { 
          payload: { 
            aps: { 
              mutableContent: true, 
              sound: "default" 
            } 
          }, 
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
