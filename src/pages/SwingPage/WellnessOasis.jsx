import React, { useState } from 'react';

// يمكنك استبدال هذه البيانات ببيانات من الـ API لاحقاً
const POSTS_DATA = [
  {
    id: 1,
    author: "@Sara_Alwan",
    time: "30 دم",
    title: "فطوري الصحي اليوم 😋",
    image: "https://images.unsplash.com/photo-1494390248081-4e521a5940db?q=80&w=400", // صورة تجريبية للشوفان
    category: "تغذية صحية",
    likes: "1,580",
    comments: "55"
  },
  {
    id: 2,
    author: "@Mona_Fit",
    time: "50 دم",
    title: "تحدي الـ 30 يوم للياقة المنزلية بدأ!",
    image: "https://images.unsplash.com/photo-1518611012118-2969c636000c?q=80&w=400", // صورة تجريبية للرياضة
    category: "تمارين رياضة",
    likes: "1,500",
    comments: "33"
  }
];

const WahaDashboard = () => {
  return (
    <div style={styles.pageWrapper}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerTitle}>واحة العافية - مجتمع صحي للنساء</div>
      </header>

      <div style={styles.mainContainer}>
        {/* Sidebar الأيمن (قائمة الأقسام) */}
        <aside style={styles.sidebar}>
          <div style={styles.searchBox}>
            <input type="text" placeholder="بحث في المنتدى..." style={styles.searchInput} />
          </div>
          <nav style={styles.navMenu}>
            <NavItem icon="📄" label="المنشورات الأحدث" active color="#fce4ec" />
            <NavItem icon="🍎" label="التغذية الصحية" color="#e8f5e9" />
            <NavItem icon="🍹" label="وصفات مشروبات" color="#fff3e0" />
            <NavItem icon="🏋️‍♀️" label="تمارين رياضة" color="#fce4ec" />
            <NavItem icon="📈" label="قصص نجاح" color="#fffde7" />
          </nav>
        </aside>

        {/* Content Area الوسطى */}
        <section style={styles.contentArea}>
          <div style={styles.sectionHeader}>
            <h2 style={{ fontSize: '22px', color: '#444' }}>صفحة المنتدى - واحة العافية</h2>
            <span style={{ color: '#888' }}>النشاط الأحدث</span>
          </div>

          <div style={styles.postsGrid}>
            {POSTS_DATA.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </section>

        {/* Right Action Sidebar (إنشاء منشور) */}
        <aside style={styles.actionSidebar}>
          <div style={styles.createPostCard}>
            <div style={styles.createHeader}>
              <span>Start a Post</span>
              <span>📝</span>
            </div>
            <textarea placeholder="بماذا تشعرين اليوم؟" style={styles.textArea}></textarea>
            <div style={styles.actionIcons}>
              <span>🖼️ Photo</span>
              <span>🎥 Video</span>
              <span>📝 Text</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

// مكون صغير لعناصر القائمة
const NavItem = ({ icon, label, active, color }) => (
  <div style={{
    ...styles.navItem,
    backgroundColor: active ? color : 'transparent',
    borderRight: active ? '4px solid #ad1457' : 'none'
  }}>
    <span style={styles.navIcon}>{icon}</span>
    <span style={styles.navLabel}>{label}</span>
  </div>
);

// مكون كارت المنشور
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
    <img src={post.image} alt="post" style={styles.cardImage} />
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
    backgroundColor: '#fdf7f2', // لون الخلفية الكريمي من الصورة
    minHeight: '100vh',
    direction: 'rtl',
    fontFamily: 'Arial, sans-serif'
  },
  header: {
    background: 'linear-gradient(to right, #a5d6a7, #f8bbd0)',
    padding: '15px',
    textAlign: 'center',
    borderRadius: '0 0 20px 20px',
    margin: '0 20px'
  },
  headerTitle: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    display: 'inline-block',
    padding: '8px 30px',
    borderRadius: '15px',
    fontWeight: 'bold',
    color: '#2d3436'
  },
  mainContainer: {
    display: 'grid',
    gridTemplateColumns: '250px 1fr 300px',
    gap: '20px',
    padding: '20px'
  },
  sidebar: {
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: '20px',
    padding: '15px'
  },
  searchBox: { marginBottom: '20px' },
  searchInput: {
    width: '100%',
    padding: '10px',
    borderRadius: '10px',
    border: '1px solid #ddd',
    outline: 'none'
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px',
    borderRadius: '12px',
    marginBottom: '8px',
    cursor: 'pointer',
    transition: '0.3s'
  },
  navIcon: { fontSize: '20px', marginLeft: '10px' },
  navLabel: { fontSize: '14px', fontWeight: 'bold', color: '#444' },
  contentArea: { display: 'flex', flexDirection: 'column', gap: '20px' },
  sectionHeader: { textAlign: 'right', marginBottom: '10px' },
  postsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px'
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '20px',
    padding: '15px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
  },
  cardHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '10px' },
  userInfo: { display: 'flex', alignItems: 'center', gap: '10px' },
  avatar: { width: '35px', height: '35px', borderRadius: '50%', backgroundColor: '#eee' },
  userName: { fontWeight: 'bold', fontSize: '14px' },
  postTime: { fontSize: '12px', color: '#999' },
  cardTitle: { fontSize: '16px', margin: '10px 0', color: '#333' },
  cardImage: { width: '100%', borderRadius: '15px', height: '180px', objectFit: 'cover' },
  cardFooter: { display: 'flex', justifyContent: 'space-between', marginTop: '15px' },
  categoryTag: { backgroundColor: '#f0f0f0', padding: '4px 12px', borderRadius: '10px', fontSize: '12px' },
  interactions: { display: 'flex', gap: '15px', color: '#666', fontSize: '13px' },
  actionSidebar: { display: 'flex', flexDirection: 'column', gap: '20px' },
  createPostCard: {
    backgroundColor: '#fff',
    borderRadius: '20px',
    padding: '20px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
  },
  createHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '15px', color: '#ad1457', fontWeight: 'bold' },
  textArea: {
    width: '100%',
    height: '80px',
    border: 'none',
    backgroundColor: '#f9f9f9',
    borderRadius: '10px',
    padding: '10px',
    resize: 'none',
    outline: 'none'
  },
  actionIcons: {
    display: 'flex',
    justifyContent: 'space-around',
    marginTop: '15px',
    fontSize: '13px',
    color: '#777'
  }
};

export default WahaDashboard;
