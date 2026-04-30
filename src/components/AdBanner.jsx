import React, { useEffect, useState } from 'react';
import { remoteConfig } from '../firebase-config'; 
import { getValue, fetchAndActivate } from "firebase/remote-config";

const AdBanner = () => {
  const [adSettings, setAdSettings] = useState({ show: true, unitId: 'ca-app-pub-3940256099942544/6300978111' }); // وضعنا كود تجريبي وقيمة true مبدئياً للاختبار

  useEffect(() => {
    const initAd = async () => {
      try {
        // 1. محاولة جلب الإعدادات من فيربيس
        await fetchAndActivate(remoteConfig);
        const firebaseShow = getValue(remoteConfig, "show_ads").asBoolean();
        const firebaseUnitId = getValue(remoteConfig, "ad_unit_id").asString();
        
        // تحديث الإعدادات بالقيم القادمة من فيربيس
        if (firebaseUnitId) {
            setAdSettings({ show: firebaseShow, unitId: firebaseUnitId });
        }

        // 2. تشغيل إعلانات جوجل
        if (window.googletag) {
          window.googletag.cmd.push(function() {
            // تنظيف الحاوية
            const container = document.getElementById('div-gpt-ad');
            if (container) container.innerHTML = '';

            window.googletag.defineSlot(firebaseUnitId || 'ca-app-pub-3940256099942544/6300978111', [320, 50], 'div-gpt-ad')
                     .addService(window.googletag.pubads());
            window.googletag.enableServices();
            window.googletag.display('div-gpt-ad');
          });
        }
      } catch (e) {
        console.error("Firebase/AdMob Error:", e);
      }
    };

    initAd();
  }, []);

  if (!adSettings.show) return null;

  return (
    <div className="ad-container" style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      margin: '10px 0', 
      width: '100%',
      minHeight: '50px'
    }}>
      {/* أضفت خلفية رمادية خفيفة عشان نحدد مكان الإعلان وقت الفحص */}
      <div id="div-gpt-ad" style={{ 
        width: '320px', 
        height: '50px', 
        backgroundColor: '#f0f0f0', 
        border: '1px dashed #ccc' 
      }}>
        <small style={{color: '#ccc', fontSize: '10px'}}>جاري تحميل الإعلان...</small>
      </div>
    </div>
  );
};

export default AdBanner;
