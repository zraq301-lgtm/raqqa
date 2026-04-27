import admin from 'firebase-admin';

// 1. معالجة المفتاح الخاص بنفس طريقتك الناجحة لضمان عمله على Vercel
const rawKey = process.env.FIREBASE_PRIVATE_KEY;
const formattedKey = rawKey 
  ? rawKey.replace(/\\n/g, '\n').replace(/^"(.*)"$/, '$1').trim() 
  : undefined;

// استخدام نفس البيانات التي نجحت معك في كود FCM
const serviceAccount = {
  "type": "service_account",
  "project_id": "raqqa-43dc8", // القيمة ثابتة كما في كودك الناجح
  "client_email": "firebase-adminsdk-fbsvc@raqqa-43dc8.iam.gserviceaccount.com", // القيمة ثابتة كما في كودك الناجح
  "private_key": formattedKey,
};

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } catch (initError) {
    console.error('❌ Firebase Init Error:', initError.message);
  }
}

const db = admin.firestore();

export default async function handler(req, res) {
  // الحفظ يتطلب POST من الواجهة
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  let { 
    fcmToken, 
    token,
    title, 
    body, 
    category,
    scheduled_for, // التاريخ المرسل من الواجهة (مثلاً: 2026-04-28T10:00:00Z)
    extra_data 
  } = req.body;

  const targetToken = fcmToken || token;

  try {
    if (!targetToken) {
      return res.status(400).json({ error: "Missing Device Token" });
    }

    if (!formattedKey) {
      throw new Error("FIREBASE_PRIVATE_KEY is missing in environment variables.");
    }

    // تجهيز البيانات للحفظ في Firestore
    const notificationData = {
      title: title || "تنبيه من رقة 🌸",
      body: body || "لديكِ تحديث جديد في التطبيق.",
      category: category || "general",
      fcm_token: targetToken,
      is_sent: false, // لم يتم الإرسال بعد
      extra_data: extra_data || {},
      // معالجة التاريخ: إذا لم يرسل تاريخ، نضع توقيت "الآن" كافتراضي
      scheduled_for: scheduled_for 
        ? admin.firestore.Timestamp.fromDate(new Date(scheduled_for)) 
        : admin.firestore.Timestamp.now(),
      created_at: admin.firestore.Timestamp.now()
    };

    // حفظ البيانات في مجموعة "notifications"
    const docRef = await db.collection('notifications').add(notificationData);

    return res.status(200).json({ 
      success: true, 
      message: "تم حفظ الإشعار وجدولته بنجاح",
      doc_id: docRef.id 
    });

  } catch (error) {
    console.error('❌ Firestore Save Error:', error.message);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}
