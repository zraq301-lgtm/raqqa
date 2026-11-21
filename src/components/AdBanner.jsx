import React, { useEffect, useRef, useState } from 'react';
import { fetchAdsConfig, isPlacementEnabled } from '../services/adsConfig';
import {
  getAdMobMode,
  hideNativeBanner,
  isNativeAdMobPlatform,
  showNativeBanner,
} from '../services/admob';

const AdBanner = ({ placement = 'banner' }) => {
  const [adConfig, setAdConfig] = useState(null);
  const startedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    fetchAdsConfig({
      platform: /android/i.test(navigator.userAgent) ? 'android' : /iphone|ipad|ipod/i.test(navigator.userAgent) ? 'ios' : 'web',
      appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
      userState: 'guest',
    })
      .then((config) => {
        if (!cancelled) setAdConfig(config);
      })
      .catch((error) => console.warn('Dynamic ads config unavailable:', error));
    return () => { cancelled = true; };
  }, [placement]);

  useEffect(() => {
    if (!isNativeAdMobPlatform()) return undefined;
    // A missing remote config is allowed during local/native setup. If a config is
    // returned, its placement switch remains authoritative.
    if (adConfig && !isPlacementEnabled(adConfig, placement)) return undefined;

    let cancelled = false;
    showNativeBanner()
      .then(() => {
        if (!cancelled) startedRef.current = true;
      })
      .catch((error) => console.warn('AdMob banner unavailable:', error));

    return () => {
      cancelled = true;
      if (startedRef.current) {
        startedRef.current = false;
        hideNativeBanner().catch((error) => console.warn('AdMob banner hide failed:', error));
      }
    };
  }, [adConfig, placement]);

  if (!isNativeAdMobPlatform()) return null;
  if (adConfig && !isPlacementEnabled(adConfig, placement)) return null;

  return (
    <div
      className="native-admob-banner-slot"
      aria-label="إعلان"
      data-admob-mode={getAdMobMode()}
      style={{ minHeight: '50px', width: '100%' }}
    />
  );
};

export default AdBanner;
