import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PassionAndCraft = () => {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  // إعدادات جلب البيانات
  const SITE_URL = "raqqastor3.wordpress.com";
  const CATEGORY_SLUG = "passion-and-craft";

  useEffect(() => {
    const fetchContent = async () => {
      try {
        // جلب آخر مقال مع المحتوى الكامل والصور
        const response = await axios.get(
          `https://public-api.wordpress.com/wp/v2/sites/${SITE_URL}/posts`,
          {
            params: {
              category_slug: CATEGORY_SLUG,
              per_page: 1,
              _embed: true 
            }
          }
        );

        if (response.data.length > 0) {
          setPost(response.data[0]);
        }
      } catch (error) {
        console.error("خطأ في جلب البيانات:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  if (loading) return <div className="loader">جاري تجهيز محتوى الشغف...</div>;

  return (
    <div className="passion-page">
      <div className="glass-container">
        {post ? (
          <article className="content-wrapper">
            {/* 1. الصورة البارزة (تظهر كخلفية علوية) */}
            {post._embedded?.['wp:featuredmedia'] && (
              <div className="image-holder">
                <img 
                  src={post._embedded['wp:featuredmedia'][0].source_url} 
                  alt={post.title.rendered} 
                />
              </div>
            )}

            <div className="text-section">
              {/* 2. عنوان المقال */}
              <h1 className="title" dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
              
              <div className="divider"></div>

              {/* 3. محتوى المقال الكامل (يعرض داخل التطبيق مباشرة) */}
              <div 
                className="full-content" 
                dangerouslySetInnerHTML={{ __html: post.content.rendered }} 
              />
              
              <div className="footer-note">
                تم النشر في قسم شغف وحرف - تطبيق رقة
              </div>
            </div>
          </article>
        ) : (
          <p>لا يوجد محتوى متاح حالياً.</p>
        )}
      </div>

      <style>{`
        .passion-page {
          min-height: 100vh;
          background: #fdf2f8; /* لون وردي رقيق جداً */
          display: flex;
          justify-content: center;
          padding: 20px;
          direction: rtl;
          font-family: 'Cairo', sans-serif;
        }

        .glass-container {
          max-width: 700px;
          width: 100%;
          background: rgba(255, 255, 255, 0.4);
          backdrop-filter: blur(15px);
          border-radius: 35px;
          border: 1px solid rgba(255, 255, 255, 0.6);
          box-shadow: 0 20px 40px rgba(0,0,0,0.05);
          overflow: hidden;
        }

        .image-holder img {
          width: 100%;
          height: 300px;
          object-fit: cover;
        }

        .text-section {
          padding: 30px;
        }

        .title {
          color: #6b21a8; /* بنفسجي غامق */
          font-size: 1.8rem;
          margin-bottom: 15px;
          font-weight: 800;
        }

        .divider {
          height: 3px;
          width: 60px;
          background: #ec4899; /* وردي */
          margin-bottom: 25px;
          border-radius: 2px;
        }

        /* تنسيق النص الكامل القادم من ووردبريس */
        .full-content {
          color: #374151;
          line-height: 1.9;
          font-size: 1.15rem;
        }

        .full-content p {
          margin-bottom: 20px;
        }

        /* تنسيق الصور داخل المحتوى إذا وجدت */
        .full-content img {
          max-width: 100%;
          border-radius: 20px;
          margin: 15px 0;
        }

        .footer-note {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px dashed #d1d5db;
          color: #9ca3af;
          text-align: center;
          font-size: 0.9rem;
        }

        .loader {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          color: #ec4899;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
};

export default PassionAndCraft;
