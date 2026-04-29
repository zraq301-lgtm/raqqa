import React, { useEffect, useState } from 'react';
import { remoteConfig } from '../firebase-config'; 
import { getValue, fetchAndActivate } from "firebase/remote-config";

const AdBanner = () => {
  const [adSettings, setAdSettings] = useState({ show: false, unitId: '' });

  useEffect(() => {
    const loadAd = async () => {
      try {
        // التأكد من جلب أحدث البيانات من فيربيس
        await fetchAndActivate(remoteConfig);
        
        const showAds = getValue(remoteConfig, "show_ads").asBoolean();
        const unitId = getValue(remoteConfig, "ad_unit_id").asString();
        
        setAdSettings({ show: showAds, unitId: unitId });

        if (showAds && window.googletag) {
          window.googletag.cmd.push(function() {
            // تنظيف أي إعلان قديم في نفس المكان قبل الرسم الجديد
            document.getElementById('div-gpt-ad').innerHTML = '';
            
            window.googletag.defineSlot(unitId, [320, 50], 'div-gpt-ad')
                     .addService(window.googletag.pubads());
            window.googletag.enableServices();
            window.googletag.display('div-gpt-ad');
          });
        }
      } catch (e) {
        console.log("AdMob Config Error:", e);
      }
    };

    loadAd();
  }, []);

  // لو فيربيس قافل الإعلانات مش هيعرض الـ div أصلاً
  if (!adSettings.show) return null;

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0', minHeight: '50px', width: '100%' }}>
      <div id="div-gpt-ad" style={{ width: '320px', height: '50px', background: '#f9f9f9' }}>
        {/* سيظهر الإعلان هنا */}
      </div>
    </div>
  );
};

export default AdBanner;
