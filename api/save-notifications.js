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
    scheduled_for, // التاريخ القادم من الواجهة (مثل تاريخ البدء في صورتك)
    isFromMake = false 
  } = req.body;

  try {
    if ((!title || title.trim() === "") && (!body || body.trim() === "")) {
      return res.status(400).json({ error: "Empty notification ignored." });
    }

    // --- 🧠 مترجم الذكاء (قوالب الشياكة) ---
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

    if (templates[category]) {
      title = templates[category].t;
      body = templates[category].b;
    }

    const messagePayload = {
      notification: { 
        title: title || "تنبيه من رقة", 
        body: body || "لديكِ تحديث جديد" 
      },
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

    // --- 1. مسار ميك (Make): إرسال فوري وتحديث الحالة بنجاح ---
    if (isFromMake === true || String(isFromMake).toLowerCase() === "true") {
      await admin.messaging().send(messagePayload);
      if (req.body.db_id) {
         await pool.query('UPDATE notifications SET is_sent = true WHERE id = $1', [req.body.db_id]);
      }
      return res.status(200).json({ success: true, mode: 'Make_Success' });
    }

    // --- 2. مسار الواجهة (المعالجة الذكية للتواريخ) ---
    const numericUserId = isNaN(parseInt(user_id)) ? 1 : parseInt(user_id);
    
    // الحل الجذري: نستخدم scheduled_for كما هو إذا أرسلته الواجهة
    // وإذا لم ترسل الواجهة تاريخاً، نستخدم الآن.
    const finalDate = scheduled_for ? new Date(scheduled_for).toISOString() : new Date().toISOString();

    // فحص التاريخ: هل هو في المستقبل؟
    // التاريخ يعتبر مستقبلياً فقط إذا كان أكبر من "الآن" بأكثر من دقيقة
    const isFuture = scheduled_for && new Date(scheduled_for) > new Date(Date.now() + 60000);

    // إذا كان التاريخ "قديماً" (زي ما ظهر في صورتك فبراير 2026):
    // 1. سيتم تخزينه بتاريخه القديم في نيون.
    // 2. سيتم جعل is_sent = true فوراً لأنه تاريخ فات، فلا يحتاج سحب من ميك.
    const isSentStatus = isFuture ? false : true;

    const query = `
      INSERT INTO notifications (user_id, fcm_token, category, title, body, scheduled_for, is_sent)
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id
    `;

    const values = [numericUserId, fcmToken, category, title, body, finalDate, isSentStatus];
    const result = await pool.query(query, values);
    
    // نرسل الإشعار فوراً فقط إذا كان الموعد هو "الآن" أو تاريخ "فات" (تأكيد الحفظ)
    if (!isFuture) {
        await admin.messaging().send(messagePayload);
    }

    return res.status(200).json({ 
        success: true, 
        db_id: result.rows[0].id, 
        stored_date: finalDate, // لمراجعة التاريخ الذي تم حفظه فعلياً
        scheduled: isFuture ? 'Waiting for Make' : 'Handled Immediately' 
    });

  } catch (error) {
    console.error('❌ FCM/DB Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
