import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { Sparkles, PlayCircle, Image as ImageIcon, RefreshCcw, ExternalLink, AlertCircle } from 'lucide-react';

// --- الإعدادات الصحيحة بناءً على الرابط الجديد ---
const SITE_DOMAIN = "raqqastor3.wordpress.com";
const CATEGORY_ID = "788431179"; // تم التحديث بناءً على الرابط: tag_ID=788431179
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
  .category-name { 
    color: #4a3a3a; 
    font-size: 2.2rem; 
    margin: 10px 0;
    font-weight: 700;
  }
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

const MediaContainer = styled.div`
  width: 100%;
  height: 220px;
  background: #fdf2f7;
  position: relative;
  img, iframe, video { width: 100%; height: 100%; object-fit: cover; border: none; }
`;

const Badge = styled.div`
  position: absolute;
  top: 15px;
  right: 15px;
  background: rgba(255, 255, 255, 0.9);
  padding: 6px 12px;
  border-radius: 50px;
  font-size: 0.7rem;
  color: #d63384;
  display: flex;
  align-items: center;
  gap: 5px;
  font-weight: bold;
  z-index: 2;
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
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("فشل الاتصال بالموقع");
        
        const data = await response.json();
        setPosts(data.posts || []);
      } catch (err) {
        setError("عذراً، لا يمكن جلب المقالات حالياً.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) return (
    <Container>
      <Loader><RefreshCcw size={48} /><p>نجهز لكِ الأناقة...</p></Loader>
    </Container>
  );

  if (error) return (
    <Container>
      <div style={{ textAlign: 'center', color: '#ff4d4d', marginTop: '50px' }}>
        <AlertCircle size={40} />
        <p>{error}</p>
      </div>
    </Container>
  );

  return (
    <Container>
      <Header>
        <span className="site-tag">موقع رقة</span>
        <h1 className="category-name">آخر المقالات</h1>
      </Header>

      <BlogGrid>
        {posts.map((post) => (
          <ArticleCard key={post.ID}>
            <MediaContainer>
              <Badge>
                {post.content.includes('iframe') ? <><PlayCircle size={12}/> فيديو</> : <><ImageIcon size={12}/> مقال</>}
              </Badge>
              <img 
                src={post.featured_image || "https://via.placeholder.com/600x400?text=Raqqa+Store"} 
                alt={post.title} 
              />
            </MediaContainer>
            
            <div style={{ padding: '20px' }}>
              <h3 
                style={{ fontSize: '1.2rem', color: '#333', lineHeight: '1.5', marginBottom: '12px' }}
                dangerouslySetInnerHTML={{ __html: post.title }} 
              />
              <div 
                style={{ color: '#666', fontSize: '0.9rem', marginBottom: '20px', height: '60px', overflow: 'hidden' }}
                dangerouslySetInnerHTML={{ __html: post.excerpt }} 
              />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <a 
                  href={post.URL} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: '#d63384', textDecoration: 'none', fontWeight: '700', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px' }}
                >
                  إقرئي المزيد <ExternalLink size={14} />
                </a>
                <span style={{ fontSize: '0.75rem', color: '#bbb' }}>
                  {new Date(post.date).toLocaleDateString('ar-EG')}
                </span>
              </div>
            </div>
          </ArticleCard>
        ))}
      </BlogGrid>

      {posts.length === 0 && (
        <div style={{ textAlign: 'center', marginTop: '50px', color: '#999' }}>
          <p>لا توجد مقالات منشورة في هذه الفئة حالياً.</p>
        </div>
      )}
    </Container>
  );
};

export default RaqqaBlog;
