import React, { useEffect, useState } from 'react';
import { remoteConfig } from '../firebase-config'; 
import { getValue, fetchAndActivate } from "firebase/remote-config";

/**
 * مكون الإعلانات الديناميكي
 * @param {string} slotId - معرف فريد للحاوية (يجب أن يكون مختلفاً لكل إعلان في نفس الصفحة)
 * @param {string} configName - اسم المتغير في فيربيس الذي يحتوي على كود الإعلان
 * @param {string} showConfigName - اسم المتغير في فيربيس المسؤول عن إظهار/إخفاء الإعلان
 */
const AdBanner = ({ 
  slotId = 'div-gpt-ad-main', 
  configName = 'ad_unit_id', 
  showConfigName = 'show_ads' 
}) => {
  const [adSettings, setAdSettings] = useState({ show: false, unitId: '' });

  useEffect(() => {
    const initAd = async () => {
      try {
        // 1. جلب الإعدادات من فيربيس
        await fetchAndActivate(remoteConfig);
        const firebaseShow = getValue(remoteConfig, showConfigName).asBoolean();
        const firebaseUnitId = getValue(remoteConfig, configName).asString();
        
        setAdSettings({ show: firebaseShow, unitId: firebaseUnitId });

        // 2. تشغيل إعلانات جوجل إذا كان مفعلًا
        if (firebaseShow && firebaseUnitId && window.googletag) {
          window.googletag.cmd.push(function() {
            const container = document.getElementById(slotId);
            if (container) container.innerHTML = '';

            // تعريف المساحة الإعلانية (يدعم الحجم القياسي للموبايل 320x50)
            window.googletag.defineSlot(firebaseUnitId, [320, 50], slotId)
                     .addService(window.googletag.pubads());
            
            window.googletag.enableServices();
            window.googletag.display(slotId);
          });
        }
      } catch (e) {
        console.error(`AdMob Error (${configName}):`, e);
      }
    };

    initAd();
  }, [slotId, configName, showConfigName]);

  if (!adSettings.show) return null;

  return (
    <div className="global-ad-wrapper" style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      margin: '10px 0', 
      width: '100%',
      minHeight: '50px'
    }}>
      <div id={slotId} style={{ 
        width: '320px', 
        height: '50px', 
        backgroundColor: 'transparent', 
        border: 'none' 
      }}>
        {/* ملاحظة: سيتم رسم الإعلان هنا بواسطة مكتبة جوجل */}
      </div>
    </div>
  );
};

export default AdBanner;
