import { initializeApp } from "firebase/app";
import { getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getRemoteConfig, fetchAndActivate, getString } from "firebase/remote-config";

const firebaseConfig = {
  apiKey: "AIzaSyCT2wRZgzPv1Xg3M41ZhN7-_RGze_HrZkk",
  authDomain: "raqqa-43dc8.firebaseapp.com",
  projectId: "raqqa-43dc8",
  storageBucket: "raqqa-43dc8.firebasestorage.app",
  messagingSenderId: "162488255991",
  appId: "1:162488255991:web:74fe1680fc6cb5bbc61af2",
  measurementId: "G-QLKV71T66E"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;
export const remoteConfig = typeof window !== "undefined" ? getRemoteConfig(app) : null;

if (remoteConfig) {
  remoteConfig.settings.minimumFetchIntervalMillis = 0;
  remoteConfig.defaultConfig = {
    app_name: "رقة",
    theme_color: "#FFC0CB"
  };
}

export const applyRemoteSettings = async () => {
  if (!remoteConfig) return {};
  try {
    await fetchAndActivate(remoteConfig);
    const appName = getString(remoteConfig, "app_name");
    const themeColor = getString(remoteConfig, "theme_color");
    if (appName) document.title = appName;
    if (themeColor) document.documentElement.style.setProperty('--main-theme-color', themeColor);
    return { appName, themeColor };
  } catch (err) {
    console.error("خطأ في جلب إعدادات Remote Config:", err);
    return {};
  }
};

const messaging = typeof window !== "undefined" ? getMessaging(app) : null;

export const requestForToken = async () => {
  if (!messaging) return null;
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const currentToken = await getToken(messaging, { vapidKey: "USA0sr7ibILdXx1IdNyUIZGNAZxosK9trp5z96af45Nk" });
      if (currentToken) return currentToken;
    }
  } catch (err) {
    console.error("خطأ في جلب توكن الإشعارات:", err);
  }
  return null;
};

export const onMessageListener = () => new Promise((resolve) => {
  if (!messaging) return;
  onMessage(messaging, (payload) => resolve(payload));
});

export default app;
