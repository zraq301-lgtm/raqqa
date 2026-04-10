import React, { useState, useEffect } from 'react';

const MotherhoodSection = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  const CATEGORY_ID = "768006428";
  const API_URL = `https://public-api.wordpress.com/wp/v2/sites/raqqastor3.wordpress.com/posts?categories=${CATEGORY_ID}&_embed`;

  // وظيفة معالجة المحتوى لتحويل الروابط لميديا وتنظيف النصوص الغريبة
  const parseContent = (htmlContent) => {
    let content = htmlContent;

    // 1. معالجة الفيديوهات: تحويل روابط يوتيوب إلى مشغل أنيق
    const youtubeRegex = /(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)(?:[^\s<]*))/g;
    content = content.replace(youtubeRegex, (match, url, videoId) => {
      return `<div class="media-wrapper video-wrapper"><iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe></div>`;
    });

    // 2. معالجة الصور: تحويل الروابط المباشرة لصور بجودة عالية وإخفاء الرابط النصي
    const imageRegex = /(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp)(?:\?.*)?)/g;
    content = content.replace(imageRegex, (match) => {
      // إذا كان الرابط مستخدماً بالفعل في وسم img، لا نكرره
      if (content.includes(`src="${match}"`)) return ""; 
      return `<div class="media-wrapper"><img src="${match}" alt="محتوى بصري" class="premium-img" /></div>`;
    });

    return content;
  };

  useEffect(() => {
    const fetchMotherhoodArticles = async () => {
      try {
        const response = await fetch(API_URL);
        const data = await response.json();
        setArticles(data);
      } catch (error) {
        console.error("خطأ في جلب مقالات الأمومة:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMotherhoodArticles();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#fffafa]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin"></div>
          <div className="text-pink-600 font-medium animate-pulse">جاري تحضير عالم رقة...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-[#fcf8f9] min-h-screen font-sans" dir="rtl">
      
      {/* شارة "رقة" العائمة */}
      <div className="fixed top-6 left-6 z-50">
        <div className="bg-white/80 backdrop-blur-md border border-pink-100 text-pink-600 px-4 py-2 rounded-2xl shadow-xl flex items-center gap-2">
          <span className="text-sm font-bold tracking-widest">رقة</span>
          <div className="w-2 h-2 bg-pink-500 rounded-full animate-ping"></div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto space-y-10 pt-10">
        {articles.map((post) => (
          <article 
            key={post.id} 
            className="bg-white rounded-[2rem] shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] border border-pink-50/50 overflow-hidden transition-transform duration-500 hover:scale-[1.01]"
          >
            {/* الصورة الرئيسية للمقال بجودة عالية */}
            {post._embedded?.['wp:featuredmedia'] && (
              <div className="relative h-72 w-full overflow-hidden">
                <img 
                  src={post._embedded['wp:featuredmedia'][0].source_url} 
                  alt={post.title.rendered}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
            )}

            <div className="p-8">
              <h2 
                className="text-2xl font-black text-gray-800 mb-6 leading-tight hover:text-pink-600 transition-colors"
                dangerouslySetInnerHTML={{ __html: post.title.rendered }}
              />

              <div className="prose prose-pink max-w-none">
                <div 
                  className="article-content"
                  dangerouslySetInnerHTML={{ __html: parseContent(post.content.rendered) }} 
                />
              </div>

              <div className="mt-8 pt-6 border-t border-gray-50 flex justify-between items-center">
                <div className="flex items-center gap-2">
                   <span className="text-xs bg-pink-50 text-pink-500 px-3 py-1 rounded-full font-bold">
                    #قسم_التربية
                   </span>
                </div>
                <span className="text-[11px] text-gray-400 font-medium">
                  {new Date(post.date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;900&display=swap');
        
        body { font-family: 'Tajawal', sans-serif; }

        .article-content {
          line-height: 1.9;
          color: #3f3f46;
          font-size: 1.05rem;
        }

        .article-content p {
          margin-bottom: 1.5rem;
        }

        /* حاوية الميديا الموحدة داخل الكارت */
        .media-wrapper {
          margin: 2rem -2rem; /* تمتد قليلاً لخارج حواف النص لجمالية أكثر */
          position: relative;
          background: #fdfdfd;
        }

        @media (max-width: 640px) {
          .media-wrapper { margin: 1.5rem -1rem; }
        }

        /* تنسيق الصور بجودة عالية ومنع ظهور الروابط أسفلها */
        .premium-img {
          width: 100%;
          height: auto;
          display: block;
          object-fit: cover;
          box-shadow: 0 4px 20px rgba(0,0,0,0.03);
          border-top: 1px solid #fff0f3;
          border-bottom: 1px solid #fff0f3;
        }

        /* تنسيق الفيديو ليكون متناسق مع الكارت */
        .video-wrapper {
          padding-bottom: 56.25%;
          height: 0;
          overflow: hidden;
        }

        .video-wrapper iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: 0;
        }

        /* إخفاء أي روابط نصية قد تظهر بالخطأ في المحتوى */
        .article-content a[href$=".jpg"], 
        .article-content a[href$=".png"], 
        .article-content a[href$=".jpeg"] {
          display: none !important;
        }
      `}</style>
    </div>
  );
};

export default MotherhoodSection;
