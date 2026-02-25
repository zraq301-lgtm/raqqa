import React, { useState, useRef, useEffect } from 'react';
import { CapacitorHttp } from '@capacitor/core';
import { Send, Image as ImageIcon, Camera, Mic, MicOff, Loader2 } from 'lucide-react';
import { 
  fetchImage, takePhoto, requestAudioPermissions, 
  startRecording, stopRecording, uploadToVercel 
} from '../../services/MediaService'; 

const AdviceChat = () => {
  const [messages, setMessages] = useState([{ id: 1, text: "أهلاً بكِ، كيف أساعدكِ؟", sender: 'ai' }]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const scrollRef = useRef(null);

  const handleProcess = async (textOverride = null, attachment = null) => {
    const content = textOverride || input;
    if (!content.trim() && !attachment) return;

    setIsProcessing(true);
    const userMsgId = Date.now();
    
    // 1. عرض رسالة المستخدم فوراً
    setMessages(prev => [...prev, { id: userMsgId, text: content, sender: 'user', attachment }]);
    setInput('');

    try {
      let finalAttachmentUrl = null;

      // 2. إذا كان هناك مرفق (Base64)، ارفعه أولاً وحوله لرابط URL
      if (attachment) {
        const fileName = attachment.type === 'image' ? `img_${userMsgId}.png` : `audio_${userMsgId}.aac`;
        const mimeType = attachment.type === 'image' ? 'image/png' : 'audio/aac';
        finalAttachmentUrl = await uploadToVercel(attachment.data, fileName, mimeType);
      }

      // 3. إعداد خيارات الاتصال بـ الذكاء الاصطناعي عبر CapacitorHttp
      const options = {
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: {
          prompt: `أنا أنثى مسلمة، إليكِ رسالتي: ${content}. ${finalAttachmentUrl ? `مرفق رابط الوسائط: ${finalAttachmentUrl}` : ''}`
        }
      };

      const response = await CapacitorHttp.post(options);
      const aiReply = response.data.reply || response.data.message || "عذراً، لم أستطع فهم ذلك.";

      setMessages(prev => [...prev, { id: Date.now(), text: aiReply, sender: 'ai' }]);
    } catch (err) {
      console.error("خطأ:", err);
      setMessages(prev => [...prev, { id: Date.now(), text: "عذراً، حدث خطأ في الشبكة.", sender: 'ai' }]);
    } finally {
      setIsProcessing(false);
    }
  };

  // دالة التقاط الصور
  const handleImageAction = async (type) => {
    try {
      const base64 = type === 'camera' ? await takePhoto() : await fetchImage();
      handleProcess("أرسلتُ صورة لكِ", { type: 'image', data: base64 });
    } catch (e) { console.error("فشل جلب الصورة"); }
  };

  // دالة التسجيل الصوتي
  const toggleRecording = async () => {
    if (!isRecording) {
      const perm = await requestAudioPermissions();
      if (perm === 'granted') {
        await startRecording();
        setIsRecording(true);
      }
    } else {
      const audio = await stopRecording();
      setIsRecording(false);
      handleProcess("أرسلتُ تسجيلاً صوتياً", { type: 'audio', data: audio.value });
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* عرض الرسائل ... (نفس كود CSS الخاص بك) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(m => (
          <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl ${m.sender === 'user' ? 'bg-pink-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
              {m.text}
              {m.attachment && <div className="mt-2 text-xs opacity-70">(تم إرفاق وسائط سحابية)</div>}
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      {/* منطقة الإدخال */}
      <div className="p-4 border-t bg-white">
        <div className="flex gap-4 mb-3 justify-center border-b pb-2">
           <button onClick={() => handleImageAction('camera')} className="text-pink-600 flex flex-col items-center">
            <Camera size={22} /> <span className="text-[10px]">كاميرا</span>
          </button>
          <button onClick={() => handleImageAction('gallery')} className="text-pink-600 flex flex-col items-center">
            <ImageIcon size={22} /> <span className="text-[10px]">معرض</span>
          </button>
          <button onClick={toggleRecording} className={`${isRecording ? 'text-red-500 animate-pulse' : 'text-pink-600'} flex flex-col items-center`}>
            {isRecording ? <MicOff size={22} /> : <Mic size={22} />}
            <span className="text-[10px]">{isRecording ? 'إيقاف' : 'تسجيل'}</span>
          </button>
        </div>
        <div className="flex gap-2">
          <input value={input} onChange={e => setInput(e.target.value)} className="flex-1 border rounded-full px-4 py-2 text-right" placeholder="اكتبي رسالتكِ..." dir="rtl" />
          <button onClick={() => handleProcess()} disabled={isProcessing} className="p-2 bg-pink-600 text-white rounded-full">
            {isProcessing ? <Loader2 className="animate-spin" /> : <Send />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdviceChat;
