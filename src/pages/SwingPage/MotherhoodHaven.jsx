import React, { useState, useEffect } from 'react';

const MotherhoodSection = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  const CATEGORY_ID = "768006428";
  const API_URL = `https://public-api.wordpress.com/wp/v2/sites/raqqastor3.wordpress.com/posts?categories=${CATEGORY_ID}&_embed`;

  // وظيفة سحرية لتحويل الروابط النصية إلى ميديا (فيديو وصور)
  const parseContent = (htmlContent) => {
    let content = htmlContent;

    // 1. تحويل روابط اليوتيوب النصية إلى مشغل فيديو
    const youtubeRegex = /(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)(?:[^\s<]*))/g;
    content = content.replace(youtubeRegex, (match, url, videoId) => {
      return `<div class="video-container"><iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe></div>`;
    });

    // 2. تحويل روابط الصور المباشرة التي تنتهي بامتدادات صور إلى وسم img
    const imageRegex = /(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp)(?:\?.*)?)/g;
    content = content.replace(imageRegex, (match) => {
      // نتأكد ألا نقوم باستبدال رابط موجود أصلاً داخل وسم src
      if (content.includes(`src="${match}"`)) return match;
      return `<img src="${match}" alt="محتوى إضافي" class="content-image" />`;
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
      <div className="flex justify-center items-center h-screen text-pink-500 font-bold">
        <div className="animate-pulse text-xl">جاري تحميل عالم رقة...</div>
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
        {articles.map((post) => (
          <article 
            key={post.id} 
            className="bg-white rounded-[2.5rem] shadow-sm border border-pink-50 overflow-hidden"
          >
            {/* الصورة البارزة */}
            {post._embedded?.['wp:featuredmedia'] && (
              <div className="w-full h-56 overflow-hidden">
                <img 
                  src={post._embedded['wp:featuredmedia'][0].source_url} 
                  alt={post.title.rendered}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="p-6">
              <h2 
                className="text-xl font-bold text-gray-800 mb-4"
                dangerouslySetInnerHTML={{ __html: post.title.rendered }}
              />

              <div className="prose prose-pink max-w-none text-right">
                <div 
                  className="wordpress-content"
                  // هنا نستخدم الوظيفة الجديدة لمعالجة الروابط قبل عرضها
                  dangerouslySetInnerHTML={{ __html: parseContent(post.content.rendered) }} 
                />
              </div>

              <div className="mt-6 pt-4 border-t border-gray-50 flex justify-between items-center text-[10px] text-gray-400">
                <span>{new Date(post.date).toLocaleDateString('ar-EG')}</span>
                <span className="text-pink-300">#قسم_التربية</span>
              </div>
            </div>
          </article>
        ))}
      </div>

      <style jsx global>{`
        .wordpress-content {
          line-height: 1.8;
          color: #4a4a4a;
        }
        .video-container {
          position: relative;
          padding-bottom: 56.25%;
          height: 0;
          overflow: hidden;
          margin: 20px 0;
          border-radius: 15px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
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
          border-radius: 15px;
          margin: 15px 0;
          display: block;
        }
        .wordpress-content p {
          margin-bottom: 1rem;
        }
      `}</style>
    </div>
  );
};

export default MotherhoodSection;
