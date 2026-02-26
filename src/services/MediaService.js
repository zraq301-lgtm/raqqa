import { VoiceRecorder } from "capacitor-voice-recorder";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { upload } from "@vercel/blob/client";

class MediaService {
  constructor() {
    // الرابط المباشر لملف upload.js على فيرسل
    this.uploadApiUrl = "https://raqqa-v6cd.vercel.app/api/upload";
  }

  // --- إدارة صلاحيات الميكروفون ---
  async requestAudioPermissions() {
    try {
      const status = await VoiceRecorder.requestAudioRecordingPermission();
      return status.value;
    } catch (e) { return 'denied'; }
  }

  async startRecording() { await VoiceRecorder.startRecording(); }

  async stopRecording() {
    const result = await VoiceRecorder.stopRecording();
    return { value: result.value.recordDataBase64 };
  }

  // --- التقاط الصور بنسب ضغط متوازنة ---
  async takePhoto() {
    const image = await Camera.getPhoto({
      quality: 50, // تقليل الجودة قليلاً لسرعة الرفع على الموبايل
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera
    });
    return image.base64String;
  }

  async fetchImage() {
    const image = await Camera.getPhoto({
      quality: 50,
      resultType: CameraResultType.Base64,
      source: CameraSource.Photos
    });
    return image.base64String;
  }

  // --- منطق الرفع السحابي الاحترافي ---
  async uploadToVercel(base64Data, fileName, mimeType) {
    try {
      // تحويل Base64 إلى Blob بطريقة مستقرة
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const fileBlob = new Blob([byteArray], { type: mimeType });

      // عملية الرفع الفعلية مع ربطها بـ upload.js
      const newBlob = await upload(fileName, fileBlob, {
        access: 'public',
        handleUploadUrl: this.uploadApiUrl,
      });

      if (!newBlob || !newBlob.url) {
        throw new Error("لم يتم استلام رابط الملف من Vercel");
      }

      return newBlob.url; // إرجاع الرابط مباشرة لتبسيط استخدامه في Advice.jsx
    } catch (error) {
      console.error("MediaService Error:", error.message);
      throw new Error(error.message);
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
