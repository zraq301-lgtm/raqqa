import React, { useState, useEffect } from 'react';

const RoqaDirectView = () => {
  const [postData, setPostData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // حالات التفاعل المحلي
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  const API_URL = "https://public-api.wordpress.com/wp/v2/sites/raqqastor3.wordpress.com/posts?categories=788594722&_embed";

  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(posts => {
        if (posts.length > 0) {
          const post = posts[0];
          setPostData(post);
          
          // تحميل الإعجابات والتعليقات من التخزين المحلي (LocalStorage)
          const savedLikes = localStorage.getItem(`likes_${post.id}`);
          const savedComments = localStorage.getItem(`comments_${post.id}`);
          const userLiked = localStorage.getItem(`isLiked_${post.id}`);

          if (savedLikes) setLikes(parseInt(savedLikes));
          if (savedComments) setComments(JSON.parse(savedComments));
          if (userLiked) setIsLiked(true);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // وظيفة الإعجاب
  const handleLike = () => {
    const newLikeStatus = !isLiked;
    const newCount = newLikeStatus ? likes + 1 : likes - 1;
    setLikes(newCount);
    setIsLiked(newLikeStatus);
    localStorage.setItem(`likes_${postData.id}`, newCount);
    localStorage.setItem(`isLiked_${postData.id}`, newLikeStatus);
  };

  // وظيفة التعليق
  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    const updatedComments = [...comments, { text: newComment, date: new Date().toLocaleString('ar-EG') }];
    setComments(updatedComments);
    setNewComment("");
    localStorage.setItem(`comments_${postData.id}`, JSON.stringify(updatedComments));
  };

  // وظيفة المشاركة
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: postData.title.rendered,
        url: postData.link
      });
    } else {
      alert("نسخ الرابط: " + postData.link);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-[#fffafa]">
      <div className="animate-bounce text-pink-500 font-bold">جاري تحميل عالم رقة... ✨</div>
    </div>
  );

  if (!postData) return <p className="text-center p-10">لا يوجد محتوى متاح.</p>;

  return (
    <div className="min-h-screen bg-[#fffcfd] p-4 font-sans" dir="rtl">
      {/* كارت المقال الأنيق */}
      <div className="max-w-xl mx-auto bg-white/70 backdrop-blur-lg border border-white/50 rounded-[2.5rem] shadow-xl overflow-hidden">
        
        {/* الصورة الرئيسية */}
        {postData._embedded?.['wp:featuredmedia'] && (
          <img 
            src={postData._embedded['wp:featuredmedia'][0].source_url} 
            className="w-full h-64 object-cover"
            alt="عنوان المقال"
          />
        )}

        <div className="p-6">
          <h1 
            className="text-2xl font-black text-gray-800 mb-4"
            dangerouslySetInnerHTML={{ __html: postData.title.rendered }}
          />

          <div 
            className="wordpress-content text-gray-600 leading-relaxed mb-8"
            dangerouslySetInnerHTML={{ __html: postData.content.rendered }} 
          />

          {/* شريط أدوات التفاعل */}
          <div className="flex items-center justify-between border-t border-b border-pink-50 py-4 mb-6">
            <button 
              onClick={handleLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition ${isLiked ? 'bg-pink-500 text-white' : 'bg-pink-50 text-pink-500'}`}
            >
              <span>{isLiked ? '❤️' : '🤍'}</span>
              <span className="font-bold">{likes}</span>
            </button>

            <button 
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-500 rounded-full font-bold transition hover:bg-blue-100"
            >
              <span>🔗</span> مشاركة
            </button>
          </div>

          {/* قسم التعليقات */}
          <div className="space-y-4">
            <h3 className="font-bold text-gray-700 flex items-center gap-2">
              <span>💬</span> التعليقات ({comments.length})
            </h3>
            
            <div className="max-h-60 overflow-y-auto space-y-3 mb-4 custom-scrollbar">
              {comments.map((c, i) => (
                <div key={i} className="bg-pink-50/50 p-3 rounded-2xl border border-white">
                  <p className="text-sm text-gray-700">{c.text}</p>
                  <span className="text-[10px] text-gray-400">{c.date}</span>
                </div>
              ))}
              {comments.length === 0 && <p className="text-xs text-gray-400 text-center py-4">كوني أول من يعلق على هذا المقال ✨</p>}
            </div>

            <form onSubmit={handleAddComment} className="flex gap-2">
              <input 
                type="text" 
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="اكتبي تعليقك هنا..."
                className="flex-1 bg-white border border-pink-100 rounded-2xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200"
              />
              <button className="bg-pink-500 text-white px-4 py-2 rounded-2xl text-sm font-bold">إرسال</button>
            </form>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .wordpress-content img {
          max-width: 100%;
          height: auto;
          border-radius: 1.5rem;
          margin: 1rem 0;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #fbcfe8;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default RoqaDirectView;
