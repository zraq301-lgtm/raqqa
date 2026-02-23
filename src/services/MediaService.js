import { VoiceRecorder } from "capacitor-voice-recorder";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { Filesystem, Directory } from "@capacitor/filesystem";
import axios from "axios";

class MediaService {
  constructor() {
    this.uploadUrl = "https://raqqa-v6cd.vercel.app/api/upload";
  }

  // --- إدارة الصوت (Voice Recorder) ---
  async requestAudioPermissions() {
    const status = await VoiceRecorder.requestAudioRecordingPermission();
    return status.value;
  }

  async startRecording() {
    return (await VoiceRecorder.startRecording()).value;
  }

  async stopRecording() {
    return (await VoiceRecorder.stopRecording()).value;
  }

  // --- إدارة الكاميرا والصور ---
  async takePhoto() {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera
    });
    return image.base64String;
  }

  // الدالة المطلوبة لصفحة Advice.jsx
  async fetchImage() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Photos
      });
      return image.base64String;
    } catch (error) {
      console.error("Error fetching image:", error);
      throw error;
    }
  }

  // --- دالة الرفع إلى الرابط المذكور ---
  async uploadFile(base64Data, fileName, contentType) {
    try {
      const blob = this.base64ToBlob(base64Data, contentType);
      const formData = new FormData();
      formData.append("file", blob, fileName);

      const response = await axios.post(this.uploadUrl, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data; // سيعيد رابط الملف المرفوع من Vercel
    } catch (error) {
      console.error("خطأ أثناء رفع الملف:", error);
      throw error;
    }
  }

  // --- دالة مساعدة لتحويل Base64 إلى Blob ---
  base64ToBlob(base64, contentType = "") {
    const byteCharacters = atob(base64);
    const byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    return new Blob(byteArrays, { type: contentType });
  }
}

// تصدير النسخة الافتراضية
const mediaServiceInstance = new MediaService();
export default mediaServiceInstance;

// تصدير الدوال بشكل منفرد لإصلاح أخطاء الـ Import في الصفحات
export const fetchImage = () => mediaServiceInstance.fetchImage();
export const takePhoto = () => mediaServiceInstance.takePhoto();
export const startRecording = () => mediaServiceInstance.startRecording();
export const stopRecording = () => mediaServiceInstance.stopRecording();
export const uploadFile = (data, name, type) => mediaServiceInstance.uploadFile(data, name, type);
