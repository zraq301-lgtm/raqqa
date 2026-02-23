import { VoiceRecorder } from "capacitor-voice-recorder";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { Filesystem, Directory } from "@capacitor/filesystem";
import axios from "axios";

class MediaService {
  constructor() {
    // رابط الرفع الخاص بك على Vercel
    this.uploadUrl = "https://raqqa-v6cd.vercel.app/api/upload";
  }

  // --- قسم إدارة صلاحيات الصوت (الميكروفون) ---
  
  // دالة لطلب الإذن من المستخدم - ضرورية جداً لتجاوز رسالة "يرجى منح صلاحية" في APK
  async requestAudioPermissions() {
    try {
      // التحقق من الحالة الحالية أولاً
      const check = await VoiceRecorder.hasAudioRecordingPermission();
      if (check.value) return 'granted';

      // طلب الإذن رسمياً من نظام التشغيل أندرويد/iOS
      const status = await VoiceRecorder.requestAudioRecordingPermission();
      return status.value; // سيعيد 'granted' في حال موافقة المستخدم
    } catch (error) {
      console.error("خطأ أثناء طلب صلاحيات الميكروفون:", error);
      return 'denied';
    }
  }

  // دالة للتحقق من الحالة الحالية للصلاحيات
  async checkAudioPermissions() {
    try {
      const status = await VoiceRecorder.hasAudioRecordingPermission();
      return status.value;
    } catch (error) {
      console.error("خطأ في فحص الصلاحيات:", error);
      return false;
    }
  }

  // --- إدارة تسجيل الصوت ---
  async startRecording() {
    try {
      // التحقق من الإذن قبل البدء لضمان عدم تعطل التطبيق
      const hasPermission = await this.checkAudioPermissions();
      if (!hasPermission) {
        const request = await this.requestAudioPermissions();
        if (request !== 'granted') {
          throw new Error("لم يتم منح صلاحية الميكروفون");
        }
      }
      // بدء عملية التسجيل
      const result = await VoiceRecorder.startRecording();
      return result.value;
    } catch (error) {
      console.error("فشل بدء التسجيل:", error);
      throw error;
    }
  }

  async stopRecording() {
    try {
      // إيقاف التسجيل واسترجاع البيانات بصيغة Base64
      const result = await VoiceRecorder.stopRecording();
      return result.value; 
    } catch (error) {
      console.error("فشل إيقاف التسجيل:", error);
      throw error;
    }
  }

  // --- الكاميرا والصور ---
  async takePhoto() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
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

  // --- رفع الملفات إلى Vercel ---
  async uploadToVercel(base64Data, fileName, contentType) {
    try {
      const blob = this.base64ToBlob(base64Data, contentType);
      const formData = new FormData();
      formData.append("file", blob, fileName);

      const response = await axios.post(this.uploadUrl, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data; 
    } catch (error) {
      console.error("خطأ أثناء الرفع إلى Vercel:", error);
      throw error;
    }
  }

  // دالة مساعدة لتحويل Base64 إلى Blob ليتم رفعه كملف
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

const mediaServiceInstance = new MediaService();
export default mediaServiceInstance;

// التصدير المباشر للدوال لاستخدامها في واجهة AdviceChat.jsx
export const requestAudioPermissions = () => mediaServiceInstance.requestAudioPermissions();
export const checkAudioPermissions = () => mediaServiceInstance.checkAudioPermissions();
export const startRecording = () => mediaServiceInstance.startRecording();
export const stopRecording = () => mediaServiceInstance.stopRecording();
export const fetchImage = () => mediaServiceInstance.fetchImage();
export const takePhoto = () => mediaServiceInstance.takePhoto();
export const uploadToVercel = (data, name, type) => mediaServiceInstance.uploadToVercel(data, name, type);
