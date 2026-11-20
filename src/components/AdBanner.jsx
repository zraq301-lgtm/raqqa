import React, { useEffect, useState } from 'react';
import { fetchAdsConfig, getAdsProviderUnit, isPlacementEnabled } from '../services/adsConfig';

const getPlatform = () => {
  if (/android/i.test(navigator.userAgent)) return 'android';
  if (/iphone|ipad|ipod/i.test(navigator.userAgent)) return 'ios';
  return 'web';
};

const AdBanner = ({ slotId = 'div-gpt-ad-main', placement = 'banner' }) => {
  const [adConfig, setAdConfig] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchAdsConfig({
      platform: getPlatform(),
      appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
      userState: 'guest'
    }).then((config) => {
      if (!cancelled) setAdConfig(config);
    }).catch((error) => console.warn('Dynamic ads config unavailable:', error));
    return () => { cancelled = true; };
  }, [placement]);

  useEffect(() => {
    if (!isPlacementEnabled(adConfig, placement)) return;
    const unitId = getAdsProviderUnit(adConfig, placement);
    if (!unitId || !window.googletag) return;
    window.googletag.cmd.push(() => {
      const container = document.getElementById(slotId);
      if (!container) return;
      container.innerHTML = '';
      window.googletag.defineSlot(unitId, [320, 50], slotId)?.addService(window.googletag.pubads());
      window.googletag.enableServices();
      window.googletag.display(slotId);
    });
  }, [adConfig, placement, slotId]);

  if (!isPlacementEnabled(adConfig, placement)) return null;

  return (
    <div className="global-ad-wrapper" style={{ display: 'flex', justifyContent: 'center', margin: '10px 0', width: '100%', minHeight: '50px' }}>
      <div id={slotId} style={{ width: '320px', height: '50px', backgroundColor: 'transparent', border: 'none' }} />
    </div>
  );
};

export default AdBanner;
