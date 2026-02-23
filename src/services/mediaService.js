import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { upload } from '@vercel/blob/client';

// رابط الـ API الخاص بك على Vercel كما حددته
const UPLOAD_API_URL = 'https://raqqa-v6cd.vercel.app/api/upload';

/**
 * دالة طلب الأذونات - ضرورية جداً لعمل الكاميرا على أجهزة أندرويد (APK)
 */
export const requestCameraPermissions = async () => {
  try {
    const permissions = await Camera.checkPermissions();
    if (permissions.camera !== 'granted' || permissions.photos !== 'granted') {
      await Camera.requestPermissions();
    }
  } catch (error) {
    console.error("فشل في طلب أذونات الكاميرا:", error);
  }
};

/**
 * دالة التقاط الصورة من الكاميرا أو اختيارها من المعرض
 */
export const fetchImage = async () => {
  try {
    // التأكد من وجود الأذونات قبل البدء
    await requestCameraPermissions();

    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri, // تعيد مسار الصورة لاستخدامه في الرفع
      source: CameraSource.Prompt, // تظهر خيارات (كاميرا / معرض الصور)
      saveToGallery: true
    });

    return image;
  } catch (error) {
    console.error("خطأ أثناء التقاط الصورة:", error);
    return null;
  }
};

/**
 * دالة الرفع إلى Vercel Blob باستخدام الرابط الكامل
 */
export const uploadToVercel = async (imageUri) => {
  try {
    // 1. تحويل مسار الصورة المحلي (webPath) إلى Blob ثم إلى File Object
    const response = await fetch(imageUri);
    const blob = await response.blob();
    
    // إنشاء اسم ملف فريد باستخدام الوقت الحالي
    const fileName = `capture_${Date.now()}.jpg`;
    const file = new File([blob], fileName, { type: "image/jpeg" });

    // 2. عملية الرفع عبر استدعاء الـ API الخاص بك
    // ستقوم مكتبة العميل بالاتصال بـ UPLOAD_API_URL لتوليد التوكن ثم الرفع
    const newBlob = await upload(file.name, file, {
      access: 'public',
      handleUploadUrl: UPLOAD_API_URL, 
    });

    console.log('تم الرفع بنجاح، رابط الملف:', newBlob.url);
    return newBlob.url; // يعيد رابط الصورة النهائي
  } catch (error) {
    console.error("خطأ في الاتصال بـ API الرفع أو عملية الرفع نفسها:", error);
    throw error;
  }
};
