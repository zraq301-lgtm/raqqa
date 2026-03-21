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
    // 1. جلب البيانات من نيون
    const { rows } = await pool.query(`
      SELECT id, title, body, category, fcm_token 
      FROM notifications 
      WHERE is_sent = false 
      LIMIT 1
    `);

    if (rows.length === 0) return res.status(200).json({ message: "No pending notifications" });

    const item = rows[0];
    const category = (item.category || 'default').trim();
    let finalBody = item.body;

    // 2. محاولة جلب نص الذكاء الاصطناعي مع معالجة الوقت
    try {
      const aiRes = await fetch(AI_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          category: category, 
          prompt: item.body 
        }),
        // تحديد مهلة 10 ثوانٍ للرد
        signal: AbortSignal.timeout(10000) 
      });

      if (aiRes.ok) {
        const aiData = await aiRes.json();
        console.log("AI Response Received:", aiData);
        // التحقق من الحقل المسترجع (تأكد من أن AI يعيد 'ai_response' أو غيره)
        finalBody = aiData.text || aiData.content || aiData.output || aiData.message || aiData.response || aiData.ai_response || item.body;
      }
    } catch (aiError) {
      console.error("AI Error:", aiError.message);
      // في حال الفشل نستخدم النص الأصلي لضمان عدم توقف الإشعار
      finalBody = item.body;
    }

    // 3. تجهيز رابط الصورة
    const imageUrl = `${BASE_ASSETS_URL}/${category}.png`.replace(/\s/g, '');

    // 4. بناء هيكل الرسالة المحسن
    const messagePayload = {
      token: item.fcm_token,
      notification: { 
        title: item.title || "رقة 🌸", 
        body: finalBody,
        image: imageUrl 
      },
      // إضافة حقل data لضمان ظهور الصورة في الخلفية ولأنظمة معينة
      data: {
        click_action: "FLUTTER_NOTIFICATION_CLICK",
        image: imageUrl,
        category: category
      },
      android: {
        priority: "high",
        notification: {
          image: imageUrl,
          channelId: "default",
          sound: "default",
          icon: "stock_ticker_update", // تأكد من وجود أيقونة بهذا الاسم أو حذف السطر
          color: "#f4a261"
        }
      },
      apns: {
        payload: {
          aps: { 
            mutableContent: true, 
            sound: "default",
            category: "NEW_MESSAGE"
          }
        },
        fcm_options: { image: imageUrl }
      }
    };

    // 5. الإرسال وتحديث قاعدة البيانات
    const messageId = await admin.messaging().send(messagePayload);
    
    await pool.query('UPDATE notifications SET is_sent = true WHERE id = $1', [item.id]);

    return res.status(200).json({
      success: true,
      messageId,
      sent_content: {
        body: finalBody,
        image: imageUrl
      }
    });

  } catch (error) {
    console.error("Critical Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
