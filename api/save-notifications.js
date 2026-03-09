import admin from 'firebase-admin';

// إعداد بيانات الحساب الخدمي
const serviceAccount = {
  "type": "service_account",
  "project_id": "raqqa-43dc8",
  "client_email": "firebase-adminsdk-fbsvc@raqqa-43dc8.iam.gserviceaccount.com",
  "private_key": process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
};

/**
 * دالة تهيئة Firebase Admin بأمان لمنع انهيار السيرفر
 */
function initializeFirebase() {
  if (!admin.apps.length) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log("✅ تم تهيئة Firebase Admin بنجاح.");
    } catch (error) {
      // طباعة الخطأ بالتفصيل في سجلات فيرسل
      console.error('❌ خطأ حرج في تهيئة Firebase:', {
        message: error.message,
        stack: error.stack,
        time: new Date().toISOString()
      });
    }
  }
}

export default async function (req, res) {
  // تشغيل التهيئة
  initializeFirebase();

  // 1. التحقق من طريقة الطلب
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'الطريقة غير مسموحة، استخدم POST فقط.' });
  }

  // 2. التحقق من وجود البيانات الأساسية
  const { fcmToken, title, body } = req.body;

  if (!fcmToken) {
    console.error("⚠️ محاولة إرسال فاشلة: fcmToken مفقود في الطلب.");
    return res.status(400).json({ error: 'fcmToken is required' });
  }

  // 3. التحقق من وجود المفتاح الخاص في البيئة (Environment Variable)
  if (!serviceAccount.private_key) {
    console.error("❌ خطأ إعدادات: FIREBASE_PRIVATE_KEY غير موجود في إعدادات Vercel.");
    return res.status(500).json({ error: 'Server configuration error: Missing Private Key' });
  }

  try {
    const message = {
      notification: { 
        title: title || "رقة", 
        body: body || "تنبيه جديد" 
      },
      token: fcmToken
    };

    const response = await admin.messaging().send(message);
    
    console.log("🚀 تم إرسال الإشعار بنجاح:", response);
    return res.status(200).json({ success: true, messageId: response });

  } catch (error) {
    /**
     * دالة تتبع الأخطاء المفصلة:
     * ستظهر لك في سجلات Vercel سبب الفشل بدقة (مثلاً: توكن غير صالح، أو انتهاء صلاحية المفتاح)
     */
    console.error('❌ فشل إرسال الإشعار. التفاصيل الدقيقة:', {
      error_code: error.code,       // كود الخطأ من جوجل
      error_message: error.message, // رسالة الخطأ بالإنجليزية
      token_used: fcmToken.substring(0, 10) + "...", // عرض جزء من التوكن للتأكد
      timestamp: new Date().toISOString()
    });

    // إرسال رد واضح للواجهة الأمامية
    return res.status(500).json({ 
      error: 'فشل إرسال الإشعار لجوجل', 
      debug_info: error.message 
    });
  }
}
