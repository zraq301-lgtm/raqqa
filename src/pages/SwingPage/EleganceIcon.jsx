import React, { useState, useEffect } from 'react';

const EleganceSection = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  const CATEGORY_ID = "347212703";
  const SITE_DOMAIN = "raqqastor3.wordpress.com";
  const API_URL = `https://public-api.wordpress.com/wp/v2/sites/${SITE_DOMAIN}/posts?categories=${CATEGORY_ID}&_embed`;

  const parseContent = (htmlContent) => {
    let content = htmlContent;

    // 1. إزالة الأكواد المكسورة التي تظهر في الصورة (مثل lightbox-trigger و aria labels)
    // هذا الجزء ينظف النصوص التي تظهر أسفل الصور في ووردبريس
    content = content.replace(/class="lightbox-trigger"|type="button"|aria-haspopup="dialog"|data-wp-bind--aria-label=".*?"|data-wp-on--click=".*?"/g, '');
    
    // 2. تحويل روابط اليوتيوب النصية إلى مشغل فيديو
    const youtubeRegex = /(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)(?:[^\s<]*))/g;
    content = content.replace(youtubeRegex, (match, url, videoId) => {
      return `<div class="video-container"><iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe></div>`;
    });

    // 3. تحسين عرض الصور والتخلص من الفراغات النصية الزائدة
    const imageRegex = /(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp)(?:\?.*)?)/g;
    content = content.replace(imageRegex, (match) => {
      if (content.includes(`src="${match}"`)) return match;
      return `<img src="${match}" alt="محتوى" class="content-image" />`;
    });

    return content;
  };

  useEffect(() => {
    const fetchEleganceArticles = async () => {
      try {
        const response = await fetch(API_URL);
        const data = await response.json();
        if (Array.isArray(data)) {
          setArticles(data);
        }
      } catch (error) {
        console.error("خطأ في جلب مقالات الأناقة:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEleganceArticles();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-pink-500 font-medium">ننتقي لكِ الأجمل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF9FA] pb-10" dir="rtl">
      {/* الهيدر العلوي الأنيق */}
      <div className="bg-white/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 border-b border-pink-50 flex justify-between items-center">
        <h1 className="text-xl font-bold bg-gradient-to-l from-pink-600 to-purple-500 bg-clip-text text-transparent">
          عالم الأناقة
        </h1>
        <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center">
          <span className="text-pink-500 text-xs">✨</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 mt-6 space-y-8">
        {articles.length > 0 ? (
          articles.map((post) => (
            <article 
              key={post.id} 
              className="bg-white rounded-[2rem] shadow-[0_10px_30px_-15px_rgba(255,182,193,0.5)] overflow-hidden border border-pink-50 transition-transform active:scale-[0.98]"
            >
              {/* الصورة الرئيسية للمقال */}
              {post._embedded?.['wp:featuredmedia'] && (
                <div className="relative h-72 w-full">
                  <img 
                    src={post._embedded['wp:featuredmedia'][0].source_url} 
                    alt={post.title.rendered}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
              )}

              <div className="p-6">
                <h2 
                  className="text-2xl font-bold text-gray-800 mb-4 leading-snug"
                  dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                />

                <div className="prose prose-pink max-w-none">
                  <div 
                    className="wordpress-content"
                    dangerouslySetInnerHTML={{ __html: parseContent(post.content.rendered) }} 
                  />
                </div>

                <div className="mt-8 pt-4 border-t border-gray-50 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-pink-400 rounded-full"></span>
                    <span className="text-xs text-gray-400 font-medium">
                      {new Date(post.date).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long' })}
                    </span>
                  </div>
                  <button className="text-pink-500 text-sm font-bold bg-pink-50 px-4 py-1.5 rounded-full">
                    قراءة المزيد
                  </button>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="text-center text-gray-400 py-20">لا توجد مقالات متاحة حالياً.</div>
        )}
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');
        
        .wordpress-content {
          line-height: 1.9;
          color: #555;
          font-family: 'Cairo', sans-serif;
          font-size: 1.05rem;
          text-align: justify;
        }
        .wordpress-content p {
          margin-bottom: 1.5rem;
        }
        .content-image {
          width: 100%;
          border-radius: 1.5rem;
          margin: 1.5rem 0;
          box-shadow: 0 5px 15px rgba(0,0,0,0.05);
        }
        .video-container {
          position: relative;
          padding-bottom: 56.25%;
          height: 0;
          margin: 1.5rem 0;
          border-radius: 1.5rem;
          overflow: hidden;
        }
        .video-container iframe {
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
        }
        /* إخفاء أي عناصر غريبة قد تظهر من ووردبريس */
        .wordpress-content button, 
        .wordpress-content .screen-reader-text {
          display: none !important;
        }
      `}</style>
    </div>
  );
};

export default EleganceSection;
