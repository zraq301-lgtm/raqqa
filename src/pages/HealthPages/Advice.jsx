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

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleProcess = async (textOverride = null, attachment = null) => {
    const content = textOverride || input; [cite: 7, 8]
    if (!content.trim() && !attachment) return;

    setIsProcessing(true);
    const userMsgId = Date.now();
    setMessages(prev => [...prev, { id: userMsgId, text: content, sender: 'user', attachment }]); [cite: 9]
    setInput('');

    try {
      let finalAttachmentUrl = null;
      if (attachment) {
        try {
          const fileName = attachment.type === 'image' ? `img_${userMsgId}.png` : `audio_${userMsgId}.aac`; [cite: 12]
          const mimeType = attachment.type === 'image' ? 'image/png' : 'audio/aac';
          finalAttachmentUrl = await uploadToVercel(attachment.data, fileName, mimeType); [cite: 12]
        } catch (uploadErr) {
          throw new Error(`فشل رفع الملف: ${uploadErr.message}`); [cite: 13]
        }
      }

      const options = {
        url: 'https://raqqa-v6cd.vercel.app/api/replicate-analysis', // الرابط الجديد
        headers: { 'Content-Type': 'application/json' },
        data: {
          prompt: content,
          imageUrl: finalAttachmentUrl 
        }
      };
      
      const response = await CapacitorHttp.post(options); [cite: 16]
      
      if (response.status !== 200) {
        throw new Error(`خطأ من الخادم (Status: ${response.status})`); [cite: 16]
      }

      // استخراج الرد النصي ورابط الصورة (إن وجد) من الاستجابة المحدثة
      const aiReply = response.data.reply || "تمت المعالجة بنجاح.";
      const generatedImg = response.data.imageUrl; // الرابط القادم من نموذج الرسم

      setMessages(prev => [...prev, { 
        id: Date.now(), 
        text: aiReply, 
        sender: 'ai',
        generatedImg: generatedImg // إضافة رابط الصورة المولدة للرسالة
      }]);

    } catch (err) {
      console.error("تفاصيل الخطأ:", err); [cite: 19]
      setMessages(prev => [...prev, { 
        id: Date.now(), 
        text: `⚠️ عذراً: ${err.message || "حدث خطأ في الاتصال"}.`, 
        sender: 'ai' 
      }]); [cite: 21]
    } finally {
      setIsProcessing(false); [cite: 22]
    }
  };

  const handleImageAction = async (type) => {
    try {
      const base64 = type === 'camera' ? await takePhoto() : await fetchImage(); [cite: 23, 24]
      handleProcess("أرسلتُ صورة للتحليل", { type: 'image', data: base64 }); [cite: 24]
    } catch (e) { 
      setMessages(prev => [...prev, { id: Date.now(), text: "فشل الوصول للوسائط.", sender: 'ai' }]); [cite: 26]
    }
  };

  const toggleRecording = async () => {
    if (!isRecording) {
      const perm = await requestAudioPermissions(); [cite: 27]
      if (perm === 'granted') {
        await startRecording(); [cite: 28]
        setIsRecording(true);
      }
    } else {
      const audio = await stopRecording(); [cite: 29]
      setIsRecording(false);
      handleProcess("أرسلتُ تسجيلاً صوتياً", { type: 'audio', data: audio.value }); [cite: 30]
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(m => (
          <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl ${m.sender === 'user' ? 'bg-pink-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
              {m.text}
              
              {/* عرض الصورة إذا كانت مولدة من الذكاء الاصطناعي */}
              {m.generatedImg && (
                <div className="mt-3">
                  <img src={m.generatedImg} alt="Generated" className="rounded-lg w-full h-auto shadow-sm" />
                </div>
              )}

              {m.attachment && <div className="mt-2 text-xs opacity-70 italic">(تم إرسال وسائط للمعالجة...)</div>} [cite: 32]
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      <div className="p-4 border-t bg-white">
        <div className="flex gap-4 mb-3 justify-center border-b pb-2">
           <button onClick={() => handleImageAction('camera')} className="text-pink-600 flex flex-col items-center">
            <Camera size={22} /> <span className="text-[10px]">كاميرا</span> [cite: 33]
          </button>
          <button onClick={() => handleImageAction('gallery')} className="text-pink-600 flex flex-col items-center">
            <ImageIcon size={22} /> <span className="text-[10px]">معرض</span>
          </button>
          <button onClick={toggleRecording} className={`${isRecording ? 'text-red-500 animate-pulse' : 'text-pink-600'} flex flex-col items-center`}>
            {isRecording ? <MicOff size={22} /> : <Mic size={22} />} [cite: 35]
            <span className="text-[10px]">{isRecording ? 'إيقاف' : 'تسجيل'}</span> [cite: 36]
          </button>
        </div>
        <div className="flex gap-2">
          <input 
            value={input} 
            onChange={e => setInput(e.target.value)} 
            className="flex-1 border rounded-full px-4 py-2 text-right" 
            placeholder="اكتبي رسالتكِ أو اطلبي رسماً..." 
            dir="rtl" 
          />
          <button 
            onClick={() => handleProcess()} 
            disabled={isProcessing} 
            className="p-2 bg-pink-600 text-white rounded-full disabled:bg-gray-400"
          >
            {isProcessing ? <Loader2 className="animate-spin" /> : <Send />} [cite: 38]
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdviceChat;
