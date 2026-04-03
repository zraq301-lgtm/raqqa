import React, { useState, useEffect } from 'react';

const MotherhoodSection = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  // المعرف الخاص بفئة الأمومة الذي استخرجتِه
  const CATEGORY_ID = "768006428";
  // رابط الـ API مع تفعيل جلب الصور المرفقة (_embed)
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
      <div className="flex justify-center items-center h-64 text-pink-400">
        جاري تحميل عالم الأمومة...
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-b from-white to-pink-50 min-h-screen font-sans">
      <h1 className="text-3xl font-bold text-pink-600 mb-8 text-right border-r-4 border-pink-300 pr-4">
        قسم الأمومة والتربية
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {articles.map((post) => (
          <div 
            key={post.id} 
            className="backdrop-blur-md bg-white/70 rounded-3xl shadow-lg border border-white/20 overflow-hidden hover:scale-105 transition-transform duration-300"
          >
            {/* عرض الصورة البارزة للمقال */}
            {post._embedded?.['wp:featuredmedia'] ? (
              <img 
                src={post._embedded['wp:featuredmedia'][0].source_url} 
                alt={post.title.rendered}
                className="w-full h-52 object-cover"
              />
            ) : (
              <div className="w-full h-52 bg-pink-100 flex items-center justify-center text-pink-300">
                لا توجد صورة
              </div>
            )}

            <div className="p-5 text-right">
              <h2 
                className="text-xl font-semibold text-gray-800 mb-3"
                dangerouslySetInnerHTML={{ __html: post.title.rendered }}
              />
              
              <div 
                className="text-gray-500 text-sm mb-4 line-clamp-3 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
              />

              <a 
                href={post.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block px-6 py-2 bg-pink-500 text-white rounded-full text-sm font-medium hover:bg-pink-600 transition-colors"
              >
                اقرئي المقال كاملاً
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MotherhoodSection;
