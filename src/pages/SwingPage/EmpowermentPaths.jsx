import React, { useState, useEffect } from 'react';
import axios from 'axios';

const WordPressPost = () => {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // إعدادات الروابط
  const CATEGORY_ID = '788485478';
  const API_URL = `https://public-api.wordpress.com/wp/v2/sites/raqqastor3.wordpress.com/posts?categories=${CATEGORY_ID}&_embed&per_page=1`;

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(API_URL);
        if (response.data.length > 0) {
          setPost(response.data[0]);
        } else {
          setError("لا توجد مقالات في هذه الفئة.");
        }
      } catch (err) {
        setError("حدث خطأ أثناء جلب البيانات.");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, []);

  if (loading) return <div style={styles.loader}>جاري التحميل...</div>;
  if (error) return <div style={styles.error}>{error}</div>;
  if (!post) return null;

  // استخراج الصورة البارزة (Featured Image)
  const featuredImage = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;

  // محاولة استخراج رابط فيديو من المحتوى (Youtube مثلاً)
  const videoMatch = post.content.rendered.match(/https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/[^\s"<]+/);
  const videoUrl = videoMatch ? videoMatch[0] : null;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* عرض الصورة */}
        {featuredImage && (
          <img src={featuredImage} alt={post.title.rendered} style={styles.image} />
        )}

        <div style={styles.content}>
          <h2 style={styles.title} dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
          
          <div 
            style={styles.excerpt} 
            dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }} 
          />

          {/* عرض رابط الفيديو إذا وجد */}
          {videoUrl && (
            <div style={styles.videoSection}>
              <p style={styles.videoLabel}>🎥 فيديو ذو صلة:</p>
              <a href={videoUrl} target="_blank" rel="noopener noreferrer" style={styles.videoLink}>
                مشاهدة الفيديو على يوتيوب
              </a>
            </div>
          )}

          <a href={post.link} target="_blank" rel="noopener noreferrer" style={styles.readMore}>
            قراءة المقال كاملاً
          </a>
        </div>
      </div>
    </div>
  );
};

// التنسيقات المدمجة (CSS-in-JS)
const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    direction: 'rtl',
    backgroundColor: '#f4f7f6',
    minHeight: '100vh',
  },
  card: {
    maxWidth: '600px',
    backgroundColor: '#fff',
    borderRadius: '15px',
    overflow: 'hidden',
    boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
  },
  image: {
    width: '100%',
    height: '300px',
    objectFit: 'cover',
  },
  content: {
    padding: '20px',
  },
  title: {
    fontSize: '24px',
    color: '#333',
    marginBottom: '15px',
  },
  excerpt: {
    fontSize: '16px',
    color: '#666',
    lineHeight: '1.6',
    marginBottom: '20px',
  },
  videoSection: {
    backgroundColor: '#fff3cd',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '20px',
    border: '1px solid #ffeeba',
  },
  videoLabel: {
    margin: '0 0 5px 0',
    fontWeight: 'bold',
    color: '#856404',
  },
  videoLink: {
    color: '#007bff',
    textDecoration: 'none',
    fontWeight: '500',
  },
  readMore: {
    display: 'inline-block',
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: '#fff',
    borderRadius: '5px',
    textDecoration: 'none',
    transition: '0.3s',
  },
  loader: { textAlign: 'center', marginTop: '50px', fontSize: '20px' },
  error: { color: 'red', textAlign: 'center', marginTop: '50px' },
};

export default WordPressPost;
