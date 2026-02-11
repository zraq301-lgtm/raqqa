import React from 'react';
import { NavLink } from 'react-router-dom';
import { iconMap } from '../constants/iconMap';

const Navbar = () => {
  // تعريف الأقسام السفلية
  const navItems = [
    { path: '/feelings', label: 'المشاعر', icon: iconMap.feelings },
    { path: '/health', label: 'الصحة', icon: iconMap.health }, // القسم الرئيسي
    { path: '/insight', label: 'تبصر', icon: iconMap.insight },
    { path: '/intimacy', label: 'علاقات', icon: iconMap.intimacy },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `flex flex-col items-center justify-center w-full h-full transition-colors ${
                  isActive ? 'text-purple-600' : 'text-gray-400'
                }`
              }
            >
              <Icon className="w-6 h-6" />
              <span className="text-[10px] mt-1 font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default Navbar;
