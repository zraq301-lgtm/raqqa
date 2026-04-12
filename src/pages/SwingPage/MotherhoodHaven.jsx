import React, { useState, useEffect } from 'react';

const MotherhoodSection = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  const CATEGORY_ID = "768006428";
  // تم إضافة _embed لجلب بيانات الميديا والمؤلف
  const API_URL = `https://public-api.wordpress.com/wp/v2/sites/raqqastor3.wordpress.com/posts?categories=${CATEGORY_ID}&_embed=true`;

  const parseContent = (htmlContent) => {
    let content = htmlContent;

    // 1. معالجة الفيديوهات
    const youtubeRegex = /(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)(?:[^\s<]*))/g;
    content = content.replace(youtubeRegex, (match, url, videoId) => {
      return `<div class="media-wrapper video-wrapper"><iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe></div>`;
    });

    // 2. معالجة الصور
    const imageRegex = /(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp)(?:\?.*)?)/g;
    content = content.replace(imageRegex, (match) => {
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
        
        // تحميل اسكريبتات وردبريس الضرورية لعرض الإعجابات والمشاركة (Jetpack)
        if (!document.getElementById('wp-jetpack-loader')) {
          const script = document.createElement('script');
          script.id = 'wp-jetpack-loader';
          script.src = 'https://stats.wp.com/w.js?67';
          script.async = true;
          document.body.appendChild(script);
        }
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
            {/* الصورة الرئيسية */}
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

              {/* قسم أدوات وردبريس (المشاركة والإعجاب) */}
              <div className="wp-tools-container mt-8 p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <div className="text-xs text-gray-400 mb-4 font-bold">تفاعل مع المقال:</div>
                
                {/* هذه الكلاسات مخصصة لتستهدف أكواد وردبريس القادمة في الـ HTML */}
                <div className="sharedaddy sd-sharing-enabled">
                  <div className="robots-nocontent sd-block sd-social sd-social-icon sd-sharing">
                    {/* وردبريس سيقوم بحقن الأزرار هنا إذا كانت مفعلة في لوحة التحكم */}
                  </div>
                </div>

                {/* زر الإعجاب (Jetpack) */}
                <div className="jetpack-likes-widget-wrapper text-center">
                   {/* سيظهر الزر هنا تلقائياً عبر سكريبت وردبريس */}
                </div>
              </div>

              {/* زر الانتقال للتعليقات أو عرض رابط التعليقات */}
              <div className="mt-6 flex items-center justify-between">
                <a 
                  href={post.link + "#comments"} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm font-bold text-pink-500 hover:text-pink-700 flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                  </svg>
                  أضيفي تعليقكِ الآن
                </a>
                
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

        /* تنسيق أزرار وردبريس الافتراضية */
        .sd-sharing .sd-content ul {
          display: flex !important;
          gap: 10px !important;
          list-style: none !important;
          padding: 0 !important;
        }

        .sd-social-icon .sd-content ul li a {
          background: #fdf2f8 !important;
          border-radius: 50% !important;
          width: 40px !important;
          height: 40px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          color: #db2777 !important;
          border: 1px solid #fbcfe8 !important;
        }

        .article-content {
          line-height: 1.9;
          color: #3f3f46;
          font-size: 1.05rem;
        }

        .media-wrapper {
          margin: 2rem -2rem;
          position: relative;
          background: #fdfdfd;
        }

        @media (max-width: 640px) {
          .media-wrapper { margin: 1.5rem -1rem; }
        }

        .premium-img {
          width: 100%;
          height: auto;
          display: block;
          object-fit: cover;
          box-shadow: 0 4px 20px rgba(0,0,0,0.03);
        }

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
      `}</style>
    </div>
  );
};

export default MotherhoodSection;
