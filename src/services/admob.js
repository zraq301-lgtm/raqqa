import { Capacitor } from '@capacitor/core';
import {
  AdMob,
  BannerAdPosition,
  BannerAdSize,
} from '@capacitor-community/admob';

const TEST_IDS = {
  android: 'ca-app-pub-3940256099942544/6300978111',
  ios: 'ca-app-pub-3940256099942544/2934735716',
};

const PRODUCTION_IDS = {
  android: 'ca-app-pub-8025494804759906/8190290599',
  ios: '',
};

let initialized = false;
let visibleConsumers = 0;

function nativePlatform() {
  const platform = Capacitor.getPlatform();
  return platform === 'android' || platform === 'ios' ? platform : null;
}

function configuredAdUnitId(platform) {
  const configured = platform === 'android'
    ? import.meta.env.VITE_ADMOB_ANDROID_BANNER_ID
    : import.meta.env.VITE_ADMOB_IOS_BANNER_ID;
  // iOS remains on Google's test ID until the owner supplies its production ID.
  return configured || PRODUCTION_IDS[platform] || TEST_IDS[platform];
}

function isTestingPlatform(platform) {
  const explicit = import.meta.env.VITE_ADMOB_TEST_MODE;
  if (explicit !== undefined) return explicit !== 'false';
  return !PRODUCTION_IDS[platform];
}

export function isNativeAdMobPlatform() {
  return Boolean(nativePlatform());
}

export async function initializeAdMob() {
  const platform = nativePlatform();
  if (!platform || initialized) return;
  await AdMob.initialize({
    initializeForTesting: isTestingPlatform(platform),
    maxAdContentRating: 'MA',
  });
  initialized = true;
}

export async function showNativeBanner() {
  const platform = nativePlatform();
  if (!platform) return;

  visibleConsumers += 1;
  if (visibleConsumers > 1) return;

  await initializeAdMob();
  await AdMob.showBanner({
    adId: configuredAdUnitId(platform),
    adSize: BannerAdSize.ADAPTIVE_BANNER,
    position: BannerAdPosition.BOTTOM_CENTER,
    margin: 0,
    isTesting: isTestingPlatform(platform),
  });
}

export async function hideNativeBanner() {
  if (!nativePlatform()) return;
  visibleConsumers = Math.max(0, visibleConsumers - 1);
  if (visibleConsumers === 0) await AdMob.hideBanner();
}

export function getAdMobMode() {
  const platform = nativePlatform();
  return platform && isTestingPlatform(platform) ? 'test' : 'production';
}
