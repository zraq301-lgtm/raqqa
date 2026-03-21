import pkg from 'pg';
import admin from 'firebase-admin';

const { Pool } = pkg;

// 1. إعداد Firebase Admin (Singleton Pattern)
const serviceAccount = {
  "type": "service_account",
  "project_id": "raqqa-43dc8",
  "client_email": "firebase-adminsdk-fbsvc@raqqa-43dc8.iam.gserviceaccount.com",
  "private_key": process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

// 2. إعداد قاعدة بيانات Neon
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 2 // لضمان سرعة الاستجابة في Vercel
});

export default async function handler(req, res) {
  // الروابط الثابتة للمشروع
  const BASE_ASSETS_URL = "https://raqqa-hjl8.vercel.app/assets/notifications";
  const STORE_ID = "66de0209-e17d-4e42-81d1-3851d5a0d826";

  try {
    // المرحلة 1: جلب الإشعارات (من الآن + 24 ساعة مستقبلاً)
    const query = `
      SELECT id, title, body, category, fcm_token, scheduled_for 
      FROM notifications 
      WHERE is_sent = false 
      AND scheduled_for <= NOW() + INTERVAL '1 day'
      ORDER BY scheduled_for ASC
      LIMIT 5
    `;
    const { rows: notifications } = await pool.query(query);

    if (notifications.length === 0) {
      return res.status(200).json({ success: true, message: "لا توجد إشعارات مستحقة حالياً" });
    }

    const results = await Promise.all(notifications.map(async (item) => {
      let finalBody = item.body;
      const category = item.category || 'default';

      try {
        // المرحلة 2: جلب السياق من Mixedbread (RAG)
        let context = "";
        const mxbRes = await fetch(`https://api.mixedbread.ai/v1/stores/${STORE_ID}/query`, {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${process.env.MXBAI_API_KEY}`,
            'Content-Type': 'application/json' 
          },
          body: JSON.stringify({ query: item.body, top_k: 2 })
        });
        
        if (mxbRes.ok) {
          const mxbData = await mxbRes.json();
          context = mxbData?.hits?.map(h => h.content).join(" ") || "";
        }

        // المرحلة 3: صياغة النص عبر Groq بأسلوب "رقة"
        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
              { role: "system", content: `أنتِ "رقة"، مساعدة ذكية ودافئة. استخدمي هذا السياق: ${context}. صياغتكِ قصيرة، رقيقة، وباللغة العربية.` },
              { role: "user", content: `أعيدي صياغة هذا التنبيه: ${item.body}` }
            ],
            temperature: 0.7
          })
        });

        if (groqRes.ok) {
          const groqData = await groqRes.json();
          finalBody = groqData.choices[0]?.message?.content || item.body;
        }
      } catch (aiErr) {
        console.error("AI Processing Skip:", aiErr.message);
      }

      // المرحلة 4: تحضير الصورة وإرسال Firebase
      const imageUrl = `${BASE_ASSETS_URL}/${category}.png`;
      
      const payload = {
        token: item.fcm_token,
        notification: { title: item.title || "رقة 🌸", body: finalBody, image: imageUrl },
        android: { priority: "high", notification: { image: imageUrl, sound: "default", channelId: "default" } },
        apns: { payload: { aps: { mutableContent: true, sound: "default" } }, fcm_options: { image: imageUrl } },
        data: { category, id: String(item.id) }
      };

      try {
        await admin.messaging().send(payload);
        await pool.query('UPDATE notifications SET is_sent = true WHERE id = $1', [item.id]);
        return { id: item.id, status: 'sent' };
      } catch (fcmErr) {
        return { id: item.id, status: 'failed', error: fcmErr.message };
      }
    }));

    return res.status(200).json({ success: true, results });

  } catch (error) {
    console.error("Critical System Error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
