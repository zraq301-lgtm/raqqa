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

// خريطة التصنيفات لتوحيد الصور والأسماء بناءً على كود الحفظ
const CATEGORY_MAP = {
  'menstrual': 'menstrual',
  'pregnancy': 'pregnancy',
  'breastfeeding': 'breastfeeding',
  'motherhood': 'motherhood',
  'fitness': 'fitness',
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
      const { fcmToken, token, title, body, category, scheduled_for } = req.body;
      notificationsToSend = [{ fcm_token: fcmToken || token, title, body, category, scheduled_for }];
    }

    if (notificationsToSend.length === 0) {
      return res.status(200).json({ success: true, message: "No notifications due now." });
    }

    const results = await Promise.all(notificationsToSend.map(async (item) => {
      // تحديد التصنيف والصورة
      const category = CATEGORY_MAP[item.category] || 'general';
      const imageUrl = `${BASE_ASSETS_URL}/${category}.png`;
      
      let finalTitle = item.title || "رقة 🌸";
      let finalBody = item.body;
      const scheduledDate = item.scheduled_for ? new Date(item.scheduled_for).toLocaleDateString('ar-EG') : "اليوم";

      // --- منطق الذكاء الاصطناعي (تحليل البيانات + التاريخ + 15 كلمة) ---
      try {
        const aiRes = await fetch(AI_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            prompt: `أنتِ "رقة". حللي البيانات: (التصنيف: ${category}، العنوان: ${finalTitle}، النص: ${item.body}، التاريخ: ${scheduledDate}). 
            اكتبي إشعاراً دافئاً جداً. 
            الشروط: 
            1. الطول 15 كلمة بالضبط. 
            2. اذكري التاريخ "${scheduledDate}" داخل النص. 
            3. استخدمي إيموجي 🌸✨. 
            4. الأسلوب أنثوي وداعم.`
          })
        });
        
        if (aiRes.ok) {
          const aiData = await aiRes.json();
          const aiMessage = aiData.message || aiData.text || aiData.response;
          if (aiMessage) finalBody = aiMessage;
        }
      } catch (e) { 
        console.warn("AI logic failed, using original text."); 
      }

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
