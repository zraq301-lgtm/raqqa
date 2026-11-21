import React, { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import {
  AdMob,
  AdmobConsentStatus,
  BannerAdPosition,
  BannerAdSize,
  MaxAdContentRating,
} from '@capacitor-community/admob';
import { fetchAndActivate, getBoolean, getString } from 'firebase/remote-config';
import { remoteConfig } from '../firebase-config';

const PRODUCTION_BANNER_ID = 'ca-app-pub-8025494804759906/6335462769';
const GOOGLE_TEST_BANNER_ID = 'ca-app-pub-3940256099942544/6300978111';
const IS_TEST_BUILD = import.meta.env.VITE_ADMOB_TEST_MODE === 'true';

// App.jsx and Swing.jsx both include AdBanner. Keep one native banner per app session.
let nativeBannerPromise;

async function showAndroidBanner(adUnitId) {
  if (nativeBannerPromise) return nativeBannerPromise;

  nativeBannerPromise = (async () => {
    await AdMob.initialize({ maxAdContentRating: MaxAdContentRating.General });

    let consent = await AdMob.requestConsentInfo();
    if (
      consent.status === AdmobConsentStatus.REQUIRED &&
      consent.isConsentFormAvailable
    ) {
      consent = await AdMob.showConsentForm();
    }

    // Fail closed: do not request ads while consent is unknown or still required.
    if (
      consent.status !== AdmobConsentStatus.NOT_REQUIRED &&
      consent.status !== AdmobConsentStatus.OBTAINED
    ) {
      return false;
    }

    await AdMob.showBanner({
      adId: adUnitId,
      adSize: BannerAdSize.ADAPTIVE_BANNER,
      position: BannerAdPosition.TOP_CENTER,
      margin: 80,
      isTesting: IS_TEST_BUILD,
    });
    return true;
  })().catch((error) => {
    nativeBannerPromise = undefined;
    console.error('AdMob initialization or banner request failed:', error);
    return false;
  });

  return nativeBannerPromise;
}

const AdBanner = ({ slotId = 'div-gpt-ad-main' }) => {
  const [webAdVisible, setWebAdVisible] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const initAd = async () => {
      try {
        if (remoteConfig) await fetchAndActivate(remoteConfig);
        const adsEnabled = remoteConfig
          ? getBoolean(remoteConfig, 'enable_ads')
          : false;
        if (!adsEnabled || cancelled) return;

        const configuredId = remoteConfig
          ? getString(remoteConfig, 'admob_banner_id').trim()
          : '';
        const adUnitId = IS_TEST_BUILD
          ? GOOGLE_TEST_BANNER_ID
          : configuredId || PRODUCTION_BANNER_ID;

        if (Capacitor.getPlatform() === 'android') {
          await showAndroidBanner(adUnitId);
          return;
        }

        // GPT web slots use /network-code/ad-unit paths, not AdMob ca-app-pub IDs.
        // Do not send an AdMob unit ID to GPT from the browser build.
        const gptSlotId = remoteConfig
          ? getString(remoteConfig, 'gpt_web_slot_id').trim()
          : '';
        if (!gptSlotId || !gptSlotId.startsWith('/') || !window.googletag) return;

        window.googletag.cmd.push(() => {
          const container = document.getElementById(slotId);
          if (!container || cancelled) return;
          container.replaceChildren();
          window.googletag.defineSlot(gptSlotId, [320, 50], slotId)
            ?.addService(window.googletag.pubads());
          window.googletag.enableServices();
          window.googletag.display(slotId);
          if (!cancelled) setWebAdVisible(true);
        });
      } catch (error) {
        console.error('Ad initialization failed:', error);
      }
    };

    initAd();
    return () => {
      cancelled = true;
    };
  }, [slotId]);

  if (Capacitor.getPlatform() === 'android') return null;
  if (!webAdVisible) return null;

  return (
    <div
      className="global-ad-wrapper"
      style={{ display: 'flex', justifyContent: 'center', margin: '10px 0', width: '100%', minHeight: '50px' }}
    >
      <div id={slotId} style={{ width: '320px', height: '50px' }} />
    </div>
  );
};

export default AdBanner;
