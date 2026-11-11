import { VoiceRecorder } from 'capacitor-voice-recorder';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { uploadAvatar } from './profileApi';
class MediaService {
  async requestAudioPermissions() { try { return (await VoiceRecorder.requestAudioRecordingPermission()).value; } catch { return 'denied'; } }
  async startRecording() { await VoiceRecorder.startRecording(); }
  async stopRecording() { return { value: (await VoiceRecorder.stopRecording()).value.recordDataBase64 }; }
  async takePhoto() { return (await Camera.getPhoto({ quality: 50, resultType: CameraResultType.Base64, source: CameraSource.Camera })).base64String; }
  async fetchImage() { return (await Camera.getPhoto({ quality: 50, resultType: CameraResultType.Base64, source: CameraSource.Photos })).base64String; }
  async uploadToCloudflare(base64, fileName, mimeType = 'image/jpeg') {
    const raw = String(base64 || '').replace(/^data:[^;]+;base64,/, '');
    const bytes = Uint8Array.from(atob(raw), (character) => character.charCodeAt(0));
    const file = new File([bytes], fileName || `health-${Date.now()}.jpg`, { type: mimeType });
    const result = await uploadAvatar(file);
    return result?.photo_url || result?.profile?.photo_url || result?.url || result?.media_url;
  }
}
const instance = new MediaService();
export const requestAudioPermissions = () => instance.requestAudioPermissions();
export const startRecording = () => instance.startRecording();
export const stopRecording = () => instance.stopRecording();
export const fetchImage = () => instance.fetchImage();
export const takePhoto = () => instance.takePhoto();
export const uploadToCloudflare = (d, n, t) => instance.uploadToCloudflare(d, n, t);
