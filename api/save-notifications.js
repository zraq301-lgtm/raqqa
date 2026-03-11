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

  const { 
    fcmToken, 
    user_id, 
    category, 
    title, 
    body, 
    scheduled_for,
    isFromMake = false 
  } = req.body;

  try {
    // 🛡️ حاجز حماية: إذا كان العنوان أو النص فارغاً، نرفض الطلب فوراً
    if (!title || title.trim() === "" || !body || body.trim() === "") {
      return res.status(400).json({ error: "Empty notification ignored." });
    }

    // --- مسار ميك (Make): إرسال فقط لفايربيس ---
    if (isFromMake === true || String(isFromMake).toLowerCase() === "true") {
      await admin.messaging().send({
        notification: { title, body },
        token: fcmToken
      });
      return res.status(200).json({ success: true, mode: 'Make_Only' });
    }

    // --- مسار الواجهة: حفظ في نيون + إرسال ---
    // نتحقق من وجود "الفئة" لضمان أنه طلب حفظ حقيقي وليس مجرد فتح للتطبيق
    if (!category || category === 'general') {
        // إذا كان مجرد فتح للتطبيق بدون فئة محددة، نرسل الإشعار فقط ولا نحفظ في نيون
        await admin.messaging().send({ notification: { title, body }, token: fcmToken });
        return res.status(200).json({ success: true, mode: 'Instant_Notification_Only' });
    }

    const numericUserId = isNaN(parseInt(user_id)) ? 1 : parseInt(user_id);
    const finalDate = scheduled_for || new Date().toISOString();

    const query = `
      INSERT INTO notifications (user_id, fcm_token, category, title, body, scheduled_for, is_sent)
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id
    `;

    const values = [numericUserId, fcmToken, category, title, body, finalDate, true];

    const result = await pool.query(query, values);
    
    await admin.messaging().send({ notification: { title, body }, token: fcmToken });

    return res.status(200).json({ success: true, db_id: result.rows[0].id });

  } catch (error) {
    console.error('❌ Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
