import React, { useState, useEffect } from 'react';

const MotherhoodArticles = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  // الرابط الأساسي للموقع
  const BASE_URL = "https://raqqastor3.wordpress.com/wp-json/wp/v2";
  // الـ Slug الخاص بالفئة التي سننشئها
  const CATEGORY_SLUG = "motherhood"; 

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        // 1. جلب معرف الفئة (ID) باستخدام الـ Slug
        const catRes = await fetch(`${BASE_URL}/categories?slug=${CATEGORY_SLUG}`);
        const categories = await catRes.json();
        
        if (categories.length > 0) {
          const categoryId = categories[0].id;
          
          // 2. جلب المقالات التابعة لهذا المعرف فقط
          const postRes = await fetch(`${BASE_URL}/posts?categories=${categoryId}&_embed`);
          const data = await postRes.json();
          setArticles(data);
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  if (loading) return <div className="text-center p-10">جاري تحميل مقالات التربية...</div>;

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-pink-600 mb-6 text-right">عالم الأمومة والتربية</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {articles.map((post) => (
          <div key={post.id} className="bg-white rounded-2xl shadow-sm overflow-hidden border border-pink-100">
            {/* عرض الصورة البارزة إذا وجدت */}
            {post._embedded?.['wp:featuredmedia'] && (
              <img 
                src={post._embedded['wp:featuredmedia'][0].source_url} 
                alt={post.title.rendered}
                className="w-full h-48 object-cover"
              />
            )}
            
            <div className="p-4 text-right">
              <h2 
                className="text-xl font-semibold mb-2 text-gray-800"
                dangerouslySetInnerHTML={{ __html: post.title.rendered }}
              />
              
              {/* عرض مقتطف من المقال */}
              <div 
                className="text-gray-600 text-sm mb-4"
                dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
              />

              <button className="text-pink-500 font-medium hover:underline">
                اقرئي المزيد
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MotherhoodArticles;
