import { put } from '@vercel/blob';
import admin from 'firebase-admin';

// تهيئة Firebase باستخدام المتغير الذي أضفته في Vercel
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
    });
  } catch (error) {
    console.error('خطأ في تهيئة Firebase:', error.message);
  }
}

export default async function handler(req, res) {
  // إعدادات CORS للسماح لـ Make بالاتصال
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'الطريقة غير مسموحة' });

  try {
    // استلام البيانات من Make
    // المتوقع: title, message, fcm_token, file_data (base64), file_name
    const { title, message, fcm_token, file_data, file_name } = req.body;

    let fileUrl = null;

    // 1. معالجة ورفع الملف إلى Vercel Blob (إذا وجد ملف)
    if (file_data) {
      const fileName = file_name || `upload_${Date.now()}.png`;
      // تحويل البيانات من Base64 إلى Buffer للرفع
      const fileBuffer = Buffer.from(file_data, 'base64');
      
      const blob = await put(`make-uploads/${fileName}`, fileBuffer, {
        access: 'public',
        contentType: 'image/png', // يمكنك جعلها ديناميكية حسب الحاجة
      });
      fileUrl = blob.url;
    }

    // 2. إرسال الإشعار عبر Firebase Cloud Messaging (FCM)
    let notificationResponse = null;
    if (fcm_token) {
      const payload = {
        notification: {
          title: title || "تنبيه جديد من رقة",
          body: message || "لديك تحديث جديد",
          ...(fileUrl && { image: fileUrl }) // إضافة الصورة للإشعار إذا رفعت بنجاح
        },
        token: fcm_token
      };

      notificationResponse = await admin.messaging().send(payload);
    }

    // الرد على Make بنجاح العملية
    return res.status(200).json({
      success: true,
      blob_url: fileUrl,
      firebase_id: notificationResponse,
      status: 'تم الاستلام والمعالجة بنجاح'
    });

  } catch (error) {
    console.error('خطأ في المعالجة:', error.message);
    return res.status(500).json({ error: 'فشل في المعالجة: ' + error.message });
  }
}
