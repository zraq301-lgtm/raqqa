import admin from 'firebase-admin';
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL + (process.env.DATABASE_URL.includes('?') ? '&' : '?') + 'sslmode=verify-full',
  ssl: { rejectUnauthorized: false, checkServerIdentity: () => undefined }
});

const serviceAccount = {
  "type": "service_account",
  "project_id": "raqqa-43dc8",
  "client_email": "firebase-adminsdk-fbsvc@raqqa-43dc8.iam.gserviceaccount.com",
  "private_key": process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
};

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  let { 
    fcmToken, 
    user_id, 
    category, 
    title, 
    body, 
    scheduled_for,
    isFromMake = false 
  } = req.body;

  try {
    // 🛡️ حاجز حماية: منع الإشعارات الفارغة
    if (!title || title.trim() === "" || !body || body.trim() === "") {
      return res.status(400).json({ error: "Empty notification ignored." });
    }

    // --- 🧠 مترجم الذكاء (منطق القوالب الشيك) ---
    const templates = {
      'period': {
        t: "رقة: تذكير رقيق 🌸",
        b: "سيدتي، أذكركِ باقتراب موعد دورتكِ الشهرية. صحتكِ أولاً، كوني مستعدة."
      },
      'pregnancy': {
        t: "مبارك لكِ يا جميلة 👶",
        b: "سيدتي، حان وقت الاهتمام بغذائكِ وشرب الماء لسلامة حملكِ."
      },
      'lactation': {
        t: "فترة الرضاعة 🤍",
        b: "سيدتي، غذاؤكِ المتوازن يعني طفلاً قوياً. لا تنسي تناول وجبتكِ الصحية."
      },
      'beauty': {
        t: "وقت التدليل ✨",
        b: "سيدتي، لا تنسي روتين العناية بجمالكِ اليوم. أنتِ تستحقين الأفضل."
      }
    };

    // إذا كانت الفئة موجودة في القوالب، نقوم باستبدال النص التقني بنص القالب
    if (templates[category]) {
      title = templates[category].t;
      body = templates[category].b;
    }

    // إعداد الرسالة النهائية
    const messagePayload = {
      notification: { title, body },
      token: fcmToken,
      android: {
        priority: "high",
        notification: {
          channelId: "default",
          sound: "default",
          priority: "max",
          visibility: "public"
        }
      },
      apns: { payload: { aps: { sound: "default" } } }
    };

    // --- مسار ميك (Make): إرسال فقط لفايربيس ---
    if (isFromMake === true || String(isFromMake).toLowerCase() === "true") {
      await admin.messaging().send(messagePayload);
      console.log(`✅ Sent Smart Notification (${category}) via Make`);
      return res.status(200).json({ success: true, mode: 'Make_Smart_Only' });
    }

    // --- مسار الواجهة: بدون فئة محددة نرسل فقط ---
    if (!category || category === 'general') {
        await admin.messaging().send(messagePayload);
        return res.status(200).json({ success: true, mode: 'Instant_Notification_Only' });
    }

    // --- مسار الحفظ في نيون ثم الإرسال ---
    const numericUserId = isNaN(parseInt(user_id)) ? 1 : parseInt(user_id);
    const finalDate = scheduled_for || new Date().toISOString();

    const query = `
      INSERT INTO notifications (user_id, fcm_token, category, title, body, scheduled_for, is_sent)
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id
    `;

    const values = [numericUserId, fcmToken, category, title, body, finalDate, true];
    const result = await pool.query(query, values);
    
    await admin.messaging().send(messagePayload);

    return res.status(200).json({ success: true, db_id: result.rows[0].id });

  } catch (error) {
    console.error('❌ FCM/DB Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
