import React, { useEffect, useState } from 'react';
import { remoteConfig } from '../firebase-config'; // تأكد أن المسار لنفس مجلد الملف
import { getValue } from "firebase/remote-config";

const AdBanner = () => {
  const [adSettings, setAdSettings] = useState({ show: false, unitId: '' });

  useEffect(() => {
    try {
      // جلب الإعدادات من فيربيس
      const showAds = getValue(remoteConfig, "show_ads").asBoolean();
      const unitId = getValue(remoteConfig, "ad_unit_id").asString();
      
      setAdSettings({ show: showAds, unitId: unitId });

      if (showAds && window.googletag) {
        window.googletag.cmd.push(function() {
          // عرض الإعلان في الحاوية المخصصة
          window.googletag.defineSlot(unitId, [320, 50], 'div-gpt-ad')
                   .addService(window.googletag.pubads());
          window.googletag.enableServices();
          window.googletag.display('div-gpt-ad');
        });
      }
    } catch (e) {
      console.log("AdMob Config Error:", e);
    }
  }, []);

  if (!adSettings.show) return null;

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0', minHeight: '50px' }}>
      <div id="div-gpt-ad" style={{ width: '320px', height: '50px' }}></div>
    </div>
  );
};

export default AdBanner; // السطر ده هو اللي كان ناقص أو فيه مشكلة
