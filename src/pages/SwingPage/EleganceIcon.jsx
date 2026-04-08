import React, { useState, useEffect } from 'react';

const EleganceSection = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  const CATEGORY_ID = "347212703";
  const SITE_DOMAIN = "raqqastor3.wordpress.com";
  const API_URL = `https://public-api.wordpress.com/wp/v2/sites/${SITE_DOMAIN}/posts?categories=${CATEGORY_ID}&_embed`;

  const parseContent = (htmlContent) => {
    let content = htmlContent;

    // 1. تنظيف شامل للأكواد البرمجية والسمات المكسورة التي تظهر في الصورة
    // هذه الإضافة ستمسح كلمات مثل alt, class, sizes, srcset التي تظهر ككلام نصي
    content = content.replace(/alt=".*?"|class=".*?"|sizes=".*?"|srcset=".*?"|data-orig-size=".*?"|data-image-title=".*?"/g, '');
    
    // 2. تحويل روابط اليوتيوب إلى مشغل فيديو متجاوب
    const youtubeRegex = /(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)(?:[^\s<]*))/g;
    content = content.replace(youtubeRegex, (match, url, videoId) => {
      return `<div class="video-card-container"><iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe></div>`;
    });

    // 3. تحسين عرض الصور داخل المقال والتخلص من النصوص العالقة حولها
    // نستخدم RegExp بفلترة أقوى لضمان عدم بقاء نصوص srcset
    const imageRegex = /https?:\/\/[^\s<>"]+?\.(?:jpg|jpeg|gif|png|webp)(?:\?[^\s<>"]+)?/gi;
    
    // ملاحظة: نقوم بتنظيف المحتوى من أي نصوص srcset يدوية قد تكون ووردبريس أرسلها خارج التاج
    content = content.replace(/\d+w,[\s\S]*?px\)/g, ''); // يمسح نصوص srcset مثل "196w, ... 196px)"

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
        console.error("Error fetching articles:", error);
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
          <div className="w-12 h-12 border-4 border-rose-100 border-t-rose-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-rose-500 font-medium italic">لحظات من الأناقة...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF9FA] pb-24" dir="rtl">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 border-b border-rose-50 shadow-sm flex justify-between items-center">
        <h1 className="text-xl font-black text-gray-800">
          مجلة <span className="text-rose-500">رقة</span>
        </h1>
        <div className="w-9 h-9 rounded-full bg-rose-50 flex items-center justify-center">
          <span className="animate-pulse">🌸</span>
        </div>
      </header>

      {/* Articles Grid */}
      <div className="max-w-md mx-auto px-4 mt-8 space-y-12">
        {articles.length > 0 ? (
          articles.map((post) => (
            <article 
              key={post.id} 
              className="elegant-card bg-white rounded-[2rem] overflow-hidden border border-rose-50/50"
            >
              {/* Featured Image */}
              {post._embedded?.['wp:featuredmedia'] && (
                <div className="relative h-60 w-full overflow-hidden">
                  <img 
                    src={post._embedded['wp:featuredmedia'][0].source_url} 
                    alt="تصميم رقة"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                </div>
              )}

              <div className="p-6">
                {/* Date Badge */}
                <div className="inline-block bg-rose-50 text-rose-500 text-[10px] font-bold px-3 py-1 rounded-full mb-4">
                  {new Date(post.date).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long' })}
                </div>

                {/* Title */}
                <h2 
                  className="text-xl font-bold text-gray-800 mb-5 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                />

                {/* Content Area */}
                <div className="article-inner-body">
                  <div 
                    className="wp-content-clean"
                    dangerouslySetInnerHTML={{ __html: parseContent(post.content.rendered) }} 
                  />
                </div>

                {/* Card Action */}
                <button className="w-full mt-6 py-3 bg-gray-50 text-gray-400 text-sm font-bold rounded-2xl border border-dashed border-gray-200">
                  انتهى المقال ✨
                </button>
              </div>
            </article>
          ))
        ) : (
          <div className="text-center py-20 text-gray-300">لا توجد مواضيع حالياً</div>
        )}
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap');
        
        body { font-family: 'Cairo', sans-serif; }

        .elegant-card {
          box-shadow: 0 25px 50px -12px rgba(255, 182, 193, 0.25);
        }

        .wp-content-clean {
          color: #555;
          line-height: 1.8;
          font-size: 1rem;
        }

        .wp-content-clean p {
          margin-bottom: 1.2rem;
        }

        /* تنسيق الفيديو داخل الكارت */
        .video-card-container {
          position: relative;
          padding-bottom: 56.25%;
          height: 0;
          margin: 1.5rem 0;
          border-radius: 1.5rem;
          overflow: hidden;
          background: #000;
        }

        .video-card-container iframe {
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
        }

        /* منع ظهور أي نصوص srcset أو سمات عالقة */
        .wp-content-clean img {
          max-width: 100%;
          height: auto;
          border-radius: 1.2rem;
          margin: 1rem auto;
          display: block;
        }

        /* إخفاء أي نصوص غريبة قد تتسرب من ووردبريس */
        .wp-content-clean {
          word-break: break-word;
        }
      `}</style>
    </div>
  );
};

export default EleganceSection;
