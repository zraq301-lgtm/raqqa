import React, { useState, useEffect } from 'react';

const RoqaDirectView = () => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  const API_URL = "https://public-api.wordpress.com/wp/v2/sites/raqqastor3.wordpress.com/posts?categories=788594722";

  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(posts => {
        if (posts.length > 0) {
          // جلب محتوى المقال بالكامل (الذي يحتوي على الـ HTML)
          setContent(posts[0].content.rendered);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{textAlign:'center', padding:'50px'}}>جاري تحميل التصميم... ✨</div>;

  return (
    <div style={{ direction: 'rtl', padding: '15px', background: '#fffcfd' }}>
      {/* هذا السطر السحري هو الذي سيعرض تصميم وردبريس داخل تطبيقك */}
      <div 
        className="wordpress-content"
        dangerouslySetInnerHTML={{ __html: content }} 
      />
      
      {content === "" && <p style={{textAlign:'center'}}>لا يوجد محتوى لعرضه حالياً.</p>}
    </div>
  );
};

export default RoqaDirectView;
