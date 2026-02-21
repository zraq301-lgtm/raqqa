import React from 'react';

const Home = () => {
  // بيانات ترحيبية بسيطة
  const welcomeData = {
    title: "مرحباً بكِ في أرجوحة الأنوثة",
    subtitle: "مساحتكِ الخاصة للإلهام، الإبداع، والجمال",
    features: ["مجتمع آمن", "تبادل خبرات", "دعم متبادل"]
  };

  return (
    <div className="home-welcome-container">
      <style>{`
        .home-welcome-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 40px 20px;
          background: white;
          border-radius: 30px;
          box-shadow: 0 10px 30px rgba(255, 77, 125, 0.05);
          border: 1px solid var(--female-pink-light);
          margin-top: 10px;
        }

        .welcome-icon {
          font-size: 4rem;
          margin-bottom: 20px;
          animation: swing 3s ease-in-out infinite;
        }

        @keyframes swing {
          0%, 100% { transform: rotate(-10deg); }
          50% { transform: rotate(10deg); }
        }

        .welcome-title {
          color: var(--female-pink);
          font-size: 1.8rem;
          font-weight: 800;
          margin-bottom: 10px;
        }

        .welcome-subtitle {
          color: #777;
          font-size: 1rem;
          margin-bottom: 30px;
          line-height: 1.6;
        }

        .features-list {
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .feature-tag {
          background: var(--female-pink-light);
          color: var(--female-pink);
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: bold;
        }
      `}</style>

      <div className="welcome-icon">🌸</div>
      
      <h1 className="welcome-title">{welcomeData.title}</h1>
      <p className="welcome-subtitle">{welcomeData.subtitle}</p>

      <div className="features-list">
        {welcomeData.features.map((feature, index) => (
          <span key={index} className="feature-tag">
            {feature}
          </span>
        ))}
      </div>
    </div>
  );
};

// هذا هو الجزء الأهم لمعالجة خطأ الـ Build
// التأكد من تصدير المكون كـ default
export default Home;
