import admin from 'firebase-admin';

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

  let { fcmToken, title, body, category } = req.body;

  try {
    // تطبيق القوالب إذا لم يوجد عنوان مخصص
    const templates = {
      'period': { t: "رقة: تذكير رقيق 🌸", b: "سيدتي، أذكركِ باقتراب موعد دورتكِ الشهرية." },
      'beauty': { t: "وقت التدليل ✨", b: "سيدتي، لا تنسي روتين العناية بجمالكِ اليوم." }
    };

    const finalTitle = title || (templates[category] ? templates[category].t : "رقة");
    const finalBody = body || (templates[category] ? templates[category].b : "لديك تحديث جديد");

    if (!fcmToken) throw new Error("fcmToken is required");

    const messageId = await admin.messaging().send({
      notification: { title: finalTitle, body: finalBody },
      token: fcmToken
    });

    return res.status(200).json({ 
      success: true, 
      message_id: messageId,
      message: "تم إرسال الإشعار عبر فيربيس بنجاح"
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
