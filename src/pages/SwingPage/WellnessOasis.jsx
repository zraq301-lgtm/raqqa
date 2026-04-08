import React, { useState, useEffect } from 'react';

const WellnessOasis = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // الـ ID الخاص بواحة العافية من الرابط الذي أرسلته
  const CATEGORY_ID = '788519318';
  const API_URL = `https://public-api.wordpress.com/wp/v2/sites/raqqastor3.wordpress.com/posts?categories=${CATEGORY_ID}&_embed`;

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(API_URL);
        const data = await response.json();
        setPosts(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching Wellness Oasis posts:", error);
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  // التنسيقات المدمجة لضمان ثبات البناء (Zero External CSS)
  const styles = {
    wrapper: {
      padding: '15px',
      direction: 'rtl',
      fontFamily: "'Tajawal', sans-serif",
      backgroundColor: '#fff5f7',
      minHeight: '100vh',
    },
    header: {
      color: '#ff4d7d',
      textAlign: 'center',
      fontSize: '1.6rem',
      marginBottom: '25px',
      fontWeight: 'bold',
      borderBottom: '2px solid #ff4d7d22',
      paddingBottom: '10px'
    },
    card: {
      background: '#ffffff',
      borderRadius: '18px',
      overflow: 'hidden',
      marginBottom: '20px',
      boxShadow: '0 4px 15px rgba(255, 77, 125, 0.08)',
      border: '1px solid #ff4d7d11',
    },
    imageContainer: {
      width: '100%',
      height: '220px',
      backgroundColor: '#eee',
    },
    img: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    },
    contentArea: {
      padding: '15px',
    },
    postTitle: {
      fontSize: '1.2rem',
      color: '#2d3436',
      marginBottom: '10px',
      fontWeight: '700',
    },
    excerpt: {
      fontSize: '0.9rem',
      color: '#636e72',
      lineHeight: '1.6',
      marginBottom: '15px',
    },
    videoWrapper: {
      position: 'relative',
      paddingBottom: '56.25%',
      height: 0,
      borderRadius: '12px',
      overflow: 'hidden',
      backgroundColor: '#000',
      marginTop: '10px'
    },
    iframe: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      border: 0,
    },
    loader: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '200px',
      color: '#ff4d7d',
      fontWeight: 'bold'
    }
  };

  // دالة ذكية لاستخراج الـ iframe الخاص بالفيديو من محتوى المقال
  const getEmbedVideo = (content) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const iframe = tempDiv.querySelector('iframe');
    return iframe ? iframe.src : null;
  };

  if (loading) return <div style={styles.loader}>جاري تحضير واحة العافية... 🌿</div>;

  return (
    <div style={styles.wrapper}>
      <h1 style={styles.header}>🌿 واحة العافية</h1>

      {posts.length === 0 && <p style={{textAlign:'center'}}>لا توجد مقالات حالياً في هذه الواحة.</p>}

      {posts.map((post) => {
        const videoSrc = getEmbedVideo(post.content.rendered);
        const featuredImg = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;

        return (
          <article key={post.id} style={styles.card}>
            {/* الصورة البارزة للمقال */}
            {featuredImg && (
              <div style={styles.imageContainer}>
                <img src={featuredImg} alt="Wellness" style={styles.img} />
              </div>
            )}

            <div style={styles.contentArea}>
              {/* عنوان المقال */}
              <h2 style={styles.postTitle} dangerouslySetInnerHTML={{ __html: post.title.rendered }} />

              {/* نص مختصر */}
              <div 
                style={styles.excerpt} 
                dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }} 
              />

              {/* إذا وجد فيديو في المقال يتم عرضه هنا */}
              {videoSrc && (
                <div style={styles.videoWrapper}>
                  <iframe 
                    src={videoSrc} 
                    title="Wellness Video" 
                    style={styles.iframe} 
                    allowFullScreen
                  />
                </div>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
};

export default WellnessOasis;
