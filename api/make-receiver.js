import { put } from '@vercel/blob';
import admin from 'firebase-admin';

// دالة تهيئة Firebase مع معالجة أخطاء الـ JSON
const initFirebase = () => {
  if (!admin.apps.length) {
    try {
      if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
        throw new Error("Missing FIREBASE_SERVICE_ACCOUNT environment variable");
      }
      
      // معالجة مشكلة المسافات والسطور الجديدة في مفتاح Firebase
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    } catch (error) {
      console.error("Firebase Init Error:", error.message);
      return false;
    }
  }
  return true;
};

export default async function handler(req, res) {
  // إعدادات CORS لفك حظر Make نهائياً
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'يرجى استخدام POST من تطبيق Make' });
  }

  try {
    // 1. التأكد من عمل Firebase
    if (!initFirebase()) {
      return res.status(500).json({ error: "فشل في تهيئة Firebase. تأكد من إعداد المفاتيح في Vercel" });
    }

    const { title, message, fcm_token, file_data, file_name } = req.body;

    // 2. معالجة رفع الملف إلى Vercel Blob
    let fileUrl = "";
    if (file_data) {
      try {
        const blob = await put(file_name || `img_${Date.now()}.png`, Buffer.from(file_data, 'base64'), { 
          access: 'public' 
        });
        fileUrl = blob.url;
      } catch (blobError) {
        console.error("Blob Upload Error:", blobError.message);
        // نكمل العملية حتى لو فشل رفع الصورة لضمان وصول الإشعار النصي على الأقل
      }
    }

    // 3. إرسال الإشعار عبر Firebase
    if (!fcm_token) {
      return res.status(400).json({ error: "fcm_token is missing in request body" });
    }

    const payload = {
      notification: {
        title: title || "تنبيه جديد",
        body: message || "لديك رسالة جديدة من الرقة",
      },
      token: fcm_token
    };

    if (fileUrl) {
      payload.notification.image = fileUrl;
    }

    await admin.messaging().send(payload);

    return res.status(200).json({ 
      success: true, 
      message: "تم إرسال الإشعار بنجاح",
      image_url: fileUrl 
    });

  } catch (error) {
    console.error("Global Handler Error:", error.message);
    return res.status(500).json({ error: error.message });
  }
}
