import React, { useState, useRef, useEffect } from 'react';
import { CapacitorHttp } from '@capacitor/core';
import { Send, Image as ImageIcon, Loader2, User, Bot } from 'lucide-react';
import { fetchImage, uploadToVercel } from './services/MediaService';

const ChatInterface = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: "مرحباً بكِ، أنا رقة. كيف يمكنني مساعدتكِ اليوم؟", sender: 'ai' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const scrollRef = useRef(null);

  // التمرير التلقائي لآخر رسالة
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // دالة إرسال الرسائل النصية والاتصال بـ AI
  const handleSendMessage = async (textOverride = null) => {
    const messageText = textOverride || input;
    if (!messageText.trim()) return;

    const userMsg = { id: Date.now(), text: messageText, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const options = {
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: {
          prompt: `أنا أنثى مسلمة... ${messageText}` 
        }
      };

      // استخدام CapacitorHttp الموصى به لتطبيقات APK
      const response = await CapacitorHttp.post(options);
      const responseText = response.data.reply || response.data.message || "عذراً، لم أستطع فهم ذلك.";

      setMessages(prev => [...prev, { id: Date.now() + 1, text: responseText, sender: 'ai' }]);
    } catch (err) {
      console.error("فشل الاتصال:", err);
      setMessages(prev => [...prev, { id: Date.now() + 1, text: "حدث خطأ في الشبكة، تأكدي من الاتصال بالإنترنت.", sender: 'ai' }]);
    } finally {
      setLoading(false);
    }
  };

  // دالة التعامل مع رفع الصور
  const handleImagePick = async () => {
    const photo = await fetchImage();
    if (photo && photo.webPath) {
      setIsUploading(true);
      try {
        const imageUrl = await uploadToVercel(photo.webPath);
        // إرسال الصورة كرسالة تحتوي على رابط
        const imageMsg = { id: Date.now(), text: "📷 صورة مرفقة", image: imageUrl, sender: 'user' };
        setMessages(prev => [...prev, imageMsg]);
        
        // اختيارياً: إخبار الذكاء الاصطناعي أنه تم رفع صورة
        handleSendMessage("لقد قمت برفع صورة لكِ، هل يمكنكِ رؤيتها؟");
      } catch (error) {
        alert("فشل رفع الصورة، يرجى المحاولة مرة أخرى.");
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="p-4 bg-white border-b shadow-sm flex items-center gap-3">
        <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
          <Bot className="text-pink-500" />
        </div>
        <h1 className="font-bold text-gray-800">رقة AI</h1>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl ${
              msg.sender === 'user' ? 'bg-pink-500 text-white rounded-tr-none' : 'bg-white border rounded-tl-none text-gray-800 shadow-sm'
            }`}>
              {msg.image && (
                <img src={msg.image} alt="Uploaded" className="rounded-lg mb-2 max-h-60 w-full object-cover" />
              )}
              <p dir="rtl">{msg.text}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-pink-500" />
              <span className="text-sm text-gray-500">رقة تفكر...</span>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t">
        <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-full">
          <button 
            onClick={handleImagePick}
            disabled={isUploading}
            className="p-2 text-gray-500 hover:text-pink-500 transition-colors"
          >
            {isUploading ? <Loader2 className="animate-spin" /> : <ImageIcon size={24} />}
          </button>
          
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="اكتبي رسالتكِ هنا..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-right py-2 px-1"
            dir="rtl"
          />
          
          <button 
            onClick={() => handleSendMessage()}
            disabled={loading || !input.trim()}
            className="p-2 bg-pink-500 text-white rounded-full disabled:bg-gray-300 transition-all shadow-md"
          >
            <Send size={20} className="rotate-180" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
