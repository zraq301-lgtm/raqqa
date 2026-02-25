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

  // تمرير تلقائي لآخر رسالة
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleProcess = async (textOverride = null, attachment = null) => {
    const content = textOverride || input; [cite: 6, 7]
    if (!content.trim() && !attachment) return; [cite: 7]

    setIsProcessing(true); [cite: 7]
    const userMsgId = Date.now(); [cite: 7]

    // 1. عرض رسالة المستخدم فوراً
    setMessages(prev => [...prev, { id: userMsgId, text: content, sender: 'user', attachment }]); [cite: 8]
    setInput(''); [cite: 9]

    try {
      let finalAttachmentUrl = null;

      // 2. معالجة المرفق والرفع إلى Vercel Blob
      if (attachment) { [cite: 10]
        const fileName = attachment.type === 'image' ? `img_${userMsgId}.png` : `audio_${userMsgId}.aac`; [cite: 10, 11]
        const mimeType = attachment.type === 'image' ? 'image/png' : 'audio/aac'; [cite: 11]
        
        // استدعاء خدمة الرفع (تأكدي أن MediaService يوجه الطلب لـ /api/upload)
        finalAttachmentUrl = await uploadToVercel(attachment.data, fileName, mimeType); [cite: 11]
      }

      // 3. الاتصال بـ الذكاء الاصطناعي عبر المحرك الأصلي CapacitorHttp
      const options = {
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai', [cite: 12]
        headers: { 'Content-Type': 'application/json' }, [cite: 12]
        data: {
          prompt: `أنا أنثى مسلمة، إليكِ رسالتي: ${content}. ${finalAttachmentUrl ? `مرفق رابط الوسائط: ${finalAttachmentUrl}` : ''}` [cite: 12, 13]
        }
      };

      const response = await CapacitorHttp.post(options); [cite: 14]
      const aiReply = response.data.reply || response.data.message || "عذراً، لم أستطع فهم ذلك."; [cite: 14]
      
      setMessages(prev => [...prev, { id: Date.now(), text: aiReply, sender: 'ai' }]); [cite: 15]

    } catch (err) {
      console.error("خطأ:", err); [cite: 16]
      setMessages(prev => [...prev, { id: Date.now(), text: "عذراً، حدث خطأ في الشبكة.", sender: 'ai' }]); [cite: 17]
    } finally {
      setIsProcessing(false); [cite: 18]
    }
  };

  const handleImageAction = async (type) => {
    try {
      const base64 = type === 'camera' ? await takePhoto() : await fetchImage(); [cite: 19, 20]
      handleProcess("أرسلتُ صورة لكِ", { type: 'image', data: base64 }); [cite: 20]
    } catch (e) { 
      console.error("فشل جلب الصورة"); [cite: 21]
    }
  };

  const toggleRecording = async () => {
    if (!isRecording) {
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

  return (
    <div className="flex flex-col h-screen bg-white"> [cite: 26]
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(m => (
          <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl ${m.sender === 'user' ? 'bg-pink-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
              {m.text} [cite: 27]
              {m.attachment && <div className="mt-2 text-[10px] opacity-70 italic">(تم إرفاق وسائط سحابية)</div>} [cite: 27]
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

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
          <button onClick={() => handleProcess()} disabled={isProcessing} className="p-2 bg-pink-600 text-white rounded-full">
            {isProcessing ? <Loader2 className="animate-spin" /> : <Send />} [cite: 32]
          </button>
        </div>
      </div>
    </div>
  );
}; [cite: 33]

export default AdviceChat;
