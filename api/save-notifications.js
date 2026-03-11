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

  // أضفنا startDate و date كإجراء احتياطي في حال كانت الواجهة ترسل التاريخ بمسمى مختلف
  let { 
    fcmToken, 
    user_id, 
    category, 
    title, 
    body, 
    scheduled_for,
    startDate,
    date,
    isFromMake = false 
  } = req.body;

  try {
    if ((!title || title.trim() === "") && (!body || body.trim() === "")) {
      return res.status(400).json({ error: "Empty notification ignored." });
    }

    // --- 🧠 مترجم الذكاء (قوالب رقة) ---
    const templates = {
      'period': { t: "رقة: تذكير رقيق 🌸", b: "سيدتي، أذكركِ باقتراب موعد دورتكِ الشهرية. صحتكِ أولاً، كوني مستعدة." },
      'pregnancy': { t: "مبارك لكِ يا جميلة 👶", b: "سيدتي، حان وقت الاهتمام بغذائكِ وشرب الماء لسلامة حملكِ." },
      'lactation': { t: "فترة الرضاعة 🤍", b: "سيدتي، غذاؤكِ المتوازن يعني طفلاً قوياً. لا تنسي تناول وجبتكِ الصحية." },
      'beauty': { t: "وقت التدليل ✨", b: "سيدتي، لا تنسي روتين العناية بجمالكِ اليوم. أنتِ تستحقين الأفضل." }
    };

    if (templates[category]) {
      title = templates[category].t;
      body = templates[category].b;
    }

    const messagePayload = {
      notification: { title: title || "تنبيه من رقة", body: body || "لديكِ تحديث جديد" },
      token: fcmToken,
      android: { priority: "high", notification: { channelId: "default", sound: "default", priority: "max", visibility: "public" } },
      apns: { payload: { aps: { sound: "default" } } }
    };

    // --- 1. مسار ميك (Make): إرسال فوري ---
    if (isFromMake === true || String(isFromMake).toLowerCase() === "true") {
      await admin.messaging().send(messagePayload);
      if (req.body.db_id) {
         await pool.query('UPDATE notifications SET is_sent = true WHERE id = $1', [req.body.db_id]);
      }
      return res.status(200).json({ success: true, mode: 'Make_Success' });
    }

    // --- 2. مسار الواجهة (المعالجة الذكية للتواريخ) ---
    const numericUserId = isNaN(parseInt(user_id)) ? 1 : parseInt(user_id);
    
    // محاولة التقاط التاريخ من أي حقل مرسل
    const rawDate = scheduled_for || startDate || date;
    
    // تحويل التاريخ لكائن Date صريح؛ إذا لم يوجد أي تاريخ مرسل نستخدم "الآن"
    const finalDate = rawDate ? new Date(rawDate) : new Date();

    // فحص التاريخ: هل هو في المستقبل؟
    const isFuture = rawDate && new Date(rawDate) > new Date(Date.now() + 60000);
    const isSentStatus = isFuture ? false : true;

    const query = `
      INSERT INTO notifications (user_id, fcm_token, category, title, body, scheduled_for, is_sent)
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id
    `;

    const values = [numericUserId, fcmToken, category, title, body, finalDate, isSentStatus];
    const result = await pool.query(query, values);
    
    // إرسال الإشعار فوراً إذا كان التاريخ حالياً أو قديماً (سجل)
    if (!isFuture) {
        await admin.messaging().send(messagePayload);
    }

    return res.status(200).json({ 
        success: true, 
        db_id: result.rows[0].id, 
        received_from_app: rawDate || "Nothing received", // للتأكد من وصول التاريخ في الـ Response
        stored_date: finalDate.toISOString(), 
        scheduled: isFuture ? 'Waiting for Make' : 'Handled Immediately' 
    });

  } catch (error) {
    console.error('❌ FCM/DB Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
