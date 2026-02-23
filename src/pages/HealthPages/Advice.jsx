import React, { useState, useRef, useEffect } from 'react';
import { CapacitorHttp } from '@capacitor/core';
import { Send, Image as ImageIcon, Camera, Mic, MicOff, Loader2, Paperclip } from 'lucide-react';
// استيراد الخدمات من MediaService لضمان عمل الوسائط ورفع الملفات
import { 
  fetchImage, 
  takePhoto, 
  requestAudioPermissions, 
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

  // تمرير تلقائي لأسفل الشات
  useEffect(() => { 
    scrollRef.current?.scrollIntoView({ behavior: "smooth" }); 
  }, [messages]);

  // معالجة إرسال الرسائل والملفات للسيرفر
  const handleProcess = async (textOverride = null, attachment = null) => {
    const content = textOverride || input;
    if (!content.trim() && !attachment) return;

    // عرض رسالة المستخدم مع المرفقات إن وجدت في الواجهة
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

  // وظيفة التعامل مع الكاميرا ومعرض الصور
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

  // وظيفة تسجيل الصوت مع طلب الإذن الإجباري للـ APK
  const toggleRecording = async () => {
    try {
      if (!isRecording) {
        const permission = await requestAudioPermissions();
        
        if (permission !== 'granted') {
          alert("يرجى منح صلاحية الميكروفون لتتمكني من التسجيل.");
          return;
        }

        await startRecording();
        setIsRecording(true);
      } else {
        const audioData = await stopRecording();
        setIsRecording(false);
        setIsProcessing(true);
        
        if (audioData && audioData.value) {
          const uploadRes = await uploadToVercel(audioData.value, `voice_${Date.now()}.wav`, 'audio/wav');
          handleProcess("لقد أرسلتُ تسجيلاً صوتياً.", { type: 'audio', url: uploadRes.url });
        }
      }
    } catch (err) {
      console.error("خطأ في التسجيل:", err);
      setIsRecording(false);
      alert("حدث خطأ في الميكروفون.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-pink-50">
      {/* عرض الرسائل */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(m => (
          <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-3 rounded-lg max-w-[80%] shadow-sm ${
              m.sender === 'user' ? 'bg-pink-600 text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none'
            }`}>
              {m.image && <img src={m.image} alt="upload" className="mb-2 rounded-md max-w-full h-auto border border-pink-200" />}
              {m.audio && (
                <div className="bg-pink-100 p-2 rounded mb-2">
                  <audio src={m.audio} controls className="w-full h-8" />
                </div>
              )}
              <p className="text-right leading-relaxed" dir="rtl">{m.text}</p>
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      {/* شريط الأدوات والمدخلات */}
      <div className="p-4 bg-white border-t shadow-lg">
        <div className="flex gap-4 justify-center mb-3 border-b pb-2">
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

        <div className="flex gap-2 items-center">
          <input 
            value={input} 
            onChange={e => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !isProcessing && handleProcess()}
            className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-right focus:outline-none bg-gray-50 focus:border-pink-500" 
            placeholder="اكتبي رسالتكِ..."
            dir="rtl"
          />
          <button 
            onClick={() => handleProcess()} 
            disabled={isProcessing || (!input.trim() && !isRecording)}
            className="p-2 bg-pink-600 text-white rounded-full shadow-md disabled:bg-gray-300"
          >
            {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} className="rotate-180" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdviceChat;
