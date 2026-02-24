import React, { useState } from 'react';
import { CapacitorHttp } from '@capacitor/core';

const ProfilePage = () => {
  const [formData, setFormData] = useState({
    user_id: "user_" + Math.random().toString(36).substr(2, 9), // معرف فريد مؤقت
    name: '',
    age: '',
    social_status: '',
    health_status: '',
    education_level: '',
    hobbies: '',
    life_mission: '',
    weight: '',
    children_count: '',
    chronic_diseases: '',
    last_period: '',
    created_at: new Date().toISOString()
  });

  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveData = async () => {
    setLoading(true);
    setStatusMessage('جاري حفظ بياناتكِ الرقيقة...');

    try {
      const options = {
        url: 'https://raqqa-v6cd.vercel.app/api/save-notifications',
        headers: { 'Content-Type': 'application/json' },
        data: {
          ...formData,
          // تخصيص حقل إضافي للتحليل إذا لزم الأمر
          notification_meta: `المستخدمة ${formData.name}، الحالة: ${formData.health_status}، الأبناء: ${formData.children_count}`
        }
      };

      // الاتصال عبر CapacitorHttp لضمان العمل على الأجهزة المحمولة
      const response = await CapacitorHttp.post(options);

      if (response.status === 200 || response.status === 201) {
        setStatusMessage('تم حفظ بياناتكِ بنجاح! ستصلكِ إشعارات مخصصة قريباً ✨');
      } else {
        throw new Error("فشل الحفظ");
      }
    } catch (err) {
      console.error("فشل الاتصال الأصلي:", err);
      setStatusMessage("حدث خطأ في الشبكة، تأكدي من الاتصال بالإنترنت.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.appContainer}>
      <header style={styles.topStickyMenu}>
        <div style={styles.topCard}>
          <div style={styles.cardText}>
            <span style={styles.cardLabel}>ملفي الشخصي</span>
          </div>
          <div style={styles.customImgIcon}>
            <img 
              src="https://via.placeholder.com/56" 
              alt="Profile" 
              style={{width: '100%', height: '100%', borderRadius: '50%'}} 
            />
          </div>
        </div>
      </header>

      <main style={styles.mainContent}>
        <div style={styles.welcomeSection}>
          <h2 style={styles.title}>أهلاً بكِ يا جمييلة ✨</h2>
          <p style={styles.subtitle}>بياناتكِ تساعدنا في العناية بكِ بشكل أفضل</p>
        </div>

        <form style={styles.formGrid}>
          {/* قسم البيانات الأساسية */}
          <section style={styles.section}>
            <h3 style={styles.sectionTitle}>البيانات الأساسية</h3>
            <div style={styles.inputGroup}>
              <label style={styles.label}>الاسم بالكامل</label>
              <input type="text" name="name" placeholder="اسمكِ" style={styles.input} onChange={handleChange} />
            </div>
            <div style={styles.row}>
              <div style={{...styles.inputGroup, flex: 1}}>
                <label style={styles.label}>العمر</label>
                <input type="number" name="age" style={styles.input} onChange={handleChange} />
              </div>
              <div style={{...styles.inputGroup, flex: 1, marginRight: '10px'}}>
                <label style={styles.label}>الوزن</label>
                <input type="number" name="weight" style={styles.input} onChange={handleChange} />
              </div>
            </div>
          </section>

          {/* قسم الحالة والمجتمع */}
          <section style={styles.section}>
            <h3 style={styles.sectionTitle}>حياتكِ ومجتمعكِ</h3>
            <div style={styles.inputGroup}>
              <label style={styles.label}>الحالة الاجتماعية</label>
              <select name="social_status" style={styles.select} onChange={handleChange}>
                <option value="">اختاري...</option>
                <option value="دراسة">دراسة</option>
                <option value="مخطوبة">مخطوبة</option>
                <option value="متزوجة">متزوجة</option>
                <option value="مطلقة">مطلقة</option>
                <option value="أرملة">أرملة</option>
              </select>
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>عدد الأولاد</label>
              <input type="number" name="children_count" style={styles.input} onChange={handleChange} />
            </div>
          </section>

          {/* قسم الصحة */}
          <section style={styles.section}>
            <h3 style={styles.sectionTitle}>ركن الصحة والإشعارات</h3>
            <div style={styles.inputGroup}>
              <label style={styles.label}>الحالة الصحية (لتفعيل المتابعة)</label>
              <select name="health_status" style={styles.select} onChange={handleChange}>
                <option value="">اختاري...</option>
                <option value="عزباء">عزباء</option>
                <option value="حامل">حامل</option>
                <option value="مرضعة">مرضعة</option>
                <option value="سن الأمل">سن الأمل</option>
              </select>
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>تاريخ آخر دورة</label>
              <input type="date" name="last_period" style={styles.input} onChange={handleChange} />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>أمراض مزمنة</label>
              <input type="text" name="chronic_diseases" placeholder="لا يوجد" style={styles.input} onChange={handleChange} />
            </div>
          </section>

          {/* قسم الطموح */}
          <section style={styles.section}>
            <h3 style={styles.sectionTitle}>رسالتكِ</h3>
            <div style={styles.inputGroup}>
              <label style={styles.label}>رسالتكِ في الحياة</label>
              <textarea name="life_mission" rows="3" style={styles.textarea} onChange={handleChange}></textarea>
            </div>
          </section>

          {statusMessage && (
            <div style={{textAlign: 'center', color: '#ff4d7d', marginBottom: '10px', fontSize: '0.9rem'}}>
              {statusMessage}
            </div>
          )}

          <button 
            type="button" 
            onClick={handleSaveData} 
            disabled={loading}
            style={{...styles.saveButton, opacity: loading ? 0.7 : 1}}
          >
            {loading ? 'جاري الحفظ...' : 'حفظ البيانات وتفعيل الإشعارات'}
          </button>
        </form>
      </main>

      {/* المنيو السفلي */}
      <nav style={styles.bottomStickyMenu}>
        <div style={styles.navGrid}>
          <div style={styles.navItem}>
             <div style={styles.customImgIconNav}></div>
             <span style={styles.navLabel}>المنتدى</span>
          </div>
          <div style={styles.centerAction}>
             <div style={styles.centerCircle}>
                <span style={{fontSize: '12px', color: '#ff4d7d', fontWeight: 'bold'}}>صحتك</span>
             </div>
          </div>
          <div style={styles.navItem}>
             <div style={styles.customImgIconNav}></div>
             <span style={styles.navLabel}>عالم رقة</span>
          </div>
        </div>
      </nav>
    </div>
  );
};

const styles = {
  appContainer: { display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#fff5f7', direction: 'rtl', fontFamily: 'Tajawal, sans-serif' },
  topStickyMenu: { padding: '8px 12px', background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)', borderBottom: '2px solid rgba(255, 77, 125, 0.15)', display: 'flex', justifyContent: 'center', position: 'sticky', top: 0, zIndex: 100 },
  topCard: { display: 'flex', flexDirection: 'row', alignItems: 'center', background: 'white', padding: '4px 16px', borderRadius: '30px', boxShadow: '0 4px 10px rgba(255, 77, 125, 0.1)', border: '1px solid rgba(255, 77, 125, 0.15)' },
  customImgIcon: { width: '45px', height: '45px', borderRadius: '50%', border: '2px solid #ff4d7d', overflow: 'hidden' },
  cardLabel: { fontSize: '0.9rem', fontWeight: 'bold', color: '#ff4d7d', marginLeft: '10px' },
  mainContent: { flex: 1, overflowY: 'auto', padding: '20px', paddingBottom: '100px' },
  welcomeSection: { textAlign: 'center', marginBottom: '20px' },
  title: { color: '#ff4d7d', fontSize: '1.4rem', margin: '0' },
  subtitle: { color: '#555', fontSize: '0.85rem' },
  section: { background: 'white', borderRadius: '20px', padding: '15px', marginBottom: '15px', boxShadow: '0 4px 15px rgba(255, 77, 125, 0.05)' },
  sectionTitle: { fontSize: '1rem', color: '#9b59b6', borderRight: '4px solid #ff4d7d', paddingRight: '10px', marginBottom: '15px' },
  inputGroup: { marginBottom: '12px', display: 'flex', flexDirection: 'column' },
  label: { fontSize: '0.8rem', color: '#555', marginBottom: '5px', fontWeight: 'bold' },
  input: { padding: '10px', borderRadius: '10px', border: '1px solid rgba(255, 77, 125, 0.2)', outline: 'none' },
  select: { padding: '10px', borderRadius: '10px', border: '1px solid rgba(255, 77, 125, 0.2)' },
  textarea: { padding: '10px', borderRadius: '10px', border: '1px solid rgba(255, 77, 125, 0.2)', fontFamily: 'inherit' },
  row: { display: 'flex' },
  saveButton: { width: '100%', padding: '15px', borderRadius: '30px', border: 'none', backgroundColor: '#ff4d7d', color: 'white', fontSize: '1rem', fontWeight: 'bold', boxShadow: '0 5px 15px rgba(255, 77, 125, 0.3)', cursor: 'pointer' },
  bottomStickyMenu: { position: 'fixed', bottom: 0, width: '100%', background: 'white', height: '80px', boxShadow: '0 -6px 20px rgba(255, 77, 125, 0.1)', borderRadius: '30px 30px 0 0' },
  navGrid: { display: 'flex', justifyContent: 'space-around', alignItems: 'center', height: '100%' },
  navItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 },
  customImgIconNav: { width: '40px', height: '40px', borderRadius: '50%', border: '2px solid rgba(255, 77, 125, 0.15)' },
  navLabel: { fontSize: '0.75rem', color: '#ff4d7d', marginTop: '4px' },
  centerAction: { position: 'relative', top: '-15px' },
  centerCircle: { width: '70px', height: '70px', background: 'white', borderRadius: '50%', border: '3px solid #ff4d7d', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 6px 15px rgba(255, 77, 125, 0.3)' }
};

export default ProfilePage;
