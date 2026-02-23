import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { VoiceRecorder } from '@capacitor-community/voice-recorder';
import { upload } from '@vercel/blob/client';

// رابط الـ API الخاص بك المرفوع على Vercel
const UPLOAD_API_URL = 'https://raqqa-v6cd.vercel.app/api/upload';

/**
 * 1. قسم الكاميرا والصور
 * @param {boolean} isDirectCamera - إذا كان true يفتح الكاميرا فوراً، وإذا كان false يخير المستخدم
 */
export const fetchImage = async (isDirectCamera = false) => {
  try {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: isDirectCamera ? CameraSource.Camera : CameraSource.Prompt,
      saveToGallery: true
    });
    return image;
  } catch (error) {
    console.error("خطأ في الكاميرا:", error);
    return null;
  }
};

/**
 * 2. قسم تسجيل الصوت (الميكروفون)
 */
export const startRecording = async () => {
  try {
    const canRecord = await VoiceRecorder.canDeviceVoiceRecord();
    if (canRecord.value) {
      const permission = await VoiceRecorder.requestAudioRecordingPermission();
      if (permission.value) {
        return await VoiceRecorder.startRecording();
      }
    }
    throw new Error("الجهاز لا يدعم التسجيل أو تم رفض الإذن");
  } catch (error) {
    console.error("فشل بدء التسجيل:", error);
    throw error;
  }
};

/**
 * دالة التوقف عن التسجيل ورفع الملف الصوتي مباشرة
 */
export const stopRecordingAndUpload = async () => {
  try {
    const result = await VoiceRecorder.stopRecording();
    if (result.value && result.value.recordDataBase64) {
      // تحويل Base64 إلى File للرفع
      const response = await fetch(`data:audio/wav;base64,${result.value.recordDataBase64}`);
      const blob = await response.blob();
      const file = new File([blob], `voice_${Date.now()}.wav`, { type: 'audio/wav' });

      // الرفع إلى Vercel Blob
      const newBlob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: UPLOAD_API_URL,
      });
      return newBlob.url;
    }
  } catch (error) {
    console.error("خطأ في رفع الصوت:", error);
    throw error;
  }
};

/**
 * 3. دالة رفع الصور العامة
 */
export const uploadFileToVercel = async (uri) => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    const file = new File([blob], `img_${Date.now()}.jpg`, { type: "image/jpeg" });

    const newBlob = await upload(file.name, file, {
      access: 'public',
      handleUploadUrl: UPLOAD_API_URL,
    });
    return newBlob.url;
  } catch (error) {
    console.error("فشل رفع الملف:", error);
    throw error;
  }
};
