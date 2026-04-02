import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PassionAndCraft = () => {
  const [latestPost, setLatestPost] = useState(null);
  const [loading, setLoading] = useState(true);

  // إعدادات الموقع والـ API
  const SITE_URL = "raqqastor3.wordpress.com";
  const CATEGORY_SLUG = "passion-and-craft"; // الاسم اللطيف الذي أنشأناه

  useEffect(() => {
    const fetchLatestPost = async () => {
      try {
        // جلب آخر مقال من تصنيف شغف وحرف فقط
        const response = await axios.get(
          `https://public-api.wordpress.com/wp/v2/sites/${SITE_URL}/posts`,
          {
            params: {
              category_slug: CATEGORY_SLUG,
              per_page: 1, // جلب آخر مقال واحد فقط
              _embed: true // لجلب الصور البارزة والمعلومات الإضافية
            }
          }
        );

        if (response.data.length > 0) {
          setLatestPost(response.data[0]);
        }
      } catch (error) {
        console.error("خطأ في جلب المقال:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestPost();
  }, []);

  if (loading) return <div className="loading">جاري جلب الإلهام...</div>;

  return (
    <div className="container">
      <header className="header">
        <h1>شغف وحرف</h1>
        <p>حيث يلتقي الإبداع بالفرص</p>
      </header>

      {latestPost ? (
        <div className="glass-card">
          {/* عرض الصورة البارزة إذا وجدت */}
          {latestPost._embedded && latestPost._embedded['wp:featuredmedia'] && (
            <img 
              src={latestPost._embedded['wp:featuredmedia'][0].source_url} 
              alt="Passion" 
              className="featured-image"
            />
          )}

          <div className="card-content">
            <h2 className="post-title" dangerouslySetInnerHTML={{ __html: latestPost.title.rendered }} />
            
            <div 
              className="post-excerpt" 
              dangerouslySetInnerHTML={{ __html: latestPost.excerpt.rendered }} 
            />

            <a href={latestPost.link} target="_blank" rel="noopener noreferrer" className="read-more-btn">
              اقرئي المقال كاملاً
            </a>
          </div>
        </div>
      ) : (
        <p className="no-post">لا يوجد مقالات منشورة حالياً في هذا القسم.</p>
      )}

      {/* تنسيقات CSS المدمجة */}
      <style>{`
        .container {
          min-height: 100vh;
          background: linear-gradient(135deg, #fce4ec 0%, #f3e5f5 100%);
          padding: 40px 20px;
          font-family: 'Cairo', sans-serif;
          direction: rtl;
        }

        .header {
          text-align: center;
          margin-bottom: 50px;
        }

        .header h1 {
          color: #7b1fa2;
          font-size: 2.5rem;
          margin-bottom: 10px;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
        }

        .header p {
          color: #9c27b0;
          font-style: italic;
        }

        .glass-card {
          max-width: 800px;
          margin: 0 auto;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(15px);
          -webkit-backdrop-filter: blur(15px);
          border-radius: 30px;
          border: 1px solid rgba(255, 255, 255, 0.4);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          transition: transform 0.3s ease;
        }

        .glass-card:hover {
          transform: translateY(-5px);
        }

        .featured-image {
          width: 100%;
          height: 350px;
          object-fit: cover;
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        }

        .card-content {
          padding: 30px;
        }

        .post-title {
          color: #4a148c;
          font-size: 1.8rem;
          margin-bottom: 15px;
        }

        .post-excerpt {
          color: #555;
          line-height: 1.8;
          font-size: 1.1rem;
          margin-bottom: 25px;
        }

        .read-more-btn {
          display: inline-block;
          background: linear-gradient(45deg, #e91e63, #9c27b0);
          color: white;
          padding: 12px 30px;
          border-radius: 50px;
          text-decoration: none;
          font-weight: bold;
          box-shadow: 0 4px 15px rgba(233, 30, 99, 0.3);
          transition: all 0.3s ease;
        }

        .read-more-btn:hover {
          box-shadow: 0 6px 20px rgba(233, 30, 99, 0.5);
          transform: scale(1.05);
        }

        .loading, .no-post {
          text-align: center;
          padding: 100px;
          font-size: 1.2rem;
          color: #7b1fa2;
        }

        @media (max-width: 600px) {
          .post-title { font-size: 1.4rem; }
          .featured-image { height: 200px; }
        }
      `}</style>
    </div>
  );
};

export default PassionAndCraft;
