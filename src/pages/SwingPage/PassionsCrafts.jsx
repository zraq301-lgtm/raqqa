import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PassionAndCraft = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // البيانات الخاصة بموقعك والقسم المطلوب بناءً على الـ ID المستخرج
  const SITE_URL = "raqqastor3.wordpress.com";
  const CATEGORY_ID = 788402012; 

  useEffect(() => {
    const fetchAllPosts = async () => {
      try {
        const response = await axios.get(
          `https://public-api.wordpress.com/wp/v2/sites/${SITE_URL}/posts`,
          {
            params: {
              categories: CATEGORY_ID, // جلب المقالات التابعة لهذا الـ ID فقط
              per_page: 20,
              _embed: true 
            }
          }
        );
        setPosts(response.data);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllPosts();
  }, []);

  // دالة معالجة روابط يوتيوب
  const formatContent = (content) => {
    const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/g;
    const embedHtml = '<div class="video-wrapper"><iframe src="https://www.youtube.com/embed/$1" frameborder="0" allowfullscreen></iframe></div>';
    return content.replace(youtubeRegex, embedHtml);
  };

  if (loading) return <div className="loader">جاري تحميل المحتوى...</div>;

  return (
    <div className="passion-container">
      <header className="page-header">
        <h1>شغف وحرف</h1>
        <div className="accent-line"></div>
      </header>

      <div className="posts-grid">
        {posts.length > 0 ? (
          posts.map((post) => (
            <article key={post.id} className="modern-card">
              {post._embedded?.['wp:featuredmedia'] && (
                <div className="card-image">
                  <img src={post._embedded['wp:featuredmedia'][0].source_url} alt={post.title.rendered} />
                  <div className="category-badge">مقال مختار</div>
                </div>
              )}

              <div className="card-body">
                <h2 className="card-title" dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
                <div 
                  className="card-text" 
                  dangerouslySetInnerHTML={{ __html: formatContent(post.content.rendered) }} 
                />
                <div className="card-footer">
                  <span>{new Date(post.date).toLocaleDateString('ar-EG')}</span>
                  <button className="share-btn">❤️ اعجاب</button>
                </div>
              </div>
            </article>
          ))
        ) : (
          <p style={{textAlign: 'center', gridColumn: '1/-1'}}>لا توجد مقالات في هذا القسم حالياً.</p>
        )}
      </div>

      <style>{`
        .passion-container { min-height: 100vh; background: #fff5f8; padding: 30px 15px; direction: rtl; font-family: 'Cairo', sans-serif; }
        .page-header { text-align: center; margin-bottom: 40px; }
        .page-header h1 { color: #880e4f; font-size: 2.2rem; }
        .accent-line { height: 4px; width: 80px; background: linear-gradient(to right, #ec4899, #8b5cf6); margin: 10px auto; border-radius: 10px; }
        .posts-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 25px; max-width: 1200px; margin: 0 auto; }
        .modern-card { background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 20px rgba(0,0,0,0.05); transition: 0.3s; display: flex; flex-direction: column; }
        .modern-card:hover { transform: translateY(-5px); }
        .card-image { position: relative; height: 200px; }
        .card-image img { width: 100%; height: 100%; object-fit: cover; }
        .category-badge { position: absolute; top: 10px; right: 10px; background: #db2777; color: white; padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; }
        .card-body { padding: 20px; flex-grow: 1; }
        .card-title { color: #4c1d95; font-size: 1.25rem; margin-bottom: 10px; }
        .card-text { color: #4b5563; font-size: 0.95rem; line-height: 1.6; }
        .video-wrapper { position: relative; padding-bottom: 56.25%; height: 0; margin: 15px 0; border-radius: 12px; overflow: hidden; }
        .video-wrapper iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
        .card-footer { margin-top: 15px; padding-top: 15px; border-top: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
        .share-btn { background: #fdf2f8; border: none; color: #db2777; padding: 5px 15px; border-radius: 15px; cursor: pointer; }
        .loader { height: 200px; display: flex; justify-content: center; align-items: center; color: #db2777; }
        @media (max-width: 480px) { .posts-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
};

export default PassionAndCraft;
