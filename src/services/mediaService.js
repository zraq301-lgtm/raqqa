import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { upload } from '@vercel/blob/client';

/**
 * دالة للتحقق من الأذونات وطلبها قبل استخدام الكاميرا
 * مفيدة جداً لضمان عمل الـ APK دون توقف مفاجئ
 */
export const requestCameraPermissions = async () => {
  try {
    const permissions = await Camera.checkPermissions();
    if (permissions.camera !== 'granted' || permissions.photos !== 'granted') {
      await Camera.requestPermissions();
    }
  } catch (error) {
    console.error("فشل في طلب الأذونات:", error);
  }
};

/**
 * دالة التقاط صورة أو اختيارها من المعرض
 */
export const fetchImage = async () => {
  try {
    // نطلب الإذن أولاً
    await requestCameraPermissions();

    const image = await Camera.getPhoto({
      quality: 80,
      allowEditing: false, // اجعلها true إذا كنت تريد قص الصورة قبل الرفع
      resultType: CameraResultType.Uri,
      source: CameraSource.Prompt, // يظهر خيارات (كاميرا / معرض الصور)
      saveToGallery: true // حفظ الصورة الملتقطة في معرض الهاتف
    });

    return image;
  } catch (error) {
    console.error("خطأ في استخدام الكاميرا أو المعرض:", error);
    return null;
  }
};

/**
 * دالة الرفع إلى Vercel Blob المتوافقة مع ملف الـ API الخاص بك
 * @param {string} imageUri - المسار المحلي للصورة (photo.webPath)
 */
export const uploadToVercel = async (imageUri) => {
  try {
    // 1. تحويل الصورة من مسار محلي (Capacitor URI) إلى ملف (File Object)
    const response = await fetch(imageUri);
    const blob = await response.blob();
    
    // إنشاء اسم فريد للملف باستخدام الوقت الحالي
    const fileName = `chat_media_${Date.now()}.jpg`;
    const file = new File([blob], fileName, { type: "image/jpeg" });

    // 2. الرفع باستخدام مكتبة Vercel مباشرة
    // ستقوم الدالة بإرسال طلب POST إلى /api/upload للحصول على التوكن ثم الرفع
    const newBlob = await upload(file.name, file, {
      access: 'public',
      handleUploadUrl: '/api/upload', 
    });

    console.log("تم الرفع بنجاح، الرابط:", newBlob.url);
    return newBlob.url; // الرابط النهائي الذي ستخزنه في قاعدة البيانات أو ترسل به رسالة
  } catch (error) {
    console.error("فشل عملية الرفع إلى Vercel Blob:", error);
    throw error;
  }
};
