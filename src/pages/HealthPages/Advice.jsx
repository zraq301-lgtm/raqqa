import React, { useState, useRef, useEffect } from 'react';
import { CapacitorHttp } from '@capacitor/core'; [cite: 1]
import { Send, Image as ImageIcon, Camera, Mic, MicOff, Loader2 } from 'lucide-react'; [cite: 2]
import { 
  fetchImage, takePhoto, requestAudioPermissions, 
  startRecording, stopRecording, uploadToVercel 
} from '../../services/MediaService'; [cite: 3]

const AdviceChat = () => {
  const [messages, setMessages] = useState([{ id: 1, text: "أهلاً بكِ، كيف أساعدكِ؟", sender: 'ai' }]); [cite: 4]
  const [input, setInput] = useState(''); [cite: 5]
  const [isProcessing, setIsProcessing] = useState(false); [cite: 5]
  const [isRecording, setIsRecording] = useState(false); [cite: 5]
  const scrollRef = useRef(null); [cite: 5]

  // التمرير التلقائي لأسفل عند إضافة رسائل جديدة
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleProcess = async (textOverride = null, attachment = null) => { [cite: 6]
    const content = textOverride || input; [cite: 6, 7]
    if (!content.trim() && !attachment) return; [cite: 7]

    setIsProcessing(true); [cite: 8]
    const userMsgId = Date.now(); [cite: 8]

    // 1. عرض رسالة المستخدم فوراً في الواجهة
    setMessages(prev => [...prev, { id: userMsgId, text: content, sender: 'user', attachment }]); [cite: 8]
    setInput(''); [cite: 9]

    try {
      let finalAttachmentUrl = null; [cite: 9]

      // 2. معالجة المرفق (صورة أو صوت) ورفعه إلى Vercel Blob
      if (attachment) { [cite: 10]
        const fileName = attachment.type === 'image' ? `img_${userMsgId}.png` : `audio_${userMsgId}.aac`; [cite: 10, 11]
        const mimeType = attachment.type === 'image' ? 'image/png' : 'audio/aac'; [cite: 11]
        
        // استخدام رابط API الخاص بالرفع الذي زودتني به
        finalAttachmentUrl = await uploadToVercel(attachment.data, fileName, mimeType); [cite: 11]
      }

      // 3. إعداد خيارات الاتصال بـ الذكاء الاصطناعي عبر CapacitorHttp [cite: 12]
      const options = {
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai', [cite: 12]
        headers: { 'Content-Type': 'application/json' }, [cite: 12]
        data: {
          prompt: `أنا أنثى مسلمة، إليكِ رسالتي: ${content}. ${finalAttachmentUrl ? `مرفق رابط الوسائط للتحليل: ${finalAttachmentUrl}` : ''}` [cite: 12, 13]
        }
      };

      // الاتصال عبر المحرك الأصلي المدمج
      const response = await CapacitorHttp.post(options); [cite: 14]
      
      // استخراج الرد من البيانات المستلمة
      const aiReply = response.data.reply || response.data.message || "عذراً، لم أستطع فهم ذلك."; [cite: 14]
      
      setMessages(prev => [...prev, { id: Date.now(), text: aiReply, sender: 'ai' }]); [cite: 15]

    } catch (err) { [cite: 16]
      console.error("خطأ في الاتصال:", err); [cite: 16]
      setMessages(prev => [...prev, { id: Date.now(), text: "عذراً، حدث خطأ في الشبكة، تأكدي من الاتصال بالإنترنت.", sender: 'ai' }]); [cite: 17]
    } finally {
      setIsProcessing(false); [cite: 18]
    }
  };

  // دالة التقاط أو اختيار الصور
  const handleImageAction = async (type) => { [cite: 19]
    try {
      const base64 = type === 'camera' ? await takePhoto() : await fetchImage(); [cite: 19, 20]
      handleProcess("أرسلتُ صورة لكِ", { type: 'image', data: base64 }); [cite: 20]
    } catch (e) { 
      console.error("فشل جلب الصورة", e); [cite: 21]
    }
  };

  // دالة التسجيل الصوتي
  const toggleRecording = async () => { [cite: 22]
    if (!isRecording) { [cite: 22]
      const perm = await requestAudioPermissions(); [cite: 22]
      if (perm === 'granted') { [cite: 23]
        await startRecording(); [cite: 23]
        setIsRecording(true); [cite: 23]
      }
    } else {
      const audio = await stopRecording(); [cite: 24]
      setIsRecording(false); [cite: 24]
      handleProcess("أرسلتُ تسجيلاً صوتياً", { type: 'audio', data: audio.value }); [cite: 25]
    }
  };

  return ( [cite: 26]
    <div className="flex flex-col h-screen bg-white">
      {/* منطقة عرض الرسائل */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(m => (
          <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl ${m.sender === 'user' ? 'bg-pink-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
              {m.text} [cite: 27]
              {m.attachment && <div className="mt-2 text-[10px] italic opacity-70">(تم رفع المرفق لتحليله...)</div>} [cite: 27]
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      {/* منطقة الإدخال والأدوات */}
      <div className="p-4 border-t bg-white">
        <div className="flex gap-4 mb-3 justify-center border-b pb-2"> [cite: 28]
          <button onClick={() => handleImageAction('camera')} className="text-pink-600 flex flex-col items-center">
            <Camera size={22} /> <span className="text-[10px]">كاميرا</span>
          </button>
          <button onClick={() => handleImageAction('gallery')} className="text-pink-600 flex flex-col items-center">
            <ImageIcon size={22} /> <span className="text-[10px]">معرض</span>
          </button>
          <button onClick={toggleRecording} 
            className={`${isRecording ? [cite_start]'text-red-500 animate-pulse' : 'text-pink-600'} flex flex-col items-center`}> [cite: 29]
            {isRecording ? <MicOff size={22} /> : <Mic size={22} />} [cite: 30]
            <span className="text-[10px]">{isRecording ? 'إيقاف' : 'تسجيل'}</span> [cite: 31]
          </button>
        </div>
        
        <div className="flex gap-2">
          <input 
            value={input} 
            onChange={e => setInput(e.target.value)} 
            className="flex-1 border rounded-full px-4 py-2 text-right" 
            placeholder="اكتبي رسالتكِ..." 
            dir="rtl" 
          />
          <button 
            onClick={() => handleProcess()} 
            disabled={isProcessing} 
            className="p-2 bg-pink-600 text-white rounded-full transition-colors disabled:bg-gray-400"
          >
            {isProcessing ? <Loader2 className="animate-spin" /> : <Send />} [cite: 32]
          </button>
        </div>
      </div>
    </div>
  );
}; [cite: 33]

export default AdviceChat;
