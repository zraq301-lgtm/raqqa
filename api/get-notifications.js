import pkg from 'pg';
import admin from 'firebase-admin';

const { Pool } = pkg;

// 1. إعداد Firebase Admin (بنمط Singleton لمنع تكرار التهيئة)
const serviceAccount = {
  "type": "service_account",
  "project_id": "raqqa-43dc8",
  "client_email": "firebase-adminsdk-fbsvc@raqqa-43dc8.iam.gserviceaccount.com",
  "private_key": process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
};

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

// 2. إعداد قاعدة بيانات نيون (Neon)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 1
});

// 3. قوالب النصوص الاحتياطية (قائمة كاملة)
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
  const { method } = req;
  const AI_API_URL = "https://raqqa-v6cd.vercel.app/api/raqqa-ai";
  const BASE_ASSETS_URL = "https://raqqa-hjl8.vercel.app/assets/notifications";

  try {
    let notificationsToSend = [];

    // --- الحالة الأولى: جلب الإشعارات المجدولة (GET) ---
    if (method === 'GET') {
      const { user_id } = req.query;
      
      /**
       * استعلام احترافي:
       * 1. يجلب فقط الإشعارات التي لم تُرسل (is_sent = false).
       * 2. النطاق الزمني: من اللحظة الحالية (NOW()) إلى 24 ساعة مستقبلاً.
       * 3. يضمن عدم جلب أي شيء قديم فات موعده (المواعيد التي لم يمر تاريخها).
       */
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
    } 
    
    // --- الحالة الثانية: إرسال يدوي أو من أداة خارجية (POST) ---
    else if (method === 'POST') {
      const { fcmToken, token, title, body, category, isFromMake } = req.body;
      notificationsToSend = [{
        fcm_token: fcmToken || token,
        title,
        body,
        category,
        isFromManual: true,
        isFromMake: isFromMake === true || String(isFromMake).toLowerCase() === "true"
      }];
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    if (notificationsToSend.length === 0) {
      return res.status(200).json({ success: true, message: "No notifications to send at this time." });
    }

    // 4. معالجة العمليات بالتوازي لضمان السرعة
    const results = await Promise.all(notificationsToSend.map(async (item) => {
      const category = item.category || 'default';
      const template = TEMPLATES[category] || TEMPLATES.default;
      
      let finalTitle = item.title || template.t;
      let finalBody = item.body || template.b;

      // إجبار القالب إذا كان الطلب من أداة Make
      if (item.isFromMake) {
        finalTitle = template.t;
        finalBody = template.b;
      }

      // تحسين النص بالذكاء الاصطناعي (للإشعارات المجدولة أو التي تفتقر لمحتوى)
      if (!item.isFromManual || !item.body) {
        try {
          const aiRes = await fetch(AI_API_URL, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json', 
              'x-api-key': process.env.GROQ_API_KEY 
            },
            body: JSON.stringify({ 
              category, 
              prompt: `بصفتكِ مساعدة رقيقة، صغِ رسالة دافئة ومختصرة جداً عن موضوع ${category} مع الحفاظ على روح الود.` 
            })
          });
          
          if (aiRes.ok) {
            const aiData = await aiRes.json();
            finalBody = aiData.text || aiData.content || finalBody;
          }
        } catch (e) { 
          console.warn(`AI Enrichment skipped for ID ${item.id || 'POST'}:`, e.message); 
        }
      }

      const imageUrl = `${BASE_ASSETS_URL}/${category}.png`;

      // بناء الحمولة لـ Firebase Cloud Messaging
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
        if (!item.fcm_token) throw new Error("FCM Token is missing");
        
        // إرسال الإشعار عبر Firebase
        const messageId = await admin.messaging().send(messagePayload);

        // تحديث حالة الإرسال في قاعدة البيانات فور النجاح
        if (item.id) {
          await pool.query('UPDATE notifications SET is_sent = true WHERE id = $1', [item.id]);
        }

        return { id: item.id, status: 'sent', messageId, scheduled: item.scheduled_for };
      } catch (err) {
        return { id: item.id, status: 'error', error: err.message };
      }
    }));

    return res.status(200).json({ 
      success: true, 
      processed_count: results.length, 
      results 
    });

  } catch (error) {
    console.error('❌ Critical Server Error:', error.message);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
}
