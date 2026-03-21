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

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 1
});

// القوالب الاحتياطية في حال فشل الذكاء الاصطناعي أو عدم وجود نص
const TEMPLATES = {
  'period': { t: "رقة تذكركِ 🌸", b: "سيدتي، اقترب موعد أيامكِ الهادئة.. كوني مستعدة لتدليل نفسكِ رعايةً وراحة." },
  'pregnancy': { t: "رحلة الأمومة ✨", b: "تذكير رقيق لمتابعة نمو جنينكِ.. رقة معكِ في كل خطوة من هذه الرحلة." },
  'nursing': { t: "لحظات الارتباط 🤱", b: "وقت الرضاعة هو وقت الحب؛ تأكدي من شرب المياه والحصول على قسط من الراحة." },
  'motherhood': { t: "أنتِ أم رائعة 💖", b: "تذكير بمهمة طفلكِ القادمة.. اهتمامكِ يصنع مستقبله، ورقة تهتم بكِ." },
  'medical': { t: "موعدكِ الطبي 🩺", b: "حفاظاً على صحتكِ، نذكركِ بموعد الاستشارة الطبية اليوم. دمتِ بخير." },
  'mood': { t: "رقة تهتم بقلبكِ ✨", b: "كيف حالكِ اليوم؟ خذي نفساً عميقاً، وتذكري أن مشاعركِ دائماً محل تقدير." },
  'fiqh': { t: "رفيقتكِ الفقهية 📖", b: "تذكير بالأحكام الخاصة بدورتكِ الحالية؛ لتمارسي عباداتكِ بطمأنينة ويقين." },
  'fitness': { t: "وقت النشاط 🏃‍♀️", b: "حركتكِ اليوم هي استثمار في صحتكِ.. تمرين بسيط سيجعلكِ تشعرين بالانتعاش." },
  'intimacy': { t: "لحظات الود ❤️", b: "تذكير بتعزيز التواصل والود مع شريك حياتكِ.. رقة تتمنى لكِ حياة مليئة بالحب." },
  'default': { t: "تنبيه من رقة 🌸", b: "لديكِ تحديث جديد في التطبيق المخصص لراحتكِ." }
};

export default async function handler(req, res) {
  const { method, headers } = req;
  const AI_API_URL = "https://raqqa-hjl8.vercel.app/api/raqqa-ai";
  const BASE_ASSETS_URL = "https://raqqa-hjl8.vercel.app/assets/notifications";

  try {
    // التحقق الأمني لطلبات الـ Cron Job أو GET
    if (method === 'GET' && headers['zazotona'] !== '12sonds25') {
      return res.status(401).json({ success: false, error: 'Unauthorized Access' });
    }

    let notificationsToSend = [];

    // المرحلة 1: جلب البيانات من نيون (Neon)
    if (method === 'GET') {
      const { user_id } = req.query;
      const query = `
        SELECT id, title, body, category, fcm_token, scheduled_for 
        FROM notifications 
        WHERE (user_id = $1 OR $1 IS NULL)
        AND scheduled_for >= NOW() 
        AND scheduled_for <= NOW() + INTERVAL '1 day'
        AND is_sent = false
        ORDER BY scheduled_for ASC
      `;
      const { rows } = await pool.query(query, [user_id || null]);
      notificationsToSend = rows;
    } else if (method === 'POST') {
      const { fcmToken, token, title, body, category } = req.body;
      notificationsToSend = [{
        fcm_token: fcmToken || token,
        title, body, category,
        id: null // إرسال يدوي
      }];
    }

    if (notificationsToSend.length === 0) {
      return res.status(200).json({ success: true, message: "No notifications to process." });
    }

    // المرحلة 2: معالجة كل إشعار (ذكاء اصطناعي -> صورة -> فيربيس)
    const results = await Promise.all(notificationsToSend.map(async (item) => {
      const category = item.category || 'default';
      const template = TEMPLATES[category] || TEMPLATES.default;
      
      let finalTitle = item.title || template.t;
      let initialBody = item.body || template.b;
      let finalBody = initialBody;

      // 1. طلب صياغة الذكاء الاصطناعي (AI Rewrite)
      try {
        const aiRes = await fetch(AI_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            category, 
            prompt: `أنتِ مساعدة رقيقة في تطبيق "رقة"، أعيدي صياغة هذا التنبيه ليكون مريحاً ودافئاً: "${initialBody}"` 
          })
        });
        
        if (aiRes.ok) {
          const aiData = await aiRes.json();
          // فحص كل المفاتيح الممكنة للرد لضمان الحصول على النص
          finalBody = aiData.text || aiData.content || aiData.response || aiData.result || initialBody;
        }
      } catch (e) {
        console.error("AI Service Error:", e.message);
      }

      // 2. تجهيز رابط الصورة بناءً على القسم
      const imageUrl = `${BASE_ASSETS_URL}/${category}.png`;

      // 3. إرسال الإشعار النهائي لـ Firebase
      const messagePayload = {
        notification: { 
          title: finalTitle, 
          body: finalBody,
          image: imageUrl 
        },
        token: item.fcm_token,
        android: {
          priority: "high",
          notification: {
            channelId: "default",
            image: imageUrl,
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

      try {
        if (!item.fcm_token) throw new Error("Missing FCM Token");
        
        const messageId = await admin.messaging().send(messagePayload);

        // تحديث حالة الإشعار في نيون إذا كان مجدولاً
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
    console.error("Critical Handler Error:", error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
}
