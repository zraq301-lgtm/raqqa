import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasNotif, setHasNotif] = useState(false);
  const navigate = useNavigate();

  const CHECK_NOTIF_URL = "https://raqqa-v6cd-29ts9t5cn-raqqs-projects.vercel.app/api/notifications?user_id=1";

  // دالة جلب الإشعارات (بديلة لـ listenToPlatform)
  const checkNotifications = async () => {
    try {
      const res = await fetch(`${CHECK_NOTIF_URL}&t=${new Date().getTime()}`);
      const data = await res.json();
      if (data.success && data.notifications.length > 0) {
        setHasNotif(true);
      }
    } catch (err) {
      console.log("بانتظار المنصة...");
    }
  };

  useEffect(() => {
    checkNotifications();
    const interval = setInterval(checkNotifications, 40000);
    return () => clearInterval(interval);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <>
      {/* القائمة الجانبية (Sidebar) */}
      <div className={`overlay ${isMenuOpen ? 'show' : ''}`} onClick={toggleMenu}></div>
      <div className={`sidebar ${isMenuOpen ? 'active' : ''}`}>
        <h2 style={{ color: 'var(--mauve)', fontWeight: '300' }}>رواقكِ الأنيق</h2>
        <a href="https://www.facebook.com/profile.php?id=61571056531349" 
           target="_blank" 
           rel="noreferrer"
           className="sidebar-link">
          <i className="fab fa-facebook icon-vid"></i> صفحة فيسبوك رقة
        </a>
      </div>

      {/* الهيدر العلوي */}
      <header className="header">
        <div onClick={toggleMenu} style={{ cursor: 'pointer', color: 'var(--mauve)' }}>
          <i className="fas fa-bars-staggered fa-lg"></i>
        </div>
        
        <div className="header-tools">
          <button className="tool-btn" onClick={() => navigate('/vr-world')}>
            <i className="fas fa-vr-cardboard icon-vr"></i> عالم رقة
          </button>
          <button className="tool-btn" onClick={() => navigate('/videos')}>
            <i className="fas fa-play-circle icon-vid"></i> الفيديوهات
          </button>
          <div style={{ position: 'relative', cursor: 'pointer' }} 
               onClick={() => { navigate('/notifications'); setHasNotif(false); }}>
            <i className="fas fa-bell icon-bell"></i>
            {hasNotif && <span id="dot" style={{ display: 'block', backgroundColor: '#ff0000' }}></span>}
          </div>
        </div>
      </header>
    </>
  );
}

export default Header;
