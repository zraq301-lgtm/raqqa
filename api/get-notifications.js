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
    // التحقق من الهوية لطلبات GET
    if (method === 'GET' && headers['zazotona'] !== '12sonds25') {
      return res.status(401).json({ success: false, error: 'Unauthorized Access' });
    }

    let notificationsToSend = [];

    // --- منطق جلب البيانات ---
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
      const { fcmToken, token, title, body, category, scheduled_for, type, postId, image } = req.body;

      // --- وظيفة وردبريس الجديدة: فحص التكرار في نيون ---
      if (type === "wordpress_article" && postId) {
        const checkQuery = `SELECT post_id FROM sent_posts WHERE post_id = $1 LIMIT 1`;
        const { rows: existing } = await pool.query(checkQuery, [String(postId)]);
        
        if (existing.length > 0) {
          return res.status(200).json({ success: true, message: "تم إرسال هذا المقال مسبقاً، تخطي التكرار." });
        }
        // إعداد بيانات الإرسال لوردبريس (الإرسال لـ Topic)
        notificationsToSend = [{ 
          fcm_token: null, // سيتم استبداله بـ topic في الأسفل
          title, 
          body, 
          category: category || 'general', 
          isWordPress: true, 
          wpPostId: postId,
          wpImage: image 
        }];
      } else {
        // الطلب العادي (POST يدوي)
        notificationsToSend = [{ fcm_token: fcmToken || token, title, body, category, scheduled_for }];
      }
    }

    if (notificationsToSend.length === 0) {
      return res.status(200).json({ success: true, message: "لا توجد إشعارات مستحقة." });
    }

    // --- معالجة الإرسال ---
    const results = await Promise.all(notificationsToSend.map(async (item) => {
      const categoryKey = item.category || 'general';
      const categoryLabel = CATEGORY_MAP[categoryKey] || 'عام';
      
      // تحديد الصورة (إذا كانت من وردبريس نستخدم صورتها، وإلا نستخدم صورة التصنيف)
      const imageUrl = item.wpImage || `${BASE_ASSETS_URL}/${categoryKey}.png`;
      
      let finalTitle = item.title || "رقة 🌸";
      let finalBody = item.body;
      const scheduledDate = item.scheduled_for ? new Date(item.scheduled_for).toLocaleDateString('ar-EG') : "اليوم";

      // --- استدعاء الذكاء الاصطناعي (يتم استدعاؤه لجميع الأنواع لزيادة الجودة) ---
      try {
        const aiRes = await fetch(AI_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            prompt: `أنتِ المساعدة الذكية "رقة". المطلوب كتابة إشعار طويل، ملهم، ودافئ بناءً على:
            - التصنيف: ${categoryLabel}
            - العنوان: ${finalTitle}
            - الرسالة: ${finalBody}
            - الموعد: ${scheduledDate}`
          })
        });
        
        if (aiRes.ok) {
          const aiData = await aiRes.json();
          const aiMessage = aiData.message || aiData.text || aiData.response;
          if (aiMessage) finalBody = aiMessage;
        }
      } catch (e) { console.warn("AI fail, using default."); }

      // إعداد كائن الرسالة لـ Firebase
      const messagePayload = {
        notification: { title: finalTitle, body: finalBody, image: imageUrl },
        data: { image: imageUrl, category: categoryKey, click_action: "FLUTTER_NOTIFICATION_CLICK" },
        android: { priority: "high", notification: { image: imageUrl, channelId: "default" } },
        apns: { payload: { aps: { mutableContent: true, sound: "default" } }, fcm_options: { image: imageUrl } }
      };

      // تحديد الوجهة (Topic لوردبريس، أو Token للجهاز)
      if (item.isWordPress) {
        messagePayload.topic = "all_users";
      } else {
        messagePayload.token = item.fcm_token;
      }

      try {
        const messageId = await admin.messaging().send(messagePayload);
        
        // --- بعد نجاح الإرسال: تحديث قاعدة البيانات ---
        if (item.id) {
          // حذف الإشعارات المجدولة القديمة
          await pool.query('DELETE FROM notifications WHERE id = $1', [item.id]);
        }
        
        if (item.isWordPress && item.wpPostId) {
          // تسجيل مقال وردبريس في نيون لمنع التكرار
          await pool.query('INSERT INTO sent_posts (post_id, title) VALUES ($1, $2)', [String(item.wpPostId), finalTitle]);
        }
        
        return { id: item.id || item.wpPostId, status: 'sent', messageId };
      } catch (err) {
        return { id: item.id || item.wpPostId, status: 'error', error: err.message };
      }
    }));

    return res.status(200).json({ success: true, results });

  } catch (error) {
    console.error("Handler Error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
