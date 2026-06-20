import React, { useState, useEffect } from 'react';

const ProfileSetup = ({ onComplete }) => {
  // تفعيل التبديل بين وضع "إنشاء حساب الجديد" ووضع "تسجيل الدخول للحساب القديم"
  const [isLoginMode, setIsLoginMode] = useState(false);
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // تفريغ الرسائل عند التبديل بين الكروت
  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setMessage({ type: '', text: '' });
  };

  const handleAuthAction = async (e) => {
    e.preventDefault();
    
    // التحقق من الحقول بناءً على الوضع الحالي
    if (!email || !password || (!isLoginMode && !fullName)) {
      setMessage({ type: 'error', text: 'جميلتي، يرجى ملء الحقول المطلوبة أولاً 💕' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const fcmToken = localStorage.getItem('fcm_token');
      const { registerToSupabase, loginToSupabase } = await import('../services/authService');
      
      let result;
      
      if (isLoginMode) {
        // 1. منطق تسجيل الدخول للحساب القديم
        result = await loginToSupabase(email, password, fcmToken);
      } else {
        // 2. منطق إنشاء حساب جديد
        result = await registerToSupabase(email, password, fullName, fcmToken);
      }

      if (result.success) {
        setMessage({ 
          type: 'success', 
          text: isLoginMode ? 'أهلاً بعودتكِ يا جميلتي! ✨' : 'تم إنشاء حسابكِ بنجاح! ✨' 
        });
        
        // حفظ التوكن والحالة محلياً لضمان عدم الخروج نهائياً حتى لو أُغلق التطبيق من الخلفية
        localStorage.setItem('user_email', email.trim());
        localStorage.setItem('isProfileComplete', 'true');
        if (result.user?.id) {
          localStorage.setItem('user_id', result.user.id);
        }

        if (onComplete && result.user) {
          setTimeout(() => {
            onComplete({ ...result.user, fcmToken });
          }, 1200);
        }
      } else {
        setMessage({ type: 'error', text: result.error || 'حدث خطأ ما، أعيدي المحاولة.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'مشكلة في الاتصال بالخدمة الخارجية.' });
    } finally {
      setLoading(false);
    }
  };

  // تنسيقات CSS داخلية لضمان جمال واستقرار الواجهة في أي بيئة تشغيل
  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fff5f9 0%, #ffffff 50%, #fef6fb 100%)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      boxSizing: 'border-box',
    },
    glow1: {
      position: 'absolute',
      top: '-20%',
      right: '-10%',
      width: '500px',
      height: '500px',
      background: 'radial-gradient(circle, rgba(244,143,177,0.15) 0%, transparent 70%)',
      borderRadius: '50%',
      pointerEvents: 'none',
    },
    glow2: {
      position: 'absolute',
      bottom: '-20%',
      left: '-10%',
      width: '500px',
      height: '500px',
      background: 'radial-gradient(circle, rgba(186,104,200,0.1) 0%, transparent 70%)',
      borderRadius: '50%',
      pointerEvents: 'none',
    },
    wrapper: {
      width: '100%',
      maxWidth: '420px',
      transition: 'all 1s cubic-bezier(0.16, 1, 0.3, 1)',
      transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
      opacity: isVisible ? 1 : 0,
      zIndex: 10,
    },
    card: {
      background: 'rgba(255, 255, 255, 0.75)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderRadius: '32px',
      padding: '40px 32px',
      boxShadow: '0 20px 50px rgba(244, 143, 177, 0.15)',
      border: '1px solid rgba(255, 255, 255, 0.8)',
      position: 'relative',
      overflow: 'hidden',
    },
    topLine: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '4px',
      background: 'linear-gradient(90deg, #f48fb1, #ff8a80, #ce93d8)',
    },
    iconArea: {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: '24px',
    },
    iconCircle: {
      width: '80px',
      height: '80px',
      background: 'linear-gradient(180deg, #ffffff, #fff5f8)',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '32px',
      boxShadow: '0 10px 20px rgba(244,143,177,0.1)',
      border: '1px solid rgba(244,143,177,0.2)',
    },
    headerText: {
      textAlign: 'center',
      marginBottom: '32px',
    },
    title: {
      fontSize: '26px',
      fontWeight: '900',
      color: '#333333',
      margin: '0 0 8px 0',
    },
    gradientText: {
      background: 'linear-gradient(90deg, #ec4899, #f43f5e)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    subtitle: {
      fontSize: '14px',
      color: '#888888',
      margin: 0,
      fontWeight: '300',
    },
    alert: {
      marginBottom: '20px',
      padding: '12px',
      borderRadius: '16px',
      fontSize: '13px',
      textAlign: 'center',
      border: '1px solid',
      backgroundColor: message.type === 'success' ? '#e8f5e9' : '#ffebee',
      textColor: message.type === 'success' ? '#2e7d32' : '#c62828',
      borderColor: message.type === 'success' ? '#c8e6c9' : '#ffcdd2',
      color: message.type === 'success' ? '#2e7d32' : '#c62828',
    },
    formGroup: {
      marginBottom: '20px',
    },
    label: {
      display: 'block',
      textAlign: 'right',
      marginRight: '8px',
      marginBottom: '6px',
      fontSize: '12px',
      fontWeight: '700',
      color: '#999999',
    },
    inputWrapper: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
    },
    icon: {
      position: 'absolute',
      right: '16px',
      fontSize: '16px',
      color: '#bbbbbb',
      pointerEvents: 'none',
    },
    input: {
      width: '100%',
      padding: '14px 44px 14px 16px',
      backgroundColor: 'rgba(255,255,255,0.9)',
      border: '1px solid #eeeeee',
      borderRadius: '16px',
      fontSize: '14px',
      color: '#444444',
      outline: 'none',
      transition: 'all 0.3s ease',
      textAlign: 'right',
      boxSizing: 'border-box',
    },
    submitBtn: {
      width: '100%',
      padding: '16px',
      background: 'linear-gradient(90deg, #f48fb1, #ff8a80, #purple)',
      backgroundColor: '#f48fb1',
      backgroundImage: 'linear-gradient(90deg, #f48fb1, #ff8a80, #ce93d8)',
      color: '#ffffff',
      border: 'none',
      borderRadius: '16px',
      fontSize: '15px',
      fontWeight: '700',
      cursor: 'pointer',
      boxShadow: '0 10px 20px rgba(244,143,177,0.3)',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      marginTop: '28px',
    },
    divider: {
      display: 'flex',
      alignItems: 'center',
      margin: '24px 0',
    },
    line: {
      flexGrow: 1,
      height: '1px',
      backgroundColor: '#f0f0f0',
    },
    dividerText: {
      margin: '0 12px',
      fontSize: '12px',
      color: '#aaaaaa',
    },
    toggleBtn: {
      background: 'none',
      border: 'none',
      color: '#ba68c8',
      fontSize: '13px',
      fontWeight: '700',
      cursor: 'pointer',
      textDecoration: 'underline',
      width: '100%',
      textAlign: 'center',
    },
    footer: {
      marginTop: '24px',
      textAlign: 'center',
      fontSize: '12px',
      color: '#aaaaaa',
      fontWeight: '300',
    }
  };

  return (
    <div style={styles.container} dir="rtl">
      <div style={styles.glow1}></div>
      <div style={styles.glow2}></div>

      <div style={styles.wrapper}>
        <div style={styles.card}>
          <div style={styles.topLine}></div>

          <div style={styles.iconArea}>
            <div style={styles.iconCircle}>🌸</div>
          </div>

          <div style={styles.headerText}>
            <h1 style={styles.title}>
              {isLoginMode ? (
                <>مرحباً <span style={styles.gradientText}>بعودتكِ</span></>
              ) : (
                <>أهلاً بكِ في <span style={styles.gradientText}>رقة</span></>
              )}
            </h1>
            <p style={styles.subtitle}>
              {isLoginMode ? 'سجّلي دخولكِ لمتابعة رحلتكِ الهادئة' : 'مساحتكِ الآمنة لترتيب يومكِ والاعتناء بذاتكِ'}
            </p>
          </div>

          {message.text && (
            <div style={styles.alert}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleAuthAction}>
            
            {!isLoginMode && (
              <div style={styles.formGroup}>
                <label style={styles.label}>الاسم الجميل</label>
                <div style={styles.inputWrapper}>
                  <span style={styles.icon}>✨</span>
                  <input
                    type="text"
                    placeholder="ما هو اسمكِ يا رقيقة؟"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={loading}
                    style={styles.input}
                  />
                </div>
              </div>
            )}

            <div style={styles.formGroup}>
              <label style={styles.label}>البريد الإلكتروني</label>
              <div style={styles.inputWrapper}>
                <span style={styles.icon}>✉️</span>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  style={{...styles.input, textAlign: 'left'}}
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>كلمة المرور</label>
              <div style={styles.inputWrapper}>
                <span style={styles.icon}>🔒</span>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  style={{...styles.input, textAlign: 'left'}}
                />
              </div>
            </div>

            <button type="submit" disabled={loading} style={styles.submitBtn}>
              {loading ? 'انتظري قليلاً...' : (isLoginMode ? 'تسجيل الدخول ✨' : 'ابدئي رحلتكِ الجميلة الآن ✨')}
            </button>
          </form>

          <div style={styles.divider}>
            <div style={styles.line}></div>
            <span style={styles.dividerText}>أو</span>
            <div style={styles.line}></div>
          </div>

          <button type="button" onClick={toggleMode} disabled={loading} style={styles.toggleBtn}>
            {isLoginMode ? 'إنشاء حساب جديد ومساحة جديدة 🌸' : 'لديكِ حساب قديم بالفعل؟ تسجيل الدخول ✉️'}
          </button>

        </div>

        <p style={styles.footer}>
          بفتح الحساب، أنتِ توافقين على <span style={{color: '#f48fb1', fontWeight: '600'}}>خصوصية وسرية رقة</span>
        </p>
      </div>
    </div>
  );
};

export default ProfileSetup;
