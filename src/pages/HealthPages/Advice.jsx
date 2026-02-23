import React, { useState, useRef, useEffect } from 'react';
import { CapacitorHttp } from '@capacitor/core';
import { Send, Image as ImageIcon, Loader2 } from 'lucide-react';
// تصحيح المسار: نخرج من HealthPages ثم من pages للوصول إلى services
import { fetchImage, uploadToVercel } from '../../services/MediaService'; 

const AdviceChat = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: "أهلاً بكِ في قسم الاستشارات، كيف أساعدكِ؟", sender: 'ai' }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollRef = useRef(null);

  // تمرير تلقائي لأسفل الشات عند إضافة رسائل جديدة
  useEffect(() => { 
    scrollRef.current?.scrollIntoView({ behavior: "smooth" }); 
  }, [messages]);

  const handleProcess = async (textOverride = null) => {
    const content = textOverride || input;
    if (!content.trim()) return;

    // إضافة رسالة المستخدم للواجهة
    setMessages(prev => [...prev, { id: Date.now(), text: content, sender: 'user' }]);
    setInput('');
    setIsProcessing(true);

    try {
      const options = {
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: { prompt: `أنا أنثى مسلمة... ${content}` }
      };

      // الاتصال عبر CapacitorHttp لضمان العمل على APK وتجاوز CORS
      const response = await CapacitorHttp.post(options);
      const responseText = response.data.reply || response.data.message;
      
      setMessages(prev => [...prev, { id: Date.now() + 1, text: responseText, sender: 'ai' }]);
    } catch (err) {
      console.error("خطأ في الاتصال:", err);
      setMessages(prev => [...prev, { id: Date.now() + 1, text: "حدث خطأ في الاتصال بالسيرفر، يرجى التأكد من الإنترنت.", sender: 'ai' }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMedia = async () => {
    // فتح الكاميرا أو الاستوديو
    const photo = await fetchImage();
    
    if (photo?.webPath) {
      setIsProcessing(true);
      try {
        // رفع الصورة إلى Vercel Blob باستخدام الرابط الموجود في MediaService
        const url = await uploadToVercel(photo.webPath);
        
        // عرض الصورة في الشات
        setMessages(prev => [...prev, { 
          id: Date.now(), 
          text: "📷 صورة مرفقة", 
          image: url, 
          sender: 'user' 
        }]);

        // إرسال تنبيه للذكاء الاصطناعي بوجود صورة
        handleProcess("لقد أرسلت لكِ صورة لتحليلها.");
      } catch (err) {
        console.error("خطأ في الرفع:", err);
        alert("فشل رفع الصورة، يرجى المحاولة لاحقاً.");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="flex flex-col h-screen bg-pink-50">
      {/* منطقة الرسائل */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(m => (
          <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-3 rounded-lg max-w-[80%] shadow-sm ${
              m.sender === 'user' ? 'bg-pink-600 text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none'
            }`}>
              {m.image && (
                <img src={m.image} alt="uploaded" className="mb-2 rounded-md max-w-full h-auto border border-pink-200" />
              )}
              <p className="text-right leading-relaxed" dir="rtl">{m.text}</p>
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      {/* منطقة الإدخال */}
      <div className="p-4 bg-white flex gap-2 items-center border-t shadow-lg">
        <button 
          onClick={handleMedia} 
          disabled={isProcessing}
          className="p-2 text-pink-600 hover:bg-pink-50 rounded-full transition-colors"
          title="إرفاق صورة"
        >
          <ImageIcon size={24} />
        </button>
        
        <input 
          value={input} 
          onChange={e => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !isProcessing && handleProcess()}
          className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-right focus:outline-none focus:border-pink-500 bg-gray-50" 
          placeholder="اكتبي رسالتكِ هنا..."
          dir="rtl"
        />
        
        <button 
          onClick={() => handleProcess()} 
          disabled={isProcessing || !input.trim()} 
          className="p-2 bg-pink-600 text-white rounded-full disabled:bg-gray-300 shadow-md hover:bg-pink-700 transition-all"
        >
          {isProcessing ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <Send size={20} className="rotate-180" />
          )}
        </button>
      </div>
    </div>
  );
};

export default AdviceChat;
