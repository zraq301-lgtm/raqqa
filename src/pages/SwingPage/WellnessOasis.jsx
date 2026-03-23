import React, { useState, useEffect } from 'react';

const WahaDashboard = () => {
  // مصفوفة فارغة بانتظار بياناتك من JSON أو GitHub
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  return (
    <div style={styles.pageWrapper}>
      {/* Header - ثابت في الأعلى */}
      <header style={styles.header}>
        <div style={styles.headerTitle}>واحة العافية - مجتمع صحي للنساء</div>
      </header>

      <div style={styles.mainVerticalContainer}>
        
        {/* 1. قسم البحث والأقسام (أعلى الصفحة) */}
        <section style={styles.topSection}>
          <div style={styles.searchBox}>
            <input type="text" placeholder="بحث في المنتدى..." style={styles.searchInput} />
          </div>
          <div style={styles.horizontalNav}>
            <NavItem icon="📄" label="الأحدث" active color="#fce4ec" />
            <NavItem icon="🍎" label="تغذية" color="#e8f5e9" />
            <NavItem icon="🍹" label="مشروبات" color="#fff3e0" />
            <NavItem icon="🏋️‍♀️" label="رياضة" color="#fce4ec" />
          </div>
        </section>

        {/* 2. قسم إنشاء منشور (تحت الأقسام مباشرة) */}
        <section style={styles.createSection}>
          <div style={styles.createPostCard}>
            <div style={styles.createHeader}>
              <span>شاركينا تجربتكِ اليوم..</span>
              <span>📝</span>
            </div>
            <textarea placeholder="ماذا يدور في ذهنكِ؟" style={styles.textArea}></textarea>
            <div style={styles.actionIcons}>
              <span>🖼️ صورة</span>
              <span>🎥 فيديو</span>
              <span>🎤 صوت</span>
            </div>
          </div>
        </section>

        {/* 3. منطقة عرض الكروت (أسفل بعضها البعض) */}
        <section style={styles.contentArea}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>آخر النشاطات</h2>
          </div>

          <div style={styles.verticalPostsList}>
            {posts.length > 0 ? (
              posts.map(post => <PostCard key={post.id} post={post} />)
            ) : (
              <div style={styles.emptyState}>
                ✨ لا توجد منشورات حالياً، كوني الأولى في النشر!
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

// مكون عناصر التنقل الأفقي
const NavItem = ({ icon, label, active, color }) => (
  <div style={{
    ...styles.navItem,
    backgroundColor: color,
    border: active ? '2px solid #ad1457' : '1px solid #eee'
  }}>
    <span style={styles.navIcon}>{icon}</span>
    <span style={styles.navLabel}>{label}</span>
  </div>
);

// مكون كارت المنشور (يحافظ على الشكل الجمالي)
const PostCard = ({ post }) => (
  <div style={styles.card}>
    <div style={styles.cardHeader}>
      <div style={styles.userInfo}>
        <div style={styles.avatar}></div>
        <div>
          <div style={styles.userName}>{post.author}</div>
          <div style={styles.postTime}>{post.time}</div>
        </div>
      </div>
      <span>•••</span>
    </div>
    <h3 style={styles.cardTitle}>{post.title}</h3>
    {post.image && <img src={post.image} alt="post" style={styles.cardImage} />}
    <div style={styles.cardFooter}>
      <span style={styles.categoryTag}>{post.category}</span>
      <div style={styles.interactions}>
        <span>❤️ {post.likes}</span>
        <span>💬 {post.comments}</span>
      </div>
    </div>
  </div>
);

const styles = {
  pageWrapper: {
    backgroundColor: '#fdf7f2',
    minHeight: '100vh',
    direction: 'rtl',
    fontFamily: 'Arial, sans-serif',
    paddingBottom: '50px'
  },
  header: {
    background: 'linear-gradient(to right, #a5d6a7, #f8bbd0)',
    padding: '20px 15px',
    textAlign: 'center',
    borderRadius: '0 0 25px 25px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
  },
  headerTitle: {
    backgroundColor: 'rgba(255,255,255,0.6)',
    display: 'inline-block',
    padding: '8px 25px',
    borderRadius: '20px',
    fontWeight: 'bold',
    color: '#333',
    fontSize: '18px'
  },
  mainVerticalContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    padding: '15px',
    maxWidth: '600px', // تحديد العرض ليكون مريحاً للعين في المنتصف
    margin: '0 auto'
  },
  topSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  searchBox: { width: '100%' },
  searchInput: {
    width: '100%',
    padding: '12px',
    borderRadius: '15px',
    border: '1px solid #ddd',
    outline: 'none',
    boxSizing: 'border-box'
  },
  horizontalNav: {
    display: 'flex',
    gap: '10px',
    overflowX: 'auto',
    padding: '5px 0',
    scrollbarWidth: 'none' // إخفاء شريط التمرير
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 15px',
    borderRadius: '20px',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    minWidth: 'fit-content'
  },
  navIcon: { marginLeft: '5px' },
  navLabel: { fontSize: '13px', fontWeight: 'bold' },
  createSection: { width: '100%' },
  createPostCard: {
    backgroundColor: '#fff',
    borderRadius: '20px',
    padding: '15px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
    border: '1px solid #fce4ec'
  },
  createHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: '#ad1457', fontSize: '14px', fontWeight: 'bold' },
  textArea: {
    width: '100%',
    height: '60px',
    border: 'none',
    backgroundColor: '#fafafa',
    borderRadius: '12px',
    padding: '10px',
    resize: 'none',
    outline: 'none',
    boxSizing: 'border-box'
  },
  actionIcons: { display: 'flex', justifyContent: 'space-around', marginTop: '10px', color: '#777', fontSize: '12px' },
  contentArea: { width: '100%' },
  sectionHeader: { marginBottom: '15px', borderRight: '4px solid #ad1457', paddingRight: '10px' },
  sectionTitle: { fontSize: '18px', color: '#444', margin: 0 },
  verticalPostsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '20px',
    padding: '20px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
    border: '1px solid #eee'
  },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  userInfo: { display: 'flex', alignItems: 'center', gap: '10px' },
  avatar: { width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#fce4ec', border: '1px solid #ffd1dc' },
  userName: { fontWeight: 'bold', fontSize: '15px' },
  postTime: { fontSize: '12px', color: '#999' },
  cardTitle: { fontSize: '17px', margin: '15px 0', color: '#2d3436', lineHeight: '1.5' },
  cardImage: { width: '100%', borderRadius: '15px', maxHeight: '300px', objectFit: 'cover' },
  cardFooter: { display: 'flex', justifyContent: 'space-between', marginTop: '15px', alignItems: 'center' },
  categoryTag: { backgroundColor: '#f8f9fa', padding: '5px 12px', borderRadius: '10px', fontSize: '11px', color: '#666' },
  interactions: { display: 'flex', gap: '15px', color: '#555', fontSize: '14px' },
  emptyState: { textAlign: 'center', padding: '40px', color: '#999', fontStyle: 'italic' },
};

export default WahaDashboard;
