import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { upload } from '@vercel/blob/client';

/**
 * دالة طلب الأذونات باستخدام مكتبة الكاميرا نفسها
 * Capacitor 6 يقوم بإدارة الأذونات داخلياً عبر وظائف المكتبة
 */
export const requestCameraPermissions = async () => {
  try {
    // التحقق من حالة الأذونات الحالية
    const permissions = await Camera.checkPermissions();
    
    // إذا لم تكن الأذونات ممنوحة، نطلبها من المستخدم
    if (permissions.camera !== 'granted' || permissions.photos !== 'granted') {
      const status = await Camera.requestPermissions();
      return status.camera === 'granted';
    }
    
    return true;
  } catch (error) {
    console.error("حدث خطأ أثناء طلب الأذونات:", error);
    return false;
  }
};

/**
 * دالة التقاط صورة أو اختيارها من المعرض
 */
export const fetchImage = async () => {
  try {
    // التأكد من الأذونات أولاً
    const hasPermission = await requestCameraPermissions();
    if (!hasPermission) {
      console.warn("الأذونات مرفوضة من قبل المستخدم");
      return null;
    }

    const image = await Camera.getPhoto({
      quality: 80,
      allowEditing: false, 
      resultType: CameraResultType.Uri, // نستخدم URI للتعامل مع الصور في تطبيقات الموبايل
      source: CameraSource.Prompt, // يظهر نافذة اختيار (كاميرا أو معرض)
      saveToGallery: true
    });

    return image;
  } catch (error) {
    // في حال قام المستخدم بإلغاء العملية (Cancel) لن يظهر خطأ مخيف في السجل
    console.log("تم إلغاء عملية التقاط الصورة أو حدث خطأ:", error);
    return null;
  }
};

/**
 * دالة الرفع إلى Vercel Blob
 * @param {string} imageUri - المسار المحلي الذي تعيده الكاميرا (photo.webPath)
 */
export const uploadToVercel = async (imageUri) => {
  try {
    // 1. جلب بيانات الصورة من المسار المحلي وتحويلها إلى Blob
    const response = await fetch(imageUri);
    const blob = await response.blob();
    
    // 2. تجهيز اسم الملف بصيغة فريدة
    const fileName = `chat_${Date.now()}.jpg`;
    const file = new File([blob], fileName, { type: "image/jpeg" });

    // 3. الرفع مباشرة باستخدام مكتبة العميل
    // ملاحظة: handleUploadUrl يجب أن يطابق مسار ملف الـ API في مشروعك
    const newBlob = await upload(file.name, file, {
      access: 'public',
      handleUploadUrl: '/api/upload', 
    });

    return newBlob.url; // يعيد رابط الصورة النهائي (https://...)
  } catch (error) {
    console.error("فشل رفع الملف إلى Vercel Blob:", error);
    throw error;
  }
};
