import { VoiceRecorder } from "capacitor-voice-recorder";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { Filesystem, Directory } from "@capacitor/filesystem";

class MediaService {
  // --- قسم إدارة الصوت (Voice Recorder) ---

  // التحقق من توفر التسجيل ومنح الصلاحيات
  async requestAudioPermissions() {
    const status = await VoiceRecorder.requestAudioRecordingPermission();
    return status.value;
  }

  async startRecording() {
    try {
      const { value } = await VoiceRecorder.startRecording();
      return value;
    } catch (error) {
      console.error("خطأ أثناء بدء تسجيل الصوت:", error);
      throw error;
    }
  }

  async stopRecording() {
    try {
      const result = await VoiceRecorder.stopRecording();
      // النتيجة تحتوي على ملف base64، مدة التسجيل، ونوع الملف
      return result.value; 
    } catch (error) {
      console.error("خطأ أثناء إيقاف تسجيل الصوت:", error);
      throw error;
    }
  }

  // --- قسم الكاميرا والصور (Camera & Gallery) ---

  async takePhoto() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Base64, // نستخدم Base64 لسهولة العرض والرفع
        source: CameraSource.Camera // فتح الكاميرا مباشرة
      });
      return image.base64String;
    } catch (error) {
      console.error("خطأ أثناء التقاط الصورة:", error);
      throw error;
    }
  }

  async pickFromGallery() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        resultType: CameraResultType.Base64,
        source: CameraSource.Photos // فتح معرض الصور
      });
      return image.base64String;
    } catch (error) {
      console.error("خطأ أثناء اختيار صورة من المعرض:", error);
      throw error;
    }
  }

  // --- قسم حفظ الملفات (Filesystem) ---

  async saveFileToDevice(fileName, dataBase64) {
    try {
      const result = await Filesystem.writeFile({
        path: fileName,
        data: dataBase64,
        directory: Directory.Documents,
      });
      return result.uri;
    } catch (error) {
      console.error("خطأ أثناء حفظ الملف:", error);
      throw error;
    }
  }

  // دالة مساعدة لتحويل Base64 إلى Blob (مفيد لرفع الملفات للسيرفر)
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

export default new MediaService();
