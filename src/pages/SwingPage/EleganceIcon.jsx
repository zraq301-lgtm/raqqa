import React, { useState, useEffect } from 'react';

const EleganceSection = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  const CATEGORY_ID = "347212703";
  const SITE_DOMAIN = "raqqastor3.wordpress.com";
  const API_URL = `https://public-api.wordpress.com/wp/v2/sites/${SITE_DOMAIN}/posts?categories=${CATEGORY_ID}&_embed`;

  const parseContent = (htmlContent) => {
    let content = htmlContent;

    // 1. تنظيف النصوص البرمجية الزائدة
    content = content.replace(/class="lightbox-trigger"|type="button"|aria-haspopup="dialog"|data-wp-bind--aria-label=".*?"|data-wp-on--click=".*?"/g, '');
    
    // 2. تحويل روابط اليوتيوب إلى مشغل فيديو متجاوب
    const youtubeRegex = /(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)(?:[^\s<]*))/g;
    content = content.replace(youtubeRegex, (match, url, videoId) => {
      return `<div class="video-card-container"><iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
    });

    // 3. تحسين عرض الصور داخل المقال
    const imageRegex = /<img[^>]+src="([^">]+)"/g;
    content = content.replace(imageRegex, (match, src) => {
      return `<img src="${src}" alt="محتوى الأناقة" class="article-inner-image" />`;
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
      <div className="flex justify-center items-center h-screen bg-[#FFF9FA]">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-pink-100 border-t-pink-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-pink-600 font-bold animate-pulse">جاري تحميل عالمكِ الخاص...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF9FA] pb-20" dir="rtl">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-lg sticky top-0 z-50 px-6 py-5 border-b border-pink-100/50 shadow-sm flex justify-between items-center">
        <h1 className="text-2xl font-black bg-gradient-to-r from-pink-600 to-rose-400 bg-clip-text text-transparent">
          عالم الأناقة
        </h1>
        <div className="bg-pink-50 p-2 rounded-full shadow-inner">
          <span className="text-xl">✨</span>
        </div>
      </header>

      {/* Articles Container */}
      <div className="max-w-xl mx-auto px-4 mt-8 space-y-10">
        {articles.length > 0 ? (
          articles.map((post) => (
            <article 
              key={post.id} 
              className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_-20px_rgba(255,182,193,0.3)] overflow-hidden border border-white transition-all hover:shadow-pink-200/50"
            >
              {/* Featured Image */}
              {post._embedded?.['wp:featuredmedia'] && (
                <div className="relative h-64 sm:h-80 w-full overflow-hidden">
                  <img 
                    src={post._embedded['wp:featuredmedia'][0].source_url} 
                    alt={post.title.rendered}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                  <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-white to-transparent"></div>
                </div>
              )}

              <div className="px-6 pb-8 pt-2">
                {/* Title */}
                <h2 
                  className="text-2xl font-black text-gray-800 mb-6 leading-[1.4] hover:text-pink-600 transition-colors"
                  dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                />

                {/* Main Content (Article + Media) */}
                <div className="article-body-content">
                  <div 
                    className="wordpress-rendered-content"
                    dangerouslySetInnerHTML={{ __html: parseContent(post.content.rendered) }} 
                  />
                </div>

                {/* Footer of Card */}
                <div className="mt-10 pt-6 border-t border-pink-50 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-100 to-rose-50 flex items-center justify-center text-pink-400 text-xs font-bold">
                       {new Date(post.date).getDate()}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">تاريخ النشر</span>
                      <span className="text-xs text-gray-600 font-bold">
                        {new Date(post.date).toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                  <button className="bg-gray-900 text-white px-6 py-2.5 rounded-2xl text-xs font-bold shadow-lg shadow-gray-200 hover:bg-pink-600 transition-all active:scale-95">
                    مشاركة المقال
                  </button>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="text-center py-20 text-gray-400 italic">لا توجد مقالات في هذا القسم حالياً.</div>
        )}
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');
        
        .wordpress-rendered-content {
          font-family: 'Cairo', sans-serif;
          color: #4a4a4a;
          line-height: 2;
          font-size: 1.05rem;
        }

        .wordpress-rendered-content p {
          margin-bottom: 1.8rem;
          text-align: justify;
        }

        .article-inner-image {
          width: 100%;
          height: auto;
          border-radius: 2rem;
          margin: 1.5rem 0;
          box-shadow: 0 10px 25px rgba(0,0,0,0.05);
          display: block;
        }

        .video-card-container {
          position: relative;
          padding-bottom: 56.25%; /* 16:9 ratio */
          height: 0;
          margin: 2rem 0;
          border-radius: 1.8rem;
          overflow: hidden;
          box-shadow: 0 15px 35px rgba(251, 113, 133, 0.2);
          border: 4px solid #fff;
        }

        .video-card-container iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        /* تنظيف إضافي لمخلفات ووردبريس */
        .wordpress-rendered-content figure {
          margin: 0;
          width: 100% !important;
        }
        
        .wordpress-rendered-content ul {
          list-style: none;
          padding-right: 1rem;
          border-right: 3px solid #fce7f3;
          margin: 1.5rem 0;
        }

        .wordpress-rendered-content li {
          margin-bottom: 0.8rem;
          position: relative;
        }
      `}</style>
    </div>
  );
};

export default EleganceSection;
