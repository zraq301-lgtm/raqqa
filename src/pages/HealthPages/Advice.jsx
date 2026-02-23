import React, { useState, useRef, useEffect } from 'react';
import { CapacitorHttp } from '@capacitor/core';
import { Send, Image as ImageIcon, Camera, Mic, MicOff, Loader2 } from 'lucide-react';
// استيراد الخدمات المحدثة لدعم الصوت والكاميرا
import { 
  fetchImage, 
  takePhoto, 
  startRecording, 
  stopRecording, 
  uploadToVercel 
} from '../../services/MediaService'; 

const AdviceChat = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: "أهلاً بكِ في قسم الاستشارات، كيف أساعدكِ؟", sender: 'ai' }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => { 
    scrollRef.current?.scrollIntoView({ behavior: "smooth" }); 
  }, [messages]);

  const handleProcess = async (textOverride = null, attachment = null) => {
    const content = textOverride || input;
    if (!content.trim() && !attachment) return;

    setMessages(prev => [...prev, { 
      id: Date.now(), 
      text: content, 
      image: attachment?.type === 'image' ? attachment.url : null,
      audio: attachment?.type === 'audio' ? attachment.url : null,
      sender: 'user' 
    }]);
    
    setInput('');
    setIsProcessing(true);

    try {
      const options = {
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: { prompt: `أنا أنثى مسلمة... ${content}` }
      };
      
      const response = await CapacitorHttp.post(options);
      const responseText = response.data.reply || response.data.message;
      
      setMessages(prev => [...prev, { id: Date.now() + 1, text: responseText, sender: 'ai' }]);
    } catch (err) {
      console.error("خطأ في الاتصال:", err);
      setMessages(prev => [...prev, { id: Date.now() + 1, text: "حدث خطأ في الاتصال بالسيرفر.", sender: 'ai' }]);
    } finally {
      setIsProcessing(false);
    }
  };

  // وظيفة التعامل مع الصور (كاميرا أو استوديو)
  const handleImageAction = async (type = 'gallery') => {
    try {
      const photoBase64 = type === 'camera' ? await takePhoto() : await fetchImage();
      if (photoBase64) {
        setIsProcessing(true);
        const uploadRes = await uploadToVercel(photoBase64, `photo_${Date.now()}.jpg`, 'image/jpeg');
        handleProcess("لقد أرسلتُ صورة للاستشارة.", { type: 'image', url: uploadRes.url });
      }
    } catch (err) {
      alert("فشل في معالجة الصورة.");
    } finally {
      setIsProcessing(false);
    }
  };

  // وظيفة التعامل مع تسجيل الصوت
  const toggleRecording = async () => {
    try {
      if (!isRecording) {
        await startRecording();
        setIsRecording(true);
      } else {
        const audioData = await stopRecording();
        setIsRecording(false);
        setIsProcessing(true);
        
        // رفع ملف الصوت
        const uploadRes = await uploadToVercel(audioData.value, `voice_${Date.now()}.wav`, 'audio/wav');
        handleProcess("لقد أرسلتُ تسجيلاً صوتياً.", { type: 'audio', url: uploadRes.url });
      }
    } catch (err) {
      console.error("خطأ في التسجيل:", err);
      setIsRecording(false);
      alert("يرجى منح صلاحية الميكروفون.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-pink-50">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(m => (
          <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-3 rounded-lg max-w-[80%] shadow-sm ${
              m.sender === 'user' ? 'bg-pink-600 text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none'
            }`}>
              {m.image && <img src={m.image} alt="upload" className="mb-2 rounded-md max-w-full" />}
              {m.audio && <audio src={m.audio} controls className="mb-2 max-w-full" />}
              <p className="text-right leading-relaxed" dir="rtl">{m.text}</p>
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      <div className="p-4 bg-white flex flex-col gap-2 border-t shadow-lg">
        {/* أزرار الوسائط الإضافية */}
        <div className="flex gap-4 justify-center mb-2 border-b pb-2">
          <button onClick={() => handleImageAction('camera')} className="text-pink-600 flex flex-col items-center">
            <Camera size={20} /> <span className="text-[10px]">كاميرا</span>
          </button>
          <button onClick={() => handleImageAction('gallery')} className="text-pink-600 flex flex-col items-center">
            <ImageIcon size={20} /> <span className="text-[10px]">معرض</span>
          </button>
          <button onClick={toggleRecording} className={`${isRecording ? 'text-red-500 animate-pulse' : 'text-pink-600'} flex flex-col items-center`}>
            {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
            <span className="text-[10px]">{isRecording ? 'إيقاف' : 'تسجيل'}</span>
          </button>
        </div>

        <div className="flex gap-2 items-center">
          <input 
            value={input} 
            onChange={e => setInput(e.target.value)}
            className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-right focus:outline-none bg-gray-50" 
            placeholder="اكتبي رسالتكِ..."
            dir="rtl"
          />
          <button onClick={() => handleProcess()} disabled={isProcessing || (!input.trim() && !isRecording)} className="p-2 bg-pink-600 text-white rounded-full">
            {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} className="rotate-180" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdviceChat;
