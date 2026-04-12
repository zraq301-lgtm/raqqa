import React, { useState, useEffect } from 'react';

const RoqaDirectView = () => {
  const [postData, setPostData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // حالات التفاعل المحلي
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  const APP_URL = "https://raqa-1zhm.vercel.app/";
  const API_URL = "https://public-api.wordpress.com/wp/v2/sites/raqqastor3.wordpress.com/posts?categories=788594722&_embed";

  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(posts => {
        if (posts.length > 0) {
          const post = posts[0];
          setPostData(post);
          
          // تحميل البيانات من LocalStorage
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

  const handleLike = () => {
    const newLikeStatus = !isLiked;
    const newCount = newLikeStatus ? likes + 1 : likes - 1;
    setLikes(newCount);
    setIsLiked(newLikeStatus);
    localStorage.setItem(`likes_${postData.id}`, newCount);
    localStorage.setItem(`isLiked_${postData.id}`, newLikeStatus);
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    const updatedComments = [...comments, { text: newComment, date: new Date().toLocaleString('ar-EG') }];
    setComments(updatedComments);
    setNewComment("");
    localStorage.setItem(`comments_${postData.id}`, JSON.stringify(updatedComments));
  };

  // وظيفة المشاركة المعدلة لتشمل رابط التطبيق
  const handleShare = () => {
    const shareText = `أعجبني هذا المقال في تطبيق رقة: ${postData.title.rendered}\nحملي التطبيق الآن من هنا: ${APP_URL}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'تطبيق رقة',
        text: shareText,
        url: APP_URL
      });
    } else {
      // fallback لنظام النسخ إذا لم يدعم المتصفح Share API
      navigator.clipboard.writeText(shareText);
      alert("تم نسخ رسالة المشاركة ورابط التطبيق!");
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-[#fffafa]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-pink-100 border-t-pink-500 rounded-full animate-spin"></div>
        <div className="text-pink-500 font-bold animate-pulse">عالم رقة بانتظارك... ✨</div>
      </div>
    </div>
  );

  if (!postData) return <p className="text-center p-10">لا يوجد محتوى متاح حالياً.</p>;

  return (
    <div className="min-h-screen bg-[#fffcfd] p-4 font-sans" dir="rtl">
      <div className="max-w-xl mx-auto bg-white/80 backdrop-blur-xl border border-white/60 rounded-[2.5rem] shadow-2xl overflow-hidden">
        
        {/* الصورة الرئيسية */}
        {postData._embedded?.['wp:featuredmedia'] && (
          <div className="relative h-64 overflow-hidden">
            <img 
              src={postData._embedded['wp:featuredmedia'][0].source_url} 
              className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105"
              alt="صورة المقال"
            />
            <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs">
              مقال اليوم
            </div>
          </div>
        )}

        <div className="p-8">
          <h1 
            className="text-2xl font-black text-gray-800 mb-6 leading-tight"
            dangerouslySetInnerHTML={{ __html: postData.title.rendered }}
          />

          <div 
            className="wordpress-content text-gray-600 leading-relaxed mb-8 text-lg"
            dangerouslySetInnerHTML={{ __html: postData.content.rendered }} 
          />

          {/* شريط الأدوات المطور */}
          <div className="flex flex-col gap-4 border-t border-pink-50 pt-6 mb-8">
            <div className="flex items-center justify-between">
              <button 
                onClick={handleLike}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl transition-all duration-300 ${isLiked ? 'bg-pink-500 text-white shadow-lg shadow-pink-200' : 'bg-pink-50 text-pink-500'}`}
              >
                <span className="text-xl">{isLiked ? '❤️' : '🤍'}</span>
                <span className="font-bold">{likes}</span>
              </button>

              <div className="flex flex-col items-end">
                <button 
                  onClick={handleShare}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-500 text-white rounded-2xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-600 transition-all"
                >
                  <span>📤</span> مشاركة المقال
                </button>
                <span className="text-[10px] text-blue-400 mt-1 font-medium">حملي التطبيق الآن من الرابط</span>
              </div>
            </div>
            
            {/* رابط التطبيق المباشر كزر منفصل */}
            <a 
              href={APP_URL} 
              target="_blank" 
              rel="noreferrer"
              className="w-full text-center py-3 bg-gradient-to-r from-pink-400 to-rose-400 text-white rounded-2xl font-black text-sm shadow-md"
            >
              ✨ حملي التطبيق الآن للحصول على المزيد ✨
            </a>
          </div>

          {/* قسم التعليقات */}
          <div className="space-y-6">
            <h3 className="font-bold text-gray-800 flex items-center gap-2 text-lg">
              <span>💬</span> تعليقات الأمهات ({comments.length})
            </h3>
            
            <div className="max-h-80 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              {comments.map((c, i) => (
                <div key={i} className="bg-white border border-pink-50 p-4 rounded-3xl shadow-sm">
                  <p className="text-sm text-gray-700 leading-relaxed">{c.text}</p>
                  <div className="flex justify-end mt-2">
                    <span className="text-[10px] text-gray-300">{c.date}</span>
                  </div>
                </div>
              ))}
              {comments.length === 0 && (
                <div className="text-center py-8 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
                   <p className="text-sm text-gray-400">شاركينا رأيكِ، تعليقكِ يهمنا ✨</p>
                </div>
              )}
            </div>

            <form onSubmit={handleAddComment} className="relative mt-4">
              <input 
                type="text" 
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="اكتبي تعليقكِ هنا..."
                className="w-full bg-pink-50/30 border-2 border-transparent focus:border-pink-200 rounded-[1.5rem] pl-14 pr-6 py-4 text-sm focus:outline-none transition-all"
              />
              <button className="absolute left-2 top-2 bottom-2 bg-pink-500 text-white px-5 rounded-[1.2rem] text-xs font-bold shadow-md">
                إرسال
              </button>
            </form>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .wordpress-content img {
          max-width: 100%;
          height: auto;
          border-radius: 2rem;
          margin: 1.5rem 0;
          box-shadow: 0 10px 30px -10px rgba(0,0,0,0.1);
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #fbcfe8;
          border-radius: 10px;
        }
        .wordpress-content p {
          margin-bottom: 1.2rem;
        }
      `}</style>
    </div>
  );
};

export default RoqaDirectView;
