import React, { useState, useEffect } from 'react';
import { CapacitorHttp } from '@capacitor/core';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [newContent, setNewContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [selectedSection, setSelectedSection] = useState("bouh-display-1");
  const [loading, setLoading] = useState(false);

  // حالات الدردشة الذكية والتفاعلات
  const [showAiChat, setShowAiChat] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [likedPosts, setLikedPosts] = useState({});
  const [activeCommentId, setActiveCommentId] = useState(null);

  const API_GET = "https://raqqa-v6cd.vercel.app/api/get-posts";
  const API_SAVE = "https://raqqa-v6cd.vercel.app/api/save-post";
  const API_AI = "https://raqqa-v6cd.vercel.app/api/raqqa-ai";

  useEffect(() => { fetchPosts(); }, []);

  const fetchPosts = async () => {
    try {
      const response = await CapacitorHttp.get({ url: API_GET });
      if (response.data && response.data.posts) {
        setPosts(response.data.posts);
      }
    } catch (error) { console.error("Fetch Error:", error); }
  };

  // وظيفة دردشة الأرجوحة (تحليل العضوة)
  const handleAiChat = async () => {
    setIsAiLoading(true);
    setShowAiChat(true);
    try {
      // تحليل الشخصية بناءً على محتوى المنشورات المجلوبة
      const userContext = posts.slice(0, 5).map(p => p.content).join(" | ");
      const options = {
        url: API_AI,
        headers: { 'Content-Type': 'application/json' },
        data: {
          prompt: `أنتِ "صديقة الأرجوحة" الذكية. حللي شخصية العضوة بناءً على هذه المنشورات: (${userContext}). ردي عليها كصديقة مقربة تنصحها وتدعمها بأسلوب أنثوي رقيق جداً.`
        }
      };
      const response = await CapacitorHttp.post(options);
      setAiResponse(response.data.reply || response.data.message);
    } catch (err) {
      setAiResponse("عذراً رفيقتي، واجهت مشكلة في الاتصال بمشاعركِ الآن. حاولي لاحقاً 🌸");
    } finally { setIsAiLoading(false); }
  };

  const handlePublish = async () => {
    if (!newContent.trim()) return;
    setLoading(true);
    try {
      // إرسال البيانات لتطابق ملف save-post.js
      const options = {
        url: API_SAVE,
        headers: { 'Content-Type': 'application/json' },
        data: {
          content: newContent,
          section: selectedSection,
          type: mediaUrl ? "رابط" : "نصي",
          external_link: mediaUrl 
        }
      };
      await CapacitorHttp.post(options);
      setNewContent(""); setMediaUrl(""); fetchPosts();
    } catch (err) { console.error("Save Error:", err); }
    finally { setLoading(false); }
  };

  const renderMedia = (url) => {
    if (!url) return null;
    const isVideo = url.toLowerCase().includes('.mp4') || url.includes('youtube.com');
    return isVideo ? (
      <video controls className="post-media-fixed"><source src={url} type="video/mp4" /></video>
    ) : (
      <img src={url} alt="post" className="post-media-fixed" />
    );
  };

  return (
    <div className="home-main">
      <style>{`
        .home-main { direction: rtl; font-family: 'Tajawal', sans-serif; }
        
        /* زر دردشة الأرجوحة العلوي */
        .ai-chat-trigger {
          background: white; border: 2px solid var(--female-pink);
          color: var(--female-pink); width: 92%; margin: 15px auto;
          padding: 12px; border-radius: 20px; font-weight: bold;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          cursor: pointer; box-shadow: 0 4px 10px var(--female-pink-light);
        }

        /* كارت النشر المتوافق مع النمط */
        .publish-box {
          background: white; margin: 10px; padding: 15px; border-radius: 25px;
          border: 1px solid var(--female-pink-light);
        }
        .section-dropdown {
          width: 100%; padding: 8px; border-radius: 12px; margin-bottom: 10px;
          border: 1px solid var(--female-pink-light); color: var(--female-pink);
        }

        /* نمط المنشورات كما في الصورة المرفوعة */
        .post-card-style {
          background: white; margin: 20px 15px; border-radius: 35px;
          border: 1px solid var(--female-pink-light); overflow: hidden;
          box-shadow: 0 4px 15px rgba(0,0,0,0.02);
        }
        .post-info { padding: 15px; text-align: right; border-bottom: 1px solid #fdf2f4; }
        .post-media-fixed { width: 100%; max-height: 380px; object-fit: cover; display: block; }
        
        .interaction-bar {
          display: flex; justify-content: space-around; padding: 12px;
          background: #fff;
        }
        .int-btn {
          background: none; border: none; color: var(--female-pink);
          font-family: 'Tajawal'; font-weight: bold; cursor: pointer;
          display: flex; flex-direction: column; align-items: center; gap: 4px;
        }
        .ai-display {
          background: var(--soft-bg); margin: 10px; padding: 15px;
          border-radius: 20px; border: 1px dashed var(--female-pink);
        }
      `}</style>

      {/* زر دردشة الأرجوحة */}
      <button className="ai-chat-trigger" onClick={handleAiChat}>
        <span>✨ دردشة الأرجوحة (صديقتكِ الذكية)</span>
      </button>

      {showAiChat && (
        <div className="ai-display">
          <small style={{color: 'var(--accent-purple)'}}>🌸 تحليل صديقتكِ لشخصيتكِ:</small>
          <p style={{fontSize: '0.9rem', marginTop: '5px'}}>
            {isAiLoading ? "جاري قراءة كلماتكِ الرقيقة..." : aiResponse}
          </p>
          <button onClick={()=>setShowAiChat(false)} style={{border:'none', background:'none', color:'#999', fontSize:'0.7rem'}}>إغلاق</button>
        </div>
      )}

      {/* كارت النشر */}
      <div className="publish-box">
        <select className="section-dropdown" value={selectedSection} onChange={(e)=>setSelectedSection(e.target.value)}>
          <option value="bouh-display-1">حكايات لا تنتهي (1)</option>
          <option value="bouh-display-2">ملاذ القلوب (2)</option>
          <option value="bouh-display-3">قوة لترعيك (3)</option>
          <option value="bouh-display-4">لمسة مليئة (4)</option>
          <option value="bouh-display-5">ذكاء ووعي (5)</option>
        </select>
        <textarea 
          style={{width:'100%', border:'none', outline:'none', minHeight:'60px'}}
          placeholder="ماذا يدور في خاطركِ يا جميلة؟"
          value={newContent}
          onChange={(e)=>setNewContent(e.target.value)}
        />
        <input 
          style={{width:'100%', padding:'5px', border:'1px solid #f9f9f9', fontSize:'0.8rem'}}
          placeholder="رابط خارجي (صورة أو فيديو mp4)..."
          value={mediaUrl}
          onChange={(e)=>setMediaUrl(e.target.value)}
        />
        <button 
          style={{float:'left', background:'var(--female-pink)', color:'white', border:'none', padding:'6px 20px', borderRadius:'15px', marginTop:'10px'}}
          onClick={handlePublish} disabled={loading}
        >
          {loading ? "جاري..." : "نشر"}
        </button>
        <div style={{clear:'both'}}></div>
      </div>

      {/* عرض المنشورات بنمط الصورة المرفوعة */}
      <div className="feed">
        {posts.map((post) => (
          <div key={post.id} className="post-card-style">
            <div className="post-info">
              <span style={{fontSize:'0.7rem', color:'#bbb'}}>{post.section}</span>
              <p style={{color: 'var(--text-gray)', marginTop: '5px'}}>{post.content}</p>
            </div>
            
            {renderMedia(post.media_url)}

            <div className="interaction-bar">
              <button className="int-btn" onClick={()=>setLikedPosts({...likedPosts, [post.id]: (likedPosts[post.id]||0)+1})}>
                ❤️ <span style={{fontSize:'0.8rem'}}>{likedPosts[post.id] || 0} إعجاب</span>
              </button>
              <button className="int-btn" onClick={()=>setActiveCommentId(post.id)}>
                💬 <span style={{fontSize:'0.8rem'}}>تعليق</span>
              </button>
              <button className="int-btn">
                🔗 <span style={{fontSize:'0.8rem'}}>مشاركة</span>
              </button>
            </div>

            {activeCommentId === post.id && (
              <div style={{padding:'10px', background:'#fcfcfc', borderTop:'1px solid #eee'}}>
                <input placeholder="اكتبي ردكِ..." style={{width:'80%', padding:'5px', borderRadius:'10px', border:'1px solid #ddd'}} />
                <button style={{border:'none', background:'none', color:'var(--female-pink)', fontWeight:'bold'}}>رد</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
