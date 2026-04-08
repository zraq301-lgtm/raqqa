import React, { useState, useEffect } from 'react';

const SoulsLounge = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const CATEGORY_ID = '10783713';
  const API_URL = `https://public-api.wordpress.com/wp/v2/sites/raqqastor3.wordpress.com/posts?categories=${CATEGORY_ID}&_embed`;

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(API_URL);
        const data = await response.json();
        setPosts(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching WordPress posts:", error);
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  // التنسيقات المدمجة (Internal Styles)
  const styles = {
    container: {
      padding: '20px',
      direction: 'rtl',
      fontFamily: "'Tajawal', sans-serif",
      backgroundColor: '#fff5f7',
      minHeight: '100vh',
    },
    title: {
      color: '#ff4d7d',
      textAlign: 'center',
      fontSize: '1.8rem',
      marginBottom: '30px',
      fontWeight: '900',
    },
    card: {
      background: 'rgba(255, 255, 255, 0.9)',
      borderRadius: '20px',
      padding: '15px',
      marginBottom: '25px',
      boxShadow: '0 8px 32px rgba(255, 77, 125, 0.1)',
      border: '1px solid rgba(255, 77, 125, 0.2)',
      backdropFilter: 'blur(10px)',
    },
    postImage: {
      width: '100%',
      height: '200px',
      objectFit: 'cover',
      borderRadius: '15px',
      marginBottom: '15px',
    },
    postTitle: {
      color: '#333',
      fontSize: '1.3rem',
      marginBottom: '10px',
      lineHeight: '1.4',
    },
    postContent: {
      color: '#666',
      fontSize: '0.95rem',
      lineHeight: '1.6',
      marginBottom: '15px',
    },
    videoContainer: {
      position: 'relative',
      paddingBottom: '56.25%', // 16:9 ratio
      height: 0,
      overflow: 'hidden',
      borderRadius: '15px',
      marginTop: '15px',
      backgroundColor: '#000',
    },
    iframe: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      border: 0,
    },
    loadingText: {
      textAlign: 'center',
      color: '#ff4d7d',
      marginTop: '50px',
      fontSize: '1.2rem',
    }
  };

  // دالة لاستخراج رابط الفيديو من محتوى المقال (إذا كان موجوداً كـ iframe)
  const extractVideoUrl = (content) => {
    const div = document.createElement('div');
    div.innerHTML = content;
    const iframe = div.querySelector('iframe');
    return iframe ? iframe.src : null;
  };

  if (loading) return <div style={styles.loadingText}>جاري تحميل السكينة للأرواح... ✨</div>;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>رواق الأرواح</h1>
      
      {posts.map((post) => {
        const videoUrl = extractVideoUrl(post.content.rendered);
        const featuredImage = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;

        return (
          <article key={post.id} style={styles.card}>
            {/* عرض الصورة البارزة */}
            {featuredImage && (
              <img src={featuredImage} alt={post.title.rendered} style={styles.postImage} />
            )}

            {/* عنوان المقال */}
            <h2 style={styles.postTitle} dangerouslySetInnerHTML={{ __html: post.title.rendered }} />

            {/* نص المقال (مختصر) */}
            <div 
              style={styles.postContent} 
              dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }} 
            />

            {/* عرض الفيديو إذا وجد داخل المقال */}
            {videoUrl && (
              <div style={styles.videoContainer}>
                <iframe 
                  src={videoUrl} 
                  title="Video content" 
                  style={styles.iframe} 
                  allowFullScreen
                />
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
};

export default SoulsLounge;
