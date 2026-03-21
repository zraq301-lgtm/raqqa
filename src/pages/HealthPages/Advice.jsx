import React, { useState, useEffect } from 'react';
import tipsData from './data/tips.json'; // التأكد من المسار الصحيح للملف

const HealthTips = () => {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    // مؤقت لتغيير النصيحة كل 30 ثانية
    const timer = setInterval(() => {
      triggerNext();
    }, 30000);

    return () => clearInterval(timer);
  }, [index]);

  const triggerNext = () => {
    setFade(false); // تأثير الخروج
    setTimeout(() => {
      setIndex((prev) => (prev + 1) % tipsData.length);
      setFade(true); // تأثير الدخول
    }, 500);
  };

  const currentTip = tipsData[index];

  return (
    <div className="tips-wrapper">
      <div className={`tips-card ${fade ? 'fade-in' : 'fade-out'}`}>
        {/* شريط التقدم الزمني العلوي */}
        <div className="progress-container">
          <div className="progress-bar"></div>
        </div>

        <div className="tip-header">
          <span className="tip-icon">{currentTip.icon}</span>
          <span className="tip-badge">نصيحة اليوم</span>
        </div>

        <h2 className="tip-title">{currentTip.title}</h2>
        <p className="tip-content">{currentTip.content}</p>

        <div className="tip-footer">
          <div className="tip-stats">
            <span>{index + 1} / {tipsData.length}</span>
          </div>
          <button className="next-btn" onClick={triggerNext}>
            النصيحة التالية ➔
          </button>
        </div>
      </div>

      {/* كود CSS المدمج للاحترافية القصوى */}
      <style>{`
        .tips-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 400px;
          direction: rtl;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: transparent;
        }

        .tips-card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(15px);
          -webkit-backdrop-filter: blur(15px);
          border: 1px solid rgba(255, 255, 255, 0.4);
          border-radius: 30px;
          padding: 40px;
          width: 100%;
          maxWidth: 420px;
          box-shadow: 0 20px 40px rgba(255, 182, 193, 0.2);
          position: relative;
          overflow: hidden;
          transition: all 0.5s ease;
        }

        .progress-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 6px;
          background: rgba(255, 255, 255, 0.3);
        }

        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #ff85a2, #ffb7c5);
          width: 100%;
          animation: countdown 30s linear infinite;
          transform-origin: right;
        }

        @keyframes countdown {
          from { transform: scaleX(1); }
          to { transform: scaleX(0); }
        }

        .fade-in { opacity: 1; transform: translateY(0); }
        .fade-out { opacity: 0; transform: translateY(-10px); }

        .tip-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
        }

        .tip-icon {
          font-size: 50px;
          filter: drop-shadow(0 5px 10px rgba(0,0,0,0.1));
        }

        .tip-badge {
          background: #fff0f5;
          color: #d81b60;
          padding: 5px 15px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: bold;
          border: 1px solid #ffc1e3;
        }

        .tip-title {
          color: #880e4f;
          font-size: 24px;
          margin-bottom: 15px;
          font-weight: 800;
        }

        .tip-content {
          color: #555;
          font-size: 18px;
          line-height: 1.8;
          min-height: 100px;
        }

        .tip-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 30px;
          border-top: 1px solid rgba(255, 182, 193, 0.2);
          padding-top: 20px;
        }

        .tip-stats {
          color: #ad1457;
          font-weight: bold;
          font-size: 14px;
        }

        .next-btn {
          background: linear-gradient(45deg, #ec407a, #f06292);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 15px;
          cursor: pointer;
          font-weight: 600;
          transition: transform 0.2s;
          box-shadow: 0 4px 15px rgba(236, 64, 122, 0.3);
        }

        .next-btn:hover {
          transform: scale(1.05);
          background: #d81b60;
        }
      `}</style>
    </div>
  );
};

export default HealthTips;
