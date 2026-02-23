import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { VoiceRecorder } from '@capacitor-community/voice-recorder';
import { upload } from '@vercel/blob/client';

// رابط الـ API الخاص بك على Vercel كما حددته
const UPLOAD_API_URL = 'https://raqqa-v6cd.vercel.app/api/upload';

/**
 * دالة طلب الأذونات - تشمل الآن الكاميرا والميكروفون
 */
export const requestAllPermissions = async () => {
  try {
    // أذونات الكاميرا والصور
    const cameraPerms = await Camera.checkPermissions();
    if (cameraPerms.camera !== 'granted' || cameraPerms.photos !== 'granted') {
      await Camera.requestPermissions();
    }

    // أذونات الميكروفون
    const voicePerms = await VoiceRecorder.hasAudioRecordingPermission();
    if (!voicePerms.value) {
      await VoiceRecorder.requestAudioRecordingPermission();
    }
  } catch (error) {
    console.error("فشل في طلب الأذونات:", error);
  }
};

/**
 * دالة التقاط الصورة الفوتوغرافية
 */
export const fetchImage = async () => {
  try {
    await requestAllPermissions();
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Prompt, 
      saveToGallery: true
    });
    return image;
  } catch (error) {
    console.error("خطأ أثناء التقاط الصورة:", error);
    return null;
  }
};

/**
 * دالة فتح الكاميرا لتصوير فيديو مباشر
 */
export const captureVideo = async () => {
  try {
    await requestAllPermissions();
    const video = await Camera.pickVideo({
      source: CameraSource.Camera, // فتح الكاميرا مباشرة للتصوير
    });
    return video;
  } catch (error) {
    console.error("خطأ أثناء تصوير الفيديو:", error);
    return null;
  }
};

/**
 * دوال تسجيل الصوت (الميكروفون)
 */
export const startRecording = async () => {
  try {
    await requestAllPermissions();
    const result = await VoiceRecorder.startRecording();
    return result;
  } catch (error) {
    console.error("فشل بدء التسجيل:", error);
  }
};

export const stopRecording = async () => {
  try {
    const result = await VoiceRecorder.stopRecording();
    // النتيجة تعيد بيانات Base64 للصوت
    return result.value; 
  } catch (error) {
    console.error("فشل إيقاف التسجيل:", error);
    return null;
  }
};

/**
 * دالة الرفع إلى Vercel Blob (تدعم الصور، الفيديو، والصوت)
 */
export const uploadToVercel = async (mediaUri, fileType = 'image/jpeg', extension = 'jpg') => {
  try {
    const response = await fetch(mediaUri);
    const blob = await response.blob();
    
    const fileName = `media_${Date.now()}.${extension}`;
    const file = new File([blob], fileName, { type: fileType });

    const newBlob = await upload(file.name, file, {
      access: 'public',
      handleUploadUrl: UPLOAD_API_URL, 
    });

    console.log('تم الرفع بنجاح، رابط الملف:', newBlob.url);
    return newBlob.url;
  } catch (error) {
    console.error("خطأ في عملية الرفع:", error);
    throw error;
  }
};
