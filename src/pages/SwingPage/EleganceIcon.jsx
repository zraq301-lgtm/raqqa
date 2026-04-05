import React, { useState, useEffect } from 'react';

const EleganceSection = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  // الإعدادات الخاصة بقسم الأناقة والجمال
  const CATEGORY_ID = "347212703"; // المعرف الجديد الذي استخرجناه
  const SITE_DOMAIN = "raqqastor3.wordpress.com";
  const API_URL = `https://public-api.wordpress.com/wp/v2/sites/${SITE_DOMAIN}/posts?categories=${CATEGORY_ID}&_embed`;

  // الوظيفة السحرية لتحويل الروابط النصية إلى ميديا (فيديو وصور)
  const parseContent = (htmlContent) => {
    let content = htmlContent;

    // 1. تحويل روابط اليوتيوب النصية إلى مشغل فيديو
    const youtubeRegex = /(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)(?:[^\s<]*))/g;
    content = content.replace(youtubeRegex, (match, url, videoId) => {
      return `<div class="video-container"><iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe></div>`;
    });

    // 2. تحويل روابط الصور المباشرة إلى وسم img
    const imageRegex = /(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp)(?:\?.*)?)/g;
    content = content.replace(imageRegex, (match) => {
      if (content.includes(`src="${match}"`)) return match;
      return `<img src="${match}" alt="محتوى إضافي" class="content-image" />`;
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
      <div className="flex justify-center items-center h-screen text-pink-500 font-bold">
        <div className="animate-pulse text-xl">نجهز لكِ أرقى النصائح...</div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gradient-to-b from-[#fff5f7] to-white min-h-screen font-sans" dir="rtl">
      
      {/* أيقونة رقة الصغيرة */}
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-pink-500 text-white px-3 py-1 rounded-full shadow-md flex items-center gap-2 border border-white">
          <span className="text-[10px] font-bold">رقة</span>
          <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-8 pt-6">
        {articles.length > 0 ? (
          articles.map((post) => (
            <article 
              key={post.id} 
              className="bg-white rounded-[2.5rem] shadow-sm border border-pink-50 overflow-hidden"
            >
              {/* الصورة البارزة (Featured Image) */}
              {post._embedded?.['wp:featuredmedia'] && (
                <div className="w-full h-64 overflow-hidden">
                  <img 
                    src={post._embedded['wp:featuredmedia'][0].source_url} 
                    alt={post.title.rendered}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-6">
                <h2 
                  className="text-xl font-bold text-gray-800 mb-4 leading-tight"
                  dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                />

                <div className="prose prose-pink max-w-none text-right">
                  <div 
                    className="wordpress-content"
                    dangerouslySetInnerHTML={{ __html: parseContent(post.content.rendered) }} 
                  />
                </div>

                <div className="mt-6 pt-4 border-t border-gray-50 flex justify-between items-center text-[10px] text-gray-400">
                  <span>{new Date(post.date).toLocaleDateString('ar-EG')}</span>
                  <span className="text-pink-300">#قسم_الأناقة_والجمال</span>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="text-center text-gray-500 py-20">لا توجد مقالات منشورة في هذا القسم حالياً.</div>
        )}
      </div>

      {/* التصميم الخاص (CSS) */}
      <style jsx global>{`
        .wordpress-content {
          line-height: 1.8;
          color: #4a4a4a;
          font-size: 1.05rem;
        }
        .video-container {
          position: relative;
          padding-bottom: 56.25%;
          height: 0;
          overflow: hidden;
          margin: 20px 0;
          border-radius: 20px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        .video-container iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: 0;
        }
        .content-image {
          max-width: 100%;
          height: auto;
          border-radius: 20px;
          margin: 20px 0;
          display: block;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }
        .wordpress-content p {
          margin-bottom: 1.2rem;
        }
      `}</style>
    </div>
  );
};

export default EleganceSection;
