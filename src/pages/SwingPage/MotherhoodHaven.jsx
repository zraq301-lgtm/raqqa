import React, { useState, useEffect } from 'react';

const MotherhoodSection = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  const CATEGORY_ID = "768006428";
  const API_URL = `https://public-api.wordpress.com/wp/v2/sites/raqqastor3.wordpress.com/posts?categories=${CATEGORY_ID}&_embed`;

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
        <div className="animate-pulse text-xl">جاري تحميل عالم الأمومة والجمال...</div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gradient-to-b from-[#fff5f7] to-white min-h-screen font-sans" dir="rtl">
      
      {/* أيقونة "رقة" الموجهة - بديل العنوان العلوي */}
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-pink-500 text-white px-4 py-1 rounded-full shadow-lg flex items-center gap-2 border-2 border-white">
          <span className="text-xs font-bold tracking-widest">رقة</span>
          <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-12 pt-10">
        {articles.map((post) => (
          <article 
            key={post.id} 
            className="backdrop-blur-lg bg-white/80 rounded-[2rem] shadow-xl shadow-pink-100/50 border border-white overflow-hidden transition-all duration-300"
          >
            {/* الصورة البارزة الكبيرة */}
            {post._embedded?.['wp:featuredmedia'] && (
              <div className="w-full h-64 md:h-80 overflow-hidden">
                <img 
                  src={post._embedded['wp:featuredmedia'][0].source_url} 
                  alt={post.title.rendered}
                  className="w-full h-full object-cover shadow-inner"
                />
              </div>
            )}

            <div className="p-6 md:p-10">
              {/* عنوان المقال */}
              <h2 
                className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 leading-tight"
                dangerouslySetInnerHTML={{ __html: post.title.rendered }}
              />

              {/* محتوى المقال */}
              <div className="prose prose-pink max-w-none text-gray-700 leading-loose text-right">
                <div 
                  className="wordpress-content"
                  dangerouslySetInnerHTML={{ __html: post.content.rendered }} 
                />
              </div>

              {/* تذييل المقال */}
              <div className="mt-8 pt-6 border-t border-pink-50 flex justify-between items-center text-xs text-pink-400">
                <span>تاريخ النشر: {new Date(post.date).toLocaleDateString('ar-EG')}</span>
                <span className="bg-pink-100 px-3 py-1 rounded-full">قسم التربية</span>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* تنسيقات CSS لضمان ظهور الصور والفيديو بشكل صحيح */}
      <style jsx global>{`
        .wordpress-content {
          word-wrap: break-word;
        }
        /* عرض الصور بشكل كامل */
        .wordpress-content img {
          display: block;
          max-width: 100% !important;
          height: auto !important;
          border-radius: 20px;
          margin: 25px auto;
          box-shadow: 0 10px 25px rgba(0,0,0,0.08);
        }
        /* عرض الفيديوهات (يوتيوب وغيرها) بشكل كامل */
        .wordpress-content iframe, 
        .wordpress-content video,
        .wordpress-content embed {
          width: 100% !important;
          height: auto !important;
          aspect-ratio: 16 / 9;
          border-radius: 20px;
          margin: 25px 0;
          border: none;
          box-shadow: 0 10px 30px rgba(219, 39, 119, 0.15);
        }
        .wordpress-content p {
          margin-bottom: 1.5rem;
          font-size: 1.15rem;
          color: #4a5568;
        }
        .wordpress-content a {
          color: #db2777;
          text-decoration: underline;
        }
        /* إخفاء أي روابط تظهر كنصوص بجانب الميديا */
        .wp-block-embed__wrapper {
          margin: 0;
        }
      `}</style>
    </div>
  );
};

export default MotherhoodSection;
