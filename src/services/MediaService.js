import { VoiceRecorder } from "capacitor-voice-recorder";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";

class MediaService {
  constructor() {
    // رابط الـ API الذي سيتولى عملية الرفع إلى Vercel Blob
    this.uploadUrl = "https://raqqa-v6cd.vercel.app/api/upload";
  }

  // --- إدارة صلاحيات الميكروفون ---
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

  // --- إدارة التسجيل الصوتي ---
  async startRecording() {
    try {
      await VoiceRecorder.startRecording();
    } catch (error) {
      console.error("فشل بدء التسجيل:", error);
      throw error;
    }
  }

  async stopRecording() {
    try {
      const result = await VoiceRecorder.stopRecording();
      // إرجاع النتيجة بتنسيق يتوافق مع Advice.jsx (audioData.value)
      return { value: result.value.recordDataBase64 }; 
    } catch (error) {
      console.error("فشل إيقاف التسجيل:", error);
      throw error;
    }
  }

  // --- إدارة الصور (كاميرا ومعرض) ---
  async takePhoto() {
    try {
      const image = await Camera.getPhoto({
        quality: 60, // تقليل الجودة لضمان سرعة التحويل لرابط
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera
      });
      return image.base64String;
    } catch (error) {
      console.error("خطأ في التقاط الصورة:", error);
      throw error;
    }
  }

  async fetchImage() {
    try {
      const image = await Camera.getPhoto({
        quality: 60,
        resultType: CameraResultType.Base64,
        source: CameraSource.Photos
      });
      return image.base64String;
    } catch (error) {
      console.error("خطأ في جلب الصورة من المعرض:", error);
      throw error;
    }
  }

  // --- منطق الرفع والتحويل إلى روابط Vercel Blob ---
  async uploadToVercel(base64Data, fileName, mimeType) {
    try {
      const response = await fetch(this.uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file: base64Data, // إرسال الـ Base64 الخام للسيرفر
          name: fileName,
          type: mimeType
        })
      });
      
      const data = await response.json();

      // التحقق من استلام الرابط من Vercel Blob
      if (data.url) {
        console.log("تم تحويل الوسائط لرابط بنجاح:", data.url);
        return { url: data.url }; 
      }
      throw new Error("لم يتم استلام رابط URL صالح من السيرفر");
    } catch (err) {
      console.error("فشل عملية الرفع والتحويل:", err);
      throw err;
    }
  }
}

const mediaServiceInstance = new MediaService();

// تصدير الدوال بشكل مباشر لضمان نجاح الاستيراد في Advice.jsx
export const requestAudioPermissions = () => mediaServiceInstance.requestAudioPermissions();
export const startRecording = () => mediaServiceInstance.startRecording();
export const stopRecording = () => mediaServiceInstance.stopRecording();
export const fetchImage = () => mediaServiceInstance.fetchImage();
export const takePhoto = () => mediaServiceInstance.takePhoto();
export const uploadToVercel = (data, name, type) => mediaServiceInstance.uploadToVercel(data, name, type);
