import { VoiceRecorder } from "capacitor-voice-recorder";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";

class MediaService {
  constructor() {
    this.uploadUrl = "https://raqqa-v6cd.vercel.app/api/upload";
  }

  // طلب صلاحيات الميكروفون لضمان عمل التسجيل في الـ APK
  async requestAudioPermissions() {
    try {
      const check = await VoiceRecorder.hasAudioRecordingPermission();
      if (check.value) return 'granted';
      const status = await VoiceRecorder.requestAudioRecordingPermission();
      return status.value;
    } catch (error) {
      console.error("خطأ في صلاحيات الميكروفون:", error);
      return 'denied';
    }
  }

  async startRecording() {
    await VoiceRecorder.startRecording();
  }

  async stopRecording() {
    const result = await VoiceRecorder.stopRecording();
    return result.value; // يعيد base64
  }

  async takePhoto() {
    const image = await Camera.getPhoto({
      quality: 90,
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera
    });
    return image.base64String;
  }

  async fetchImage() {
    const image = await Camera.getPhoto({
      quality: 90,
      resultType: CameraResultType.Base64,
      source: CameraSource.Photos
    });
    return image.base64String;
  }

  // الدالة المحدثة: إرسال البيانات كـ JSON لتجنب فشل المعالجة
  async uploadToVercel(base64Data, fileName, mimeType) {
    try {
      const response = await fetch(this.uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file: base64Data, // إرسال الملف كـ نص Base64
          name: fileName,
          type: mimeType
        })
      });
      
      if (!response.ok) throw new Error("فشل الرفع للسيرفر");
      return await response.json();
    } catch (err) {
      console.error("فشل الرفع للـ API:", err);
      throw err;
    }
  }
}

const mediaServiceInstance = new MediaService();
export const requestAudioPermissions = () => mediaServiceInstance.requestAudioPermissions();
export const startRecording = () => mediaServiceInstance.startRecording();
export const stopRecording = () => mediaServiceInstance.stopRecording();
export const fetchImage = () => mediaServiceInstance.fetchImage();
export const takePhoto = () => mediaServiceInstance.takePhoto();
export const uploadToVercel = (data, name, type) => mediaServiceInstance.uploadToVercel(data, name, type);
