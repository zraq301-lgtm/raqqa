import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { PlayCircle, Image as ImageIcon, RefreshCcw, ExternalLink, AlertCircle, Film } from 'lucide-react';

// --- الإعدادات المحدثة بالـ ID الجديد ---
const SITE_DOMAIN = "raqqastor3.wordpress.com";
const CATEGORY_ID = "347212703"; 
const API_URL = `https://public-api.wordpress.com/rest/v1.1/sites/${SITE_DOMAIN}/posts?category=${CATEGORY_ID}&number=10`;

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const Container = styled.div`
  direction: rtl;
  font-family: 'Cairo', sans-serif;
  background: #fffafa;
  min-height: 100vh;
  padding: 30px 15px;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 40px;
  .category-name { color: #4a3a3a; font-size: 2.2rem; margin: 10px 0; font-weight: 700; }
  .site-tag { color: #d63384; font-weight: 600; font-size: 0.9rem; text-transform: uppercase; }
`;

const BlogGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 25px;
  max-width: 1100px;
  margin: 0 auto;
`;

const ArticleCard = styled.article`
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(214, 51, 132, 0.08);
  transition: transform 0.3s ease;
  animation: ${fadeInUp} 0.5s ease-out;
  &:hover { transform: translateY(-8px); }
`;

const MediaWrapper = styled.div`
  width: 100%;
  height: 220px;
  background: #000;
  position: relative;
  iframe, video, img { width: 100%; height: 100%; object-fit: cover; border: none; }
`;

const Badge = styled.div`
  position: absolute;
  top: 15px;
  right: 15px;
  background: rgba(255, 255, 255, 0.95);
  padding: 6px 12px;
  border-radius: 50px;
  font-size: 0.75rem;
  color: #d63384;
  display: flex;
  align-items: center;
  gap: 5px;
  font-weight: bold;
  z-index: 10;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
`;

const Loader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 0;
  color: #d63384;
  svg { animation: ${spin} 1.5s linear infinite; }
`;

const RaqqaBlog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error("فشل الاتصال");
        const data = await res.json();
        setPosts(data.posts || []);
      } catch (err) {
        setError("حدث خطأ أثناء تحميل المحتوى.");
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  // وظيفة ذكية لاستخراج الفيديو أو عرض الصورة
  const renderMedia = (post) => {
    const content = post.content;
    
    // 1. البحث عن رابط يوتيوب
    const youtubeMatch = content.match(/youtube\.com\/embed\/([^"\s?]+)/) || 
                         content.match(/youtu\.be\/([^"\s?]+)/);
    
    if (youtubeMatch) {
      const videoId = youtubeMatch[1].split(/[?&]/)[0];
      return (
        <MediaWrapper>
          <Badge><PlayCircle size={14}/> فيديو يوتيوب</Badge>
          <iframe 
            src={`https://www.youtube.com/embed/${videoId}`}
            title="YouTube video"
            allowFullScreen
          />
        </MediaWrapper>
      );
    }

    // 2. البحث عن فيديو مباشر (MP4)
    const videoTagMatch = content.match(/<video[^>]*src="([^"]+)"/);
    if (videoTagMatch) {
      return (
        <MediaWrapper>
          <Badge><Film size={14}/> فيديو مباشر</Badge>
          <video src={videoTagMatch[1]} controls />
        </MediaWrapper>
      );
    }

    // 3. عرض الصورة البارزة إذا لم يوجد فيديو
    return (
      <MediaWrapper>
        <Badge><ImageIcon size={14}/> مقال مصور</Badge>
        <img 
          src={post.featured_image || "https://via.placeholder.com/600x400?text=Raqqa+Store"} 
          alt={post.title} 
        />
      </MediaWrapper>
    );
  };

  if (loading) return <Container><Loader><RefreshCcw size={48} /><p>نحضر لكِ الأناقة...</p></Loader></Container>;
  if (error) return <Container><div style={{textAlign:'center', color:'#ff4d4d'}}><AlertCircle size={40}/><p>{error}</p></div></Container>;

  return (
    <Container>
      <Header>
        <span className="site-tag">موقع رقة</span>
        <h1 className="category-name">المحتوى الجديد</h1>
      </Header>

      <BlogGrid>
        {posts.map((post) => (
          <ArticleCard key={post.ID}>
            {renderMedia(post)}
            <div style={{ padding: '20px' }}>
              <h3 
                style={{ fontSize: '1.1rem', color: '#333', marginBottom: '10px' }}
                dangerouslySetInnerHTML={{ __html: post.title }} 
              />
              <div 
                style={{ color: '#777', fontSize: '0.85rem', height: '50px', overflow: 'hidden', marginBottom: '15px' }}
                dangerouslySetInnerHTML={{ __html: post.excerpt }} 
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <a 
                  href={post.URL} target="_blank" rel="noopener noreferrer"
                  style={{ color: '#d63384', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px' }}
                >
                  مشاهدة التفاصيل <ExternalLink size={14} />
                </a>
                <span style={{ fontSize: '0.7rem', color: '#bbb' }}>
                  {new Date(post.date).toLocaleDateString('ar-EG')}
                </span>
              </div>
            </div>
          </ArticleCard>
        ))}
      </BlogGrid>
    </Container>
  );
};

export default RaqqaBlog;
