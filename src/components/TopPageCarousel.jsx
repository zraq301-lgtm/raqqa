import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppTheme } from './AppThemeProvider';
import { pageImages } from '../config/assetUrls';

const pages = [
  { path: '/health', key: 'health', label: 'الصحة', alt: 'الصحة', image: pageImages.health },
  { path: '/insight', key: 'insight', label: 'كوني ملكة', alt: 'كوني ملكة', image: pageImages.insight },
  { path: '/feelings', key: 'feelings', label: 'المشاعر', alt: 'المشاعر', image: pageImages.feelings },
  { path: '/intimacy', key: 'intimacy', label: 'العلاقات الزوجية', alt: 'العلاقات الزوجية', image: pageImages.intimacy },
  { path: '/swing-forum', key: 'swing', label: 'الأرجوحة', alt: 'الأرجوحة', image: pageImages.swing },
];

export default function TopPageCarousel() {
  const { pathname } = useLocation();
  const appTheme = useAppTheme();
  const railRef = useRef(null);
  const currentIndexRef = useRef(0);
  const pauseUntilRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const pageIndex = Math.max(0, pages.findIndex((page) => pathname === page.path));

  const scrollToIndex = (index, behavior = 'smooth') => {
    const card = railRef.current?.children?.[index];
    if (!card) return;
    currentIndexRef.current = index;
    setActiveIndex(index);
    card.scrollIntoView({ behavior, block: 'nearest', inline: 'center' });
  };

  const syncIndexFromScroll = () => {
    const rail = railRef.current;
    if (!rail) return;
    const center = rail.getBoundingClientRect().left + rail.clientWidth / 2;
    let closestIndex = 0;
    let closestDistance = Infinity;
    Array.from(rail.children).forEach((card, index) => {
      const cardCenter = card.getBoundingClientRect().left + card.getBoundingClientRect().width / 2;
      const distance = Math.abs(center - cardCenter);
      if (distance < closestDistance) { closestDistance = distance; closestIndex = index; }
    });
    currentIndexRef.current = closestIndex;
    setActiveIndex((previous) => previous === closestIndex ? previous : closestIndex);
  };

  useEffect(() => { scrollToIndex(pageIndex, 'smooth'); }, [pageIndex]);
  useEffect(() => {
    const timer = window.setInterval(() => {
      if (Date.now() < pauseUntilRef.current) return;
      scrollToIndex((currentIndexRef.current + 1) % pages.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, []);

  const pauseForManualMove = () => { pauseUntilRef.current = Date.now() + 7000; };
  const resumeAfterManualMove = () => { pauseUntilRef.current = Date.now() + 4500; };

  return (
    <nav className="top-page-carousel" aria-label="الصفحات الرئيسية">
      <div className="top-page-carousel-heading"><strong>تصفحي رِقّة</strong><span>اسحبي للتنقل بين الصفحات</span></div>
      <div className="top-page-carousel-rail" ref={railRef} onScroll={syncIndexFromScroll} onPointerDown={pauseForManualMove} onPointerUp={resumeAfterManualMove} onPointerCancel={resumeAfterManualMove} onWheel={pauseForManualMove} onTouchStart={pauseForManualMove} onTouchEnd={resumeAfterManualMove}>
        {pages.map((page, index) => {
          const label = page.key === 'insight' ? 'كوني ملكة' : (appTheme.pages?.[page.key]?.label?.trim() || page.label);
          const customIcon = appTheme.pages?.[page.key]?.icon;
          const customIconImage = appTheme.pages?.[page.key]?.iconImageUrl;
          const isActive = pathname === page.path;
          return <Link to={page.path} className={`top-page-card${isActive ? ' active' : ''}`} key={page.path} aria-current={isActive ? 'page' : undefined} aria-label={`فتح صفحة ${label}`} onClick={() => { currentIndexRef.current = index; setActiveIndex(index); pauseForManualMove(); }}>
            <img src={page.image} alt={page.alt} loading="eager" draggable="false" />
            <span className="top-page-card-shade" />
            {customIconImage ? <img className="top-page-card-custom-icon-image" src={customIconImage} alt="" /> : customIcon && <span className="top-page-card-custom-icon" aria-hidden="true">{customIcon}</span>}
            <span className="top-page-card-label">{label}</span>
          </Link>;
        })}
      </div>
      <div className="top-page-carousel-dots" aria-hidden="true">{pages.map((page, index) => <span key={page.path} className={activeIndex === index ? 'active' : ''} />)}</div>
    </nav>
  );
}
