import admin from 'firebase-admin';

// إعداد حساب الخدمة الخاص بفيربيس باستخدام المتغيرات البيئية
const serviceAccount = {
  "type": "service_account",
  "project_id": "raqqa-43dc8",
  "client_email": "firebase-adminsdk-fbsvc@raqqa-43dc8.iam.gserviceaccount.com",
  // معالجة مفتاح الخصوصية لضمان عمله في Vercel
  "private_key": process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
};

// تهيئة تطبيق فيربيس مرة واحدة فقط
if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

export default async function handler(req, res) {
  // استقبال طلبات POST فقط
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const { fcmToken, title, body, category } = req.body;

  try {
    // 1. حاجز حماية: التأكد من وجود البيانات الأساسية للإشعار
    if (!fcmToken) {
      return res.status(400).json({ error: "Missing fcmToken" });
    }
    if (!title || !body) {
      return res.status(400).json({ error: "Title and Body are required" });
    }

    // 2. تركيب رابط الصورة تلقائياً بناءً على القسم (Category) المرسل
    // الرابط يشير إلى مجلد public في مشروعك
    const imageUrl = `https://raqqa-app.vercel.app/assets/notifications/${category || 'general'}.png`;

    // 3. بناء كائن الرسالة المتوافق مع أندرويد و iOS و Firebase
    const message = {
      notification: { 
        title: title, 
        body: body,
        image: imageUrl 
      },
      token: fcmToken,
      android: {
        priority: "high",
        notification: {
          channelId: "default", // معرف القناة الافتراضي
          sound: "default",
          image: imageUrl
        }
      },
      apns: {
        payload: {
          aps: { 
            sound: "default",
            mutableContent: true // مهم لإظهار الصور في iOS
          }
        },
        fcm_options: {
          image: imageUrl
        }
      }
    };

    // 4. إرسال الإشعار فوراً عبر فيربيس
    const messageId = await admin.messaging().send(message);

    // 5. الرد بنجاح العملية
    return res.status(200).json({ 
      success: true, 
      message_id: messageId,
      sent_to: fcmToken,
      image_url: imageUrl
    });

  } catch (error) {
    console.error('❌ Firebase Sending Error:', error.message);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}
