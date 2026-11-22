import React, { useCallback, useEffect, useRef, useState } from 'react';

const SplashScreen = ({ onFinished }) => {
  const [fadeOut, setFadeOut] = useState(false);
  const finishedRef = useRef(false);

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setFadeOut(true);
    window.setTimeout(() => onFinished?.(), 450);
  }, [onFinished]);

  useEffect(() => {
    // احتياط في حال منع المتصفح التشغيل التلقائي أو تعذر تحميل الفيديو.
    const fallbackTimer = window.setTimeout(finish, 7500);
    return () => window.clearTimeout(fallbackTimer);
  }, [finish]);

  return (
    <div
      className={`raqqa-splash-screen${fadeOut ? ' raqqa-splash-screen--fade-out' : ''}`}
      role="status"
      aria-label="جاري تجهيز تطبيق رِقّة"
    >
      <video
        autoPlay
        muted
        playsInline
        preload="auto"
        onEnded={finish}
        onError={finish}
        className="raqqa-splash-video"
      >
        <source src="/splash_video.mp4" type="video/mp4" />
      </video>
    </div>
  );
};

export default SplashScreen;
