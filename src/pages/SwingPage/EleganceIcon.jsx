import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { Sparkles, PlayCircle, Image as ImageIcon, BookOpen, RefreshCcw, ExternalLink } from 'lucide-react';

// --- إعدادات الرابط ---
const WP_URL = "https://public-api.wordpress.com/wp/v2/sites/raqqastor3.wordpress.com";
const CATEGORY_ID = "788431179"; // معرف فئة العناية والأناقة

// --- الأنيميشن ---
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

// --- المكونات المرئية (Styled Components) ---
const Container = styled.div`
  direction: rtl;
  font-family: 'Cairo', sans-serif;
  background: #fdfafb;
  min-height: 100vh;
  padding: 40px 20px;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 60px;
  h1 { color: #4a3a3a; font-size: 2.5rem; margin-bottom: 10px; }
  p { color: #8e7f7f; font-size: 1.1rem; }
`;

const BlogGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;
`;

const ArticleCard = styled.article`
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
  transition: all 0.3s ease;
  animation: ${fadeInUp} 0.6s ease forwards;
  &:hover { transform: translateY(-10px); box-shadow: 0 20px 40px rgba(255, 182, 193, 0.2); }
`;

const MediaWrapper = styled.div`
  width: 100%;
  height: 220px;
  background: #eee;
  position: relative;
  overflow: hidden;

  iframe, video { width: 100%; height: 100%; border: none; }
  img { width: 100%; height: 100%; object-fit: cover; }
`;

const ContentArea = styled.div`
  padding: 20px;
  h2 { font-size: 1.3rem; color: #333; margin-bottom: 15px; line-height: 1.4; }
  .excerpt { color: #666; font-size: 0.95rem; line-height: 1.6; height: 80px; overflow: hidden; }
`;

const Tag = styled.span`
  position: absolute;
  top: 15px;
  right: 15px;
  background: rgba(255, 255, 255, 0.9);
  padding: 5px 12px;
  border-radius: 50px;
  font-size: 0.75rem;
  font-weight: bold;
  color: #d63384;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 5px;
`;

const LoadingSection = styled.div`
  text-align: center;
  padding: 100px;
  color: #d63384;
  svg { animation: spin 2s linear infinite; }
  @keyframes spin { 100% { transform: rotate(-360deg); } }
`;

// --- وظيفة معالجة المحتوى (الفيديو والصور) ---
const RenderMedia = ({ post }) => {
  const content = post.content.rendered;
  
  // 1. البحث عن فيديوهات YouTube أو Vimeo في المحتوى
  const youtubeMatch = content.match(/youtube\.com\/embed\/([^"\s]+)/);
  const vimeoMatch = content.match(/vimeo\.com\/([^"\s]+)/);
  const videoTagMatch = content.match(/<video[^>]*src="([^"]+)"/);

  if (youtubeMatch) {
    return <iframe src={`https://www.youtube.com/embed/${youtubeMatch[1]}`} title="video" allowFullScreen />;
  }
  if (vimeoMatch) {
    return <iframe src={`https://player.vimeo.com/video/${vimeoMatch[1]}`} title="video" allowFullScreen />;
  }
  if (videoTagMatch) {
    return <video src={videoTagMatch[1]} controls />;
  }

  // 2. إذا لم يوجد فيديو، نعرض الصورة البارزة (Featured Image)
  return (
    <img 
      src={post.jetpack_featured_media_url || "https://via.placeholder.com/600x400?text=Raqqa+Store"} 
      alt={post.title.rendered} 
    />
  );
};

// --- المكون الرئيسي ---
const RaqqaBlog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      // جلب المقالات بناءً على معرف القسم
      const response = await fetch(`${WP_URL}/posts?categories=${CATEGORY_ID}&_embed`);
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error("خطأ في جلب البيانات:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <Container>
      <Header>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
          <Sparkles color="#d63384" size={32} />
        </div>
        <h1>العناية والأناقة</h1>
        <p>أحدث المقالات والنصائح من عالم الجمال</p>
      </Header>

      {loading ? (
        <LoadingSection>
          <RefreshCcw size={48} />
          <p>جاري تحميل الأناقة...</p>
        </LoadingSection>
      ) : (
        <BlogGrid>
          {posts.map((post) => (
            <ArticleCard key={post.id}>
              <MediaWrapper>
                {/* تحديد الوسائط تلقائياً (فيديو أم صورة) */}
                {post.content.rendered.includes('iframe') || post.content.rendered.includes('<video') ? (
                  <Tag><PlayCircle size={14} /> فيديو</Tag>
                ) : (
                  <Tag><ImageIcon size={14} /> مقال مصور</Tag>
                )}
                <RenderMedia post={post} />
              </MediaWrapper>

              <ContentArea>
                <h2 dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
                <div 
                  className="excerpt" 
                  dangerouslySetInnerHTML={{ __html: post.excerpt.rendered.substring(0, 120) + '...' }} 
                />
                
                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <a 
                    href={post.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ 
                      color: '#d63384', 
                      textDecoration: 'none', 
                      fontWeight: 'bold', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '5px' 
                    }}
                  >
                    إقرئي المزيد <ExternalLink size={16} />
                  </a>
                  <span style={{ fontSize: '0.8rem', color: '#aaa' }}>
                    {new Date(post.date).toLocaleDateString('ar-EG')}
                  </span>
                </div>
              </ContentArea>
            </ArticleCard>
          ))}
        </BlogGrid>
      )}

      {!loading && posts.length === 0 && (
        <div style={{ textAlign: 'center', color: '#666' }}>لا توجد مقالات حالياً في هذا القسم.</div>
      )}
    </Container>
  );
};

export default RaqqaBlog;
