import React, { useState, useEffect } from 'react';
import './Blog.css'; // تأكد من وجود الملف في نفس المجلد

const WordPressFeed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const CATEGORY_ID = '10783713';
  const API_URL = `https://public-api.wordpress.com/rest/v1.1/sites/raqqastor3.wordpress.com/posts/?category=${CATEGORY_ID}`;

  useEffect(() => {
    fetch(API_URL)
      .then((response) => {
        if (!response.ok) throw new Error('فشل في جلب البيانات من الخادم');
        return response.json();
      })
      .then((data) => {
        // تأكد أن البيانات تحتوي على المصفوفة المطلوبة
        setPosts(data.posts || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [API_URL]); // إضافة API_URL كمُعامل متغير لضمان الاستقرار

  if (loading) return <div className="loader">جاري تحميل المقالات...</div>;
  if (error) return <div className="error-msg">حدث خطأ: {error}</div>;

  return (
    <div className="blog-container">
      <header className="blog-header">
        <h1>مقالات الفئة المختارة</h1>
        <p>استكشف أحدث المنشورات والصور من مدونتنا</p>
      </header>

      <div className="posts-grid">
        {posts.length > 0 ? (
          posts.map((post) => (
            <article key={post.ID} className="post-card">
              <div className="post-image">
                <img 
                  src={post.featured_image || 'https://via.placeholder.com/400x250?text=No+Image'} 
                  alt={post.title} 
                />
              </div>
              <div className="post-content">
                <span className="post-date">
                  {new Date(post.date).toLocaleDateString('ar-EG')}
                </span>
                <h2 dangerouslySetInnerHTML={{ __html: post.title }} />
                <div 
                  className="post-excerpt" 
                  dangerouslySetInnerHTML={{ 
                    __html: post.excerpt ? post.excerpt.substring(0, 120) + '...' : '' 
                  }} 
                />
                <a 
                  href={post.URL} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="read-more"
                >
                  اقرأ المزيد
                </a>
              </div>
            </article>
          ))
        ) : (
          <p>لا توجد مقالات متاحة حالياً.</p>
        )}
      </div>
    </div>
  );
};

export default WordPressFeed;
