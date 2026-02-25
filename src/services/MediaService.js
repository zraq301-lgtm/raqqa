import { VoiceRecorder } from "capacitor-voice-recorder";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { upload } from "@vercel/blob/client";

class MediaService {
  constructor() {
    // الرابط الذي يتعامل مع التوكن والرفع في مشروعك على فيرسل
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

  // --- منطق الرفع السحابي (Vercel Blob) ---
  async uploadToVercel(base64Data, fileName, mimeType) {
    try {
      // تحويل Base64 إلى Blob ليتمكن المتصفح/التطبيق من رفعه كملف
      const res = await fetch(`data:${mimeType};base64,${base64Data}`);
      const fileBlob = await res.blob();

      // الرفع باستخدام مكتبة Vercel Client (تتصل تلقائياً بـ upload-token.js)
      const newBlob = await upload(fileName, fileBlob, {
        access: 'public',
        handleUploadUrl: this.uploadApiUrl,
      });

      console.log("تم تحويل الملف لرابط سحابي:", newBlob.url);
      return { url: newBlob.url };
    } catch (error) {
      console.error("خطأ أثناء الرفع لـ Vercel:", error);
      throw error;
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
