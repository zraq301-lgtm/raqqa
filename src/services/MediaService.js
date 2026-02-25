import { VoiceRecorder } from "capacitor-voice-recorder";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";

class MediaService {
  constructor() {
    // رابط الرفع الخاص بك على Vercel
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
    return result.value.recordDataBase64; // استرجاع البيانات بصيغة Base64 [cite: 23, 24]
  }

  async takePhoto() {
    const image = await Camera.getPhoto({
      quality: 60, // تقليل الجودة لسرعة الرفع والتحويل لرابط
      resultType: CameraResultType.Base64,
      source: CameraSource.Prompt // يخير المستخدم بين الكاميرا والمعرض [cite: 15, 16]
    });
    return image.base64String;
  }

  // الدالة الأساسية لرفع الملفات وتحويلها لروابط URL
  async uploadToVercel(base64Data, fileName, mimeType) {
    try {
      const response = await fetch(this.uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file: base64Data,
          name: fileName,
          type: mimeType
        })
      });
      
      const data = await response.json();
      if (data.url) {
        return data.url; // نعيد الرابط المباشر من Vercel Blob
      }
      throw new Error("لم يتم الحصول على رابط URL من السيرفر");
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
export const takePhoto = () => mediaServiceInstance.takePhoto();
export const uploadToVercel = (data, name, type) => mediaServiceInstance.uploadToVercel(data, name, type);
