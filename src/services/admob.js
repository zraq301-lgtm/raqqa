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
  android: 'ca-app-pub-8025494804759906/1052136793',
  ios: '',
};

// Android units supplied for the Raqqa AdMob app.
export const ANDROID_AD_UNIT_IDS = Object.freeze({
  banner: 'ca-app-pub-8025494804759906/1052136793',
  interstitial: 'ca-app-pub-8025494804759906/3762060617',
  native: 'ca-app-pub-8025494804759906/3215265709',
  rewarded: 'ca-app-pub-8025494804759906/6399385137',
  rewarded_interstitial: 'ca-app-pub-8025494804759906/6096132800',
});

const IOS_TEST_AD_UNIT_IDS = Object.freeze({
  banner: 'ca-app-pub-3940256099942544/2934735716',
  interstitial: 'ca-app-pub-3940256099942544/4411468910',
  rewarded: 'ca-app-pub-3940256099942544/1712485313',
  rewarded_interstitial: 'ca-app-pub-3940256099942544/6978759866',
});

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

export function getAdMobUnitId(type = 'banner') {
  const platform = nativePlatform();
  if (platform === 'android') return ANDROID_AD_UNIT_IDS[type] || ANDROID_AD_UNIT_IDS.banner;
  if (platform === 'ios') return IOS_TEST_AD_UNIT_IDS[type] || IOS_TEST_AD_UNIT_IDS.banner;
  return '';
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

export async function prepareInterstitial() {
  const platform = nativePlatform();
  if (!platform) return;
  await initializeAdMob();
  return AdMob.prepareInterstitial({
    adId: getAdMobUnitId('interstitial'),
    isTesting: isTestingPlatform(platform),
  });
}

export async function showInterstitial() {
  if (!nativePlatform()) return;
  await AdMob.showInterstitial();
}

export async function prepareRewarded() {
  const platform = nativePlatform();
  if (!platform) return;
  await initializeAdMob();
  return AdMob.prepareRewardVideoAd({
    adId: getAdMobUnitId('rewarded'),
    isTesting: isTestingPlatform(platform),
  });
}

export async function showRewarded() {
  if (!nativePlatform()) return null;
  return AdMob.showRewardVideoAd();
}

export async function prepareRewardedInterstitial() {
  const platform = nativePlatform();
  if (!platform) return;
  await initializeAdMob();
  return AdMob.prepareRewardInterstitialAd({
    adId: getAdMobUnitId('rewarded_interstitial'),
    isTesting: isTestingPlatform(platform),
  });
}

export async function showRewardedInterstitial() {
  if (!nativePlatform()) return null;
  return AdMob.showRewardInterstitialAd();
}

export function getAdMobMode() {
  const platform = nativePlatform();
  return platform && isTestingPlatform(platform) ? 'test' : 'production';
}
