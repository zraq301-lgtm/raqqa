import React from 'react';
import { useNavigate } from 'react-router-dom';
import { iconMap } from '../constants/iconMap';

const TopHeader = () => {
  const navigate = useNavigate();
  const VideoIcon = iconMap.videos;
  const WorldIcon = iconMap.virtualWorld;

  return (
    <div className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 px-4 py-2 border-b flex justify-between items-center shadow-sm">
      <button onClick={() => navigate('/videos')} className="flex flex-col items-center p-2">
        <VideoIcon className="w-6 h-6 text-purple-600" />
        <span className="text-xs mt-1">المكتبة</span>
      </button>
      
      <h1 className="font-bold text-lg text-purple-800">رؤاقة</h1>

      <button onClick={() => navigate('/virtual-world')} className="flex flex-col items-center p-2">
        <WorldIcon className="w-6 h-6 text-pink-600" />
        <span className="text-xs mt-1">عالم رقة</span>
      </button>
    </div>
  );
};

export default TopHeader;
