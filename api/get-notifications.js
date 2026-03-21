import pkg from 'pg';
import admin from 'firebase-admin';

const { Pool } = pkg;

// 1. إعداد Firebase Admin
const serviceAccount = {
  "type": "service_account",
  "project_id": "raqqa-43dc8",
  "client_email": "firebase-adminsdk-fbsvc@raqqa-43dc8.iam.gserviceaccount.com",
  "private_key": process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
};

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 1
});

export default async function handler(req, res) {
  const AI_API_URL = "https://raqqa-hjl8.vercel.app/api/raqqa-ai";
  const BASE_ASSETS_URL = "https://raqqa-hjl8.vercel.app/assets/notifications";

  try {
    // جلب الإشعار الذي لم يُرسل بعد
    const { rows } = await pool.query(`
      SELECT id, title, body, category, fcm_token 
      FROM notifications 
      WHERE is_sent = false 
      LIMIT 1
    `);

    if (rows.length === 0) return res.status(200).json({ message: "No pending notifications" });

    const item = rows[0];
    const category = item.category || 'default';
    let finalBody = item.body;

    // --- المرحلة الحاسمة: طلب النص من كود الذكاء الخاص بك ---
    try {
      const aiRes = await fetch(AI_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: `أنتِ رقة، أعيدي صياغة هذا التنبيه بأسلوب دافئ وقصير جداً: ${item.body}` 
        })
      });

      if (aiRes.ok) {
        const aiData = await aiRes.json();
        // التعديل الجوهري: استخراج النص من مفتاح message كما هو في كود الذكاء الخاص بك
        if (aiData.message) {
          finalBody = aiData.message;
        }
      }
    } catch (e) {
      console.error("AI API connection failed:", e.message);
    }

    // تجهيز رابط الصورة بناءً على القسم
    const imageUrl = `${BASE_ASSETS_URL}/${category}.png`;

    // بناء حمولة الإشعار
    const messagePayload = {
      token: item.fcm_token,
      notification: {
        title: item.title || "رقة 🌸",
        body: finalBody,
        image: imageUrl
      },
      // إضافة البيانات في كائن data لضمان معالجتها برمجياً في التطبيق
      data: {
        image: imageUrl,
        category: category
      },
      android: {
        priority: "high",
        notification: {
          image: imageUrl,
          channelId: "default", // تأكد أن هذا الـ ID معرف في أندرويد
          sound: "default"
        }
      },
      apns: {
        payload: {
          aps: { mutableContent: true, sound: "default" }
        },
        fcm_options: { image: imageUrl }
      }
    };

    // الإرسال الفعلي عبر Firebase
    const messageId = await admin.messaging().send(messagePayload);

    // تحديث حالة الإشعار في نيون
    await pool.query('UPDATE notifications SET is_sent = true WHERE id = $1', [item.id]);

    return res.status(200).json({
      success: true,
      sent_content: finalBody,
      image_path: imageUrl,
      firebase_id: messageId
    });

  } catch (error) {
    console.error("Handler Error:", error.message);
    return res.status(500).json({ error: error.message });
  }
}
