import { NavLink } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="bottom-nav">
      <NavLink to="/swing" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
        <i className="fas fa-feather"></i> منتدى الأرجوحة
      </NavLink>
      
      <NavLink to="/health" className={({ isActive }) => isActive ? "nav-item center-btn active" : "nav-item center-btn"}>
        <i className="fas fa-hand-holding-heart"></i> 
        <span>الحميمية<br/>وصحتك</span>
      </NavLink>
      
      <NavLink to="/insight" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
        <i className="fas fa-wand-magic-sparkles"></i> بوحك وبصيرتك
      </NavLink>
    </nav>
  );
}

export default Navbar;
