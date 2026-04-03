import React, { useState, useEffect } from 'react';

const MotherhoodSection = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  // المعرف الخاص بفئة الأمومة
  const CATEGORY_ID = "768006428";
  // تم استخدام _embed لجلب الصور البارزة ومعلومات الكاتب
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
    <div className="p-4 bg-gradient-to-b from-[#fff5f7] to-white min-h-screen font-sans dir-rtl" dir="rtl">
      {/* رأس الصفحة */}
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-extrabold text-pink-600 mb-2">رقة الأمومة</h1>
        <p className="text-gray-500 text-sm">محتوى خاص لكل أم تهتم بتربية جيل مبدع</p>
        <div className="h-1 w-20 bg-pink-300 mx-auto mt-4 rounded-full"></div>
      </header>

      <div className="max-w-4xl mx-auto space-y-12">
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

              {/* محتوى المقال (الصور الداخلية، الفيديوهات، النصوص) */}
              <div 
                className="prose prose-pink max-w-none text-gray-700 leading-loose text-right"
                style={{
                  textAlign: 'right',
                }}
              >
                {/* هذا الجزء هو المسؤول عن عرض الفيديوهات والصور داخل المقال */}
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

      {/* تنسيقات CSS إضافية لضمان جمالية الصور والفيديو داخل المحتوى */}
      <style jsx global>{`
        .wordpress-content img {
          max-width: 100%;
          height: auto;
          border-radius: 20px;
          margin: 20px 0;
          box-shadow: 0 10px 20px rgba(0,0,0,0.05);
        }
        .wordpress-content iframe {
          width: 100%;
          aspect-ratio: 16 / 9;
          border-radius: 20px;
          margin: 20px 0;
          border: 2px solid #fff;
          box-shadow: 0 10px 30px rgba(219, 39, 119, 0.2);
        }
        .wordpress-content p {
          margin-bottom: 1.5rem;
          font-size: 1.1rem;
        }
        .wordpress-content figure {
          margin: 0;
          padding: 0;
        }
      `}</style>
    </div>
  );
};

export default MotherhoodSection;
