import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PassionAndCraft = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const SITE_URL = "raqqastor3.wordpress.com";
  const CATEGORY_SLUG = "passion-and-craft";

  useEffect(() => {
    const fetchAllPosts = async () => {
      try {
        const response = await axios.get(
          `https://public-api.wordpress.com/wp/v2/sites/${SITE_URL}/posts`,
          {
            params: {
              category_slug: CATEGORY_SLUG,
              per_page: 20, // جلب حتى 20 مقال
              _embed: true 
            }
          }
        );
        setPosts(response.data);
      } catch (error) {
        console.error("خطأ في جلب البيانات:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllPosts();
  }, []);

  // دالة ذكية لتحويل روابط يوتيوب داخل النص إلى Iframe
  const formatContent = (content) => {
    const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/g;
    const embedHtml = '<div class="video-wrapper"><iframe src="https://www.youtube.com/embed/$1" frameborder="0" allowfullscreen></iframe></div>';
    return content.replace(youtubeRegex, embedHtml);
  };

  if (loading) return <div className="loader">جاري تجهيز عالم الإبداع...</div>;

  return (
    <div className="passion-container">
      <header className="page-header">
        <h1>شغف وحرف</h1>
        <div className="accent-line"></div>
      </header>

      <div className="posts-grid">
        {posts.map((post) => (
          <article key={post.id} className="modern-card">
            {/* الصورة البارزة */}
            {post._embedded?.['wp:featuredmedia'] && (
              <div className="card-image">
                <img src={post._embedded['wp:featuredmedia'][0].source_url} alt={post.title.rendered} />
                <div className="category-badge">حرف يدوية</div>
              </div>
            )}

            <div className="card-body">
              <h2 className="card-title" dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
              
              {/* المحتوى مع معالجة روابط الفيديو */}
              <div 
                className="card-text" 
                dangerouslySetInnerHTML={{ __html: formatContent(post.content.rendered) }} 
              />
              
              <div className="card-footer">
                <span>{new Date(post.date).toLocaleDateString('ar-EG')}</span>
                <button className="share-btn">❤️ شغف</button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <style>{`
        .passion-container {
          min-height: 100vh;
          background: #fff5f8;
          padding: 30px 15px;
          direction: rtl;
          font-family: 'Cairo', sans-serif;
        }

        .page-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .page-header h1 {
          color: #880e4f;
          font-size: 2.2rem;
          margin-bottom: 10px;
        }

        .accent-line {
          height: 4px;
          width: 80px;
          background: linear-gradient(to right, #ec4899, #8b5cf6);
          margin: 0 auto;
          border-radius: 10px;
        }

        /* تنسيق الشبكة (Grid) ليكون متجاوباً */
        .posts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 25px;
          max-width: 1200px;
          margin: 0 auto;
        }

        /* الكارت العصري */
        .modern-card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(10px);
          border-radius: 24px;
          border: 1px solid rgba(255, 255, 255, 0.5);
          box-shadow: 0 10px 25px rgba(0,0,0,0.03);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: all 0.3s ease;
        }

        .modern-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 15px 35px rgba(236, 72, 153, 0.1);
        }

        .card-image {
          position: relative;
          height: 220px;
        }

        .card-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .category-badge {
          position: absolute;
          top: 15px;
          right: 15px;
          background: rgba(255, 255, 255, 0.9);
          padding: 5px 15px;
          border-radius: 50px;
          font-size: 0.8rem;
          color: #be185d;
          font-weight: bold;
        }

        .card-body {
          padding: 25px;
          flex-grow: 1;
        }

        .card-title {
          color: #4c1d95;
          font-size: 1.4rem;
          margin-bottom: 15px;
          line-height: 1.4;
        }

        .card-text {
          color: #4b5563;
          line-height: 1.7;
          font-size: 1rem;
        }

        /* تنسيق الفيديو داخل الكارت */
        .video-wrapper {
          position: relative;
          padding-bottom: 56.25%; /* نسبة 16:9 */
          height: 0;
          overflow: hidden;
          margin: 15px 0;
          border-radius: 15px;
        }

        .video-wrapper iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        .card-footer {
          margin-top: 20px;
          padding-top: 15px;
          border-top: 1px solid #f3f4f6;
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: #9ca3af;
          font-size: 0.85rem;
        }

        .share-btn {
          background: transparent;
          border: 1px solid #f9a8d4;
          padding: 5px 15px;
          border-radius: 50px;
          color: #db2777;
          cursor: pointer;
          transition: 0.2s;
        }

        .share-btn:hover {
          background: #fdf2f8;
        }

        .loader {
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          color: #db2777;
          font-size: 1.5rem;
        }

        /* للموبايل: جعل الكارت يملأ العرض */
        @media (max-width: 480px) {
          .posts-grid {
            grid-template-columns: 1fr;
          }
          .modern-card {
            border-radius: 15px;
          }
        }
      `}</style>
    </div>
  );
};

export default PassionAndCraft;
