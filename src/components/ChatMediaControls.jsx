import React, { useEffect, useRef, useState } from 'react';
import { Camera, Image as ImageIcon, Mic, Square } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { Camera as NativeCamera, CameraResultType, CameraSource } from '@capacitor/camera';

const MAX_IMAGE_SIDE = 1440;
const MAX_DATA_URL_CHARS = 1_350_000;

function loadImage(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('تعذر قراءة الصورة.'));
    image.src = source;
  });
}

async function compressImage(fileOrDataUrl) {
  const objectUrl = typeof fileOrDataUrl === 'string' ? fileOrDataUrl : URL.createObjectURL(fileOrDataUrl);
  try {
    const image = await loadImage(objectUrl);
    const scale = Math.min(1, MAX_IMAGE_SIDE / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('تعذر تجهيز الصورة للإرسال.');
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    for (const quality of [0.78, 0.66, 0.54, 0.42]) {
      const dataUrl = canvas.toDataURL('image/jpeg', quality);
      if (dataUrl.length <= MAX_DATA_URL_CHARS) return dataUrl;
    }
    throw new Error('حجم الصورة كبير. جرّبي صورة أصغر.');
  } finally {
    if (typeof fileOrDataUrl !== 'string') URL.revokeObjectURL(objectUrl);
  }
}

export default function ChatMediaControls({
  imageData = null,
  onImageSelected,
  onImageRemoved,
  onTranscript,
  disabled = false,
  accent = '#7c3aed',
}) {
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const recognitionRef = useRef(null);
  const [recording, setRecording] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => () => recognitionRef.current?.abort?.(), []);

  const chooseNativeImage = async (source) => {
    const photo = await NativeCamera.getPhoto({
      quality: 88,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source,
      width: MAX_IMAGE_SIDE,
      height: MAX_IMAGE_SIDE,
    });
    if (photo.dataUrl) return compressImage(photo.dataUrl);
    if (photo.webPath) return compressImage(photo.webPath);
    throw new Error('لم تُرجع الكاميرا صورة.');
  };

  const selectImage = async (source, file) => {
    if (disabled || busy) return;
    setStatus('');
    setBusy(true);
    try {
      const image = file
        ? await compressImage(file)
        : await chooseNativeImage(source === 'camera' ? CameraSource.Camera : CameraSource.Photos);
      onImageSelected?.(image);
    } catch (error) {
      const message = String(error?.message || 'تعذر فتح الصورة.');
      if (!/cancel|cancelled|canceled|user cancelled/i.test(message)) setStatus(message);
    } finally {
      setBusy(false);
    }
  };

  const startOrStopDictation = () => {
    if (recording) {
      recognitionRef.current?.stop();
      setRecording(false);
      setStatus('انتهى الإملاء الصوتي.');
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setStatus('الإملاء الصوتي غير مدعوم في هذا المتصفح. جرّبي Chrome أو استخدمي لوحة المفاتيح الصوتية.');
      return;
    }
    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'ar-EG';
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.onstart = () => { setRecording(true); setStatus('تحدثي الآن…'); };
      recognition.onresult = (event) => {
        const transcript = Array.from(event.results || [])
          .slice(event.resultIndex || 0)
          .filter((result) => result.isFinal)
          .map((result) => result[0]?.transcript || '')
          .join(' ')
          .trim();
        if (transcript) {
          onTranscript?.(transcript);
          setStatus('أُضيف الكلام إلى حقل الرسالة.');
        }
      };
      recognition.onerror = (event) => {
        setRecording(false);
        setStatus(event.error === 'not-allowed'
          ? 'يرجى السماح باستخدام الميكروفون من إعدادات المتصفح.'
          : 'تعذر استخدام الميكروفون. تحققي من الصلاحية والاتصال ثم حاولي مجددًا.');
      };
      recognition.onend = () => setRecording(false);
      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setRecording(false);
      setStatus('تعذر بدء الإملاء الصوتي.');
    }
  };

  const buttonStyle = {
    border: 'none', borderRadius: '50%', width: 42, height: 42,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    background: `${accent}18`, color: accent, cursor: disabled || busy ? 'not-allowed' : 'pointer',
    opacity: disabled || busy ? 0.55 : 1, flex: '0 0 auto',
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      {imageData && <img src={imageData} alt="معاينة الصورة المرفقة" style={{ width: 58, height: 58, objectFit: 'cover', borderRadius: 10, border: `1px solid ${accent}55` }} />}
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" hidden
        onChange={(event) => { const file = event.target.files?.[0]; if (file) selectImage('camera', file); event.target.value = ''; }} />
      <input ref={galleryInputRef} type="file" accept="image/*" hidden
        onChange={(event) => { const file = event.target.files?.[0]; if (file) selectImage('gallery', file); event.target.value = ''; }} />
      <button type="button" style={buttonStyle} title="التقاط صورة بالكاميرا" aria-label="التقاط صورة بالكاميرا" disabled={disabled || busy}
        onClick={() => Capacitor.isNativePlatform() ? selectImage('camera') : cameraInputRef.current?.click()}>
        <Camera size={19} />
      </button>
      <button type="button" style={buttonStyle} title="اختيار صورة من الجهاز" aria-label="اختيار صورة من الجهاز" disabled={disabled || busy}
        onClick={() => Capacitor.isNativePlatform() ? selectImage('gallery') : galleryInputRef.current?.click()}>
        <ImageIcon size={19} />
      </button>
      <button type="button" style={{ ...buttonStyle, background: recording ? '#fee2e2' : buttonStyle.background, color: recording ? '#b91c1c' : accent }}
        title={recording ? 'إيقاف الإملاء الصوتي' : 'الإملاء الصوتي بالعربية'} aria-label={recording ? 'إيقاف الإملاء الصوتي' : 'الإملاء الصوتي بالعربية'} disabled={disabled}
        onClick={startOrStopDictation}>
        {recording ? <Square size={16} fill="currentColor" /> : <Mic size={19} />}
      </button>
      {imageData && <button type="button" onClick={onImageRemoved} style={{ ...buttonStyle, background: '#fef2f2', color: '#b91c1c' }} title="إزالة الصورة" aria-label="إزالة الصورة"><span aria-hidden="true">×</span></button>}
      {busy && <span style={{ fontSize: 12, color: accent }} role="status">جارٍ تجهيز الصورة…</span>}
      {status && <span style={{ flexBasis: '100%', fontSize: 12, lineHeight: 1.5, color: recording ? accent : '#6b7280' }} role="status">{status}</span>}
    </div>
  );
}
