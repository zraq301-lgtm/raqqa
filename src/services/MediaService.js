import { VoiceRecorder } from "capacitor-voice-recorder";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { upload } from "@vercel/blob/client";

class MediaService {
  constructor() {
    // تم التأكد من الرابط الصحيح الذي استدلينا عليه من رسالة الخطأ
    // يجب أن يتطابق هذا الرابط مع مكان وجود ملف upload-token.js في مشروعك
    this.uploadApiUrl = "https://raqqa-v6cd.vercel.app/api/upload";
  }

  // --- إدارة صلاحيات الميكروفون ---
  async requestAudioPermissions() {
    try {
      const status = await VoiceRecorder.requestAudioRecordingPermission();
      return status.value;
    } catch (e) { return 'denied'; }
  }

  // --- تسجيل الصوت واسترجاعه كـ Base64 ---
  async startRecording() { await VoiceRecorder.startRecording(); }

  async stopRecording() {
    const result = await VoiceRecorder.stopRecording();
    return { value: result.value.recordDataBase64 };
  }

  // --- التقاط الصور (كاميرا / معرض) ---
  async takePhoto() {
    const image = await Camera.getPhoto({
      quality: 60,
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera
    });
    return image.base64String;
  }

  async fetchImage() {
    const image = await Camera.getPhoto({
      quality: 60,
      resultType: CameraResultType.Base64,
      source: CameraSource.Photos
    });
    return image.base64String;
  }

  // --- منطق الرفع السحابي المطور (Vercel Blob) ---
  async uploadToVercel(base64Data, fileName, mimeType) {
    try {
      // 1. تحويل Base64 إلى Blob بطريقة أكثر استقراراً للموبايل
      const response = await fetch(`data:${mimeType};base64,${base64Data}`);
      const fileBlob = await response.blob();

      // 2. عملية الرفع مع معالجة التوكن
      // ملاحظة: الخطأ السابق كان بسبب عدم قدرة التطبيق على الوصول لهذا الرابط بنجاح
      const newBlob = await upload(fileName, fileBlob, {
        access: 'public',
        handleUploadUrl: this.uploadApiUrl,
      });

      if (!newBlob || !newBlob.url) {
        throw new Error("فشل الحصول على رابط الملف بعد الرفع");
      }

      console.log("تم الرفع بنجاح:", newBlob.url);
      return newBlob.url; // إرجاع الرابط مباشرة لتبسيطه في كود Advice.jsx
    } catch (error) {
      console.error("خطأ تقني في MediaService:", error.message);
      // إرسال تفاصيل الخطأ لتظهر في واجهة المستخدم
      throw new Error(`مشكلة في الرفع: ${error.message}`);
    }
  }
}

const mediaServiceInstance = new MediaService();
export const requestAudioPermissions = () => mediaServiceInstance.requestAudioPermissions();
export const startRecording = () => mediaServiceInstance.startRecording();
export const stopRecording = () => mediaServiceInstance.stopRecording();
export const fetchImage = () => mediaServiceInstance.fetchImage();
export const takePhoto = () => mediaServiceInstance.takePhoto();
export const uploadToVercel = (d, n, t) => mediaServiceInstance.uploadToVercel(d, n, t);
