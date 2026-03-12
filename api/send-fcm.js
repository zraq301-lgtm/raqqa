import admin from 'firebase-admin';

// إعداد حساب الخدمة الخاص بفيربيس
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
  // استقبال طلبات POST من ميك أو من الواجهة
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  // استلام البيانات (دعم أسماء الحقول المختلفة من الواجهة وميك)
  let { 
    fcmToken, 
    title, 
    body, 
    category,
    token 
  } = req.body;

  const targetToken = fcmToken || token;

  try {
    // 1. التحقق من وجود توكن الجهاز (إجباري)
    if (!targetToken) {
      return res.status(400).json({ error: "Missing Device Token (fcmToken)" });
    }

    // 2. معالجة النصوص لضمان عدم حدوث خطأ 400
    const finalTitle = title && title.trim() !== "" ? title : "تنبيه من رقة 🌸";
    const finalBody = body && body.trim() !== "" ? body : "لديكِ تحديث جديد في التطبيق.";
    const finalCategory = category || 'general';

    // 3. تحديث الرابط الجديد للموقع ومسار الصور
    // ملاحظة: لا نضع كلمة public في الرابط لأن فيرسيل يعتبر محتواها هو الجذر
    const imageUrl = `https://raqqa-hjl8.vercel.app/assets/notifications/${finalCategory}.png`;

    // 4. بناء كائن الإشعار لضمان الظهور على جميع المنصات
    const messagePayload = {
      notification: { 
        title: finalTitle, 
        body: finalBody,
        image: imageUrl 
      },
      token: targetToken,
      android: {
        priority: "high",
        notification: {
          channelId: "default",
          sound: "default",
          image: imageUrl,
          visibility: "public"
        }
      },
      apns: {
        payload: {
          aps: { 
            sound: "default",
            mutableContent: true 
          }
        },
        fcm_options: {
          image: imageUrl
        }
      }
    };

    // 5. الإرسال الفوري لـ Firebase
    const messageId = await admin.messaging().send(messagePayload);

    // 6. رد النجاح للواجهة أو لميك
    return res.status(200).json({ 
      success: true, 
      message_id: messageId,
      details: {
        sent_to: targetToken,
        category: finalCategory,
        image: imageUrl
      }
    });

  } catch (error) {
    console.error('❌ Firebase Dispatch Error:', error.message);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}
