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

// خريطة التصنيفات لتوحيد الصور والأسماء
const CATEGORY_MAP = {
  'menstrual': 'menstrual',
  'pregnancy': 'pregnancy',
  'breastfeeding': 'breastfeeding',
  'motherhood': 'motherhood',
  'fitness': 'الرشاقة', // تم التعديل من fitness إلى الرشاقة
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
        AND scheduled_for <= NOW() + INTERVAL '1 day'
        AND scheduled_for >= NOW() - INTERVAL '1 hour'
        ORDER BY scheduled_for ASC
        LIMIT 20
      `;
      const { rows } = await pool.query(query, [user_id || null]);
      notificationsToSend = rows;
    } else if (method === 'POST') {
      const { fcmToken, token, title, body, category, scheduled_for } = req.body;
      notificationsToSend = [{ fcm_token: fcmToken || token, title, body, category, scheduled_for }];
    }

    if (notificationsToSend.length === 0) {
      return res.status(200).json({ success: true, message: "لا توجد إشعارات مستحقة حالياً أو لليوم القادم." });
    }

    const results = await Promise.all(notificationsToSend.map(async (item) => {
      const categoryLabel = CATEGORY_MAP[item.category] || 'عام';
      const categoryKey = item.category || 'general'; // نستخدم المفتاح الأصلي للصورة لضمان عدم كسر الرابط
      const imageUrl = `${BASE_ASSETS_URL}/${categoryKey}.png`;
      
      let finalTitle = item.title || "رقة 🌸";
      let finalBody = item.body;
      const scheduledDate = item.scheduled_for ? new Date(item.scheduled_for).toLocaleDateString('ar-EG') : "اليوم";

      // --- استدعاء الذكاء الاصطناعي (تعديل لكتابة إشعار طويل ومخصص) ---
      try {
        const aiRes = await fetch(AI_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            prompt: `أنتِ المساعدة الذكية "رقة". المطلوب كتابة إشعار طويل، ملهم، ودافئ بناءً على البيانات التالية:
            - التصنيف: ${categoryLabel}
            - العنوان الأصلي: ${finalTitle}
            - محتوى الرسالة: ${item.body}
            - موعد الإشعار: ${scheduledDate}

            الشروط:
            1. اكتب نصاً طويلاً ومفصلاً (فقرة غنية) يشرح للمستخدمة أهمية هذا التنبيه بأسلوب أنثوي رقيق.
            2. ادمجي التاريخ ${scheduledDate} بشكل طبيعي داخل النص.
            3. استخدمي تعبيرات تشجيعية وإيموجي تناسب التصنيف (مثل 🌸✨🌿).
            4. اجعلي الإشعار يبدو كرسالة من صديقة مهتمة وليس مجرد نظام آلي.`
          })
        });
        
        if (aiRes.ok) {
          const aiData = await aiRes.json();
          const aiMessage = aiData.message || aiData.text || aiData.response;
          if (aiMessage) finalBody = aiMessage;
        }
      } catch (e) { 
        console.warn("AI logic failed, using default text."); 
      }

      const messagePayload = {
        token: item.fcm_token,
        notification: { title: finalTitle, body: finalBody, image: imageUrl },
        data: { image: imageUrl, category: categoryKey, click_action: "FLUTTER_NOTIFICATION_CLICK" },
        android: { priority: "high", notification: { image: imageUrl, channelId: "default" } },
        apns: { payload: { aps: { mutableContent: true, sound: "default" } }, fcm_options: { image: imageUrl } }
      };

      try {
        const messageId = await admin.messaging().send(messagePayload);
        
        if (item.id) {
          await pool.query('DELETE FROM notifications WHERE id = $1', [item.id]);
        }
        
        return { id: item.id, status: 'sent_and_deleted', messageId };
      } catch (err) {
        return { id: item.id, status: 'error', error: err.message };
      }
    }));

    return res.status(200).json({ success: true, results });

  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
