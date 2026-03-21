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
  const { method, headers } = req;
  const AI_API_URL = "https://raqqa-hjl8.vercel.app/api/raqqa-ai";
  const BASE_ASSETS_URL = "https://raqqa-hjl8.vercel.app/assets/notifications";

  try {
    // جلب البيانات من نيون
    const { rows } = await pool.query(`
      SELECT id, title, body, category, fcm_token 
      FROM notifications 
      WHERE is_sent = false 
      LIMIT 1
    `);

    if (rows.length === 0) return res.status(200).json({ message: "No pending notifications" });

    const item = rows[0];
    const category = item.category || 'default';
    
    // --- الجزء الحاسم: جلب نص الذكاء الاصطناعي ---
    let finalBody = item.body; // النص الافتراضي من نيون

    try {
      const aiRes = await fetch(AI_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          category: category, 
          prompt: item.body 
        })
      });

      if (aiRes.ok) {
        const aiData = await aiRes.json();
        
        // طباعة الرد في السجلات للتأكد من المسمى (Debug)
        console.log("AI Raw Response:", JSON.stringify(aiData));

        // محاولة استخراج النص من كل المسميات الممكنة
        // إذا كان الرابط الجديد يعيد النص داخل 'text' أو 'content' أو 'output' أو 'message'
        finalBody = aiData.text || aiData.content || aiData.output || aiData.message || aiData.response || item.body;
      } else {
        console.error("AI API returned error status:", aiRes.status);
      }
    } catch (e) {
      console.error("Failed to connect to AI API:", e.message);
    }

    // --- رابط الصورة ---
    const imageUrl = `${BASE_ASSETS_URL}/${category}.png`;

    // --- بناء وإرسال الإشعار ---
    const messagePayload = {
      notification: { 
        title: item.title || "رقة 🌸", 
        body: finalBody, // النص الذي تم تحديثه (أو الأصلي في حال الفشل)
        image: imageUrl 
      },
      token: item.fcm_token,
      android: {
        priority: "high",
        notification: {
          image: imageUrl,
          channelId: "default",
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

    const messageId = await admin.messaging().send(messagePayload);
    
    // تحديث نيون لضمان عدم التكرار
    await pool.query('UPDATE notifications SET is_sent = true WHERE id = $1', [item.id]);

    return res.status(200).json({
      success: true,
      debug: {
        original: item.body,
        ai_version: finalBody,
        image: imageUrl
      },
      messageId
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
