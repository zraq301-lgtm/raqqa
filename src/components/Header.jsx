import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasNotif, setHasNotif] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <>
      {/* القائمة الجانبية المنظفة */}
      <div className={`overlay ${isMenuOpen ? 'show' : ''}`} onClick={toggleMenu}></div>
      <div className={`sidebar ${isMenuOpen ? 'active' : ''}`}>
        <h2 className="sidebar-title">رواقكِ الأنيق</h2>
        {/* تم حذف رابط الفيسبوك من هنا  */}
        <nav className="sidebar-nav">
          <button onClick={() => { navigate('/health'); toggleMenu(); }}>صحتك</button>
          <button onClick={() => { navigate('/swing-forum'); toggleMenu(); }}>الأرجوحة</button>
        </nav>
      </div>

      {/* الهيدر العلوي الاحترافي */}
      <header className="header-main">
        <div className="menu-trigger" onClick={toggleMenu}>
          <i className="fas fa-bars-staggered"></i>
        </div>
        
        <div className="header-tools">
          <div className="notif-wrapper" onClick={() => navigate('/notifications')}>
            <i className="fas fa-bell"></i>
            {hasNotif && <span className="notif-dot"></span>}
          </div>
        </div>
      </header>
    </>
  );
}

export default Header;
