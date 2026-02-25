import { VoiceRecorder } from "capacitor-voice-recorder";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { upload } from "@vercel/blob/client";

class MediaService {
  constructor() {
    // الرابط الذي يعالج التوكن والرفع في مشروعك
    this.uploadApiUrl = "https://raqqa-v6cd.vercel.app/api/upload";
  }

  // --- إدارة الصلاحيات ---
  async requestAudioPermissions() {
    try {
      const status = await VoiceRecorder.requestAudioRecordingPermission();
      return status.value;
    } catch (e) { return 'denied'; }
  }

  // --- إدارة الصوت ---
  async startRecording() { await VoiceRecorder.startRecording(); }

  async stopRecording() {
    const result = await VoiceRecorder.stopRecording();
    return { value: result.value.recordDataBase64 };
  }

  // --- إدارة الصور ---
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

  // --- منطق الرفع الاحترافي (Vercel Blob) ---
  async uploadToVercel(base64Data, fileName, mimeType) {
    try {
      // تحويل Base64 إلى Blob حقيقي للرفع
      const responseByte = await fetch(`data:${mimeType};base64,${base64Data}`);
      const blobFile = await responseByte.blob();

      // الرفع باستخدام مكتبة Vercel Blob Client
      const newBlob = await upload(fileName, blobFile, {
        access: 'public',
        handleUploadUrl: this.uploadApiUrl,
      });

      console.log("تم الرفع بنجاح إلى الرابط:", newBlob.url);
      return { url: newBlob.url };
    } catch (error) {
      console.error("خطأ في رفع الوسائط:", error);
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
