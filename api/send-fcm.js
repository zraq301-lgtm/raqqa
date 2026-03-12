import admin from 'firebase-admin';

// إعداد حساب الخدمة الخاص بفيربيس
const serviceAccount = {
  "type": "service_account",
  "project_id": "raqqa-43dc8",
  "client_email": "firebase-adminsdk-fbsvc@raqqa-43dc8.iam.gserviceaccount.com",
  // معالجة مفتاح الخصوصية ليعمل بشكل صحيح في بيئة Vercel
  "private_key": process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
};

// تهيئة تطبيق فيربيس إذا لم يكن مهيأً مسبقاً
if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

export default async function handler(req, res) {
  // السماح بطلبات POST فقط
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  // استلام البيانات من ميك (أو من الواجهة مباشرة)
  let { fcmToken, title, body, category } = req.body;

  try {
    // 1. تطبيق القوالب الافتراضية إذا لم يوجد نص مخصص
    const templates = {
      'period': { t: "رقة: تذكير رقيق 🌸", b: "سيدتي، أذكركِ باقتراب موعد دورتكِ الشهرية." },
      'beauty': { t: "وقت التدليل ✨", b: "سيدتي، لا تنسي روتين العناية بجمالكِ اليوم." },
      'pregnancy': { t: "رقة: رحلة الأمومة 🤰", b: "سيدتي، حان وقت متابعة تطور جنينك اليوم." },
      'medical_report': { t: "تقرير طبي جديد 🩺", b: "طبيبة رقة انتهت من تحليل بياناتك." }
    };

    const finalTitle = title || (templates[category] ? templates[category].t : "تحديث من رقة");
    const finalBody = body || (templates[category] ? templates[category].b : "لديكِ إشعار جديد في التطبيق");

    // التحقق من وجود التوكن
    if (!fcmToken) throw new Error("fcmToken is required");

    // 2. منطق تركيب رابط الصورة تلقائياً بناءً على القسم (Category)
    // سيتم سحب الصورة من مجلد public في مشروعك الرئيسي
    const imageUrl = `https://raqqa-app.vercel.app/assets/notifications/${category || 'general'}.png`;

    // 3. بناء كائن الرسالة المرسلة لفيربيس
    const message = {
      notification: { 
        title: finalTitle, 
        body: finalBody,
        image: imageUrl // هنا يتم تمرير رابط الصورة تلقائياً
      },
      token: fcmToken
    };

    // 4. إرسال الإشعار عبر Firebase Admin SDK
    const messageId = await admin.messaging().send(message);

    return res.status(200).json({ 
      success: true, 
      message_id: messageId,
      message: "تم إرسال الإشعار مع الصورة بنجاح عبر فيربيس",
      image_sent: imageUrl
    });

  } catch (error) {
    console.error("Firebase Admin Error:", error.message);
    return res.status(500).json({ error: error.message });
  }
}
