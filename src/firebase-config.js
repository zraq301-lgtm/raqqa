import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { getAnalytics } from "firebase/analytics"; 
import { getFirestore } from "firebase/firestore";
// --- إضافة استيراد Remote Config ---
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

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app); 
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null; 

// --- تفعيل Remote Config ---
export const remoteConfig = typeof window !== "undefined" ? getRemoteConfig(app) : null;

if (remoteConfig) {
  // ضبط وقت التحديث (ساعة واحدة) أو اجعلها 0 أثناء التجربة لرؤية النتائج فوراً
  remoteConfig.settings.minimumFetchIntervalMillis = 3600000;
}

// دالة لجلب القيم وتطبيقها (يمكنك استدعاؤها في App.jsx)
export const applyRemoteSettings = async () => {
  if (!remoteConfig) return;
  try {
    await fetchAndActivate(remoteConfig);
    const appName = getString(remoteConfig, "app_name");
    const themeColor = getString(remoteConfig, "theme_color");

    if (appName) document.title = appName;
    if (themeColor) {
      // تطبيق اللون على المتغيرات التي تستخدمها في ستايل الـ Glassmorphism
      document.documentElement.style.setProperty('--main-theme-color', themeColor);
    }
  } catch (err) {
    console.error("Remote Config Error:", err);
  }
};

const messaging = getMessaging(app);

export const requestForToken = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const currentToken = await getToken(messaging, { 
        vapidKey: "USA0sr7ibILdXx1IdNyUIZGNAZxosK9trp5z96f45Nk" 
      });
      
      if (currentToken) {
        console.log("تم توليد التوكن بنجاح:", currentToken);
        return currentToken;
      }
    }
  } catch (err) {
    console.error("خطأ في جلب التوكن:", err);
  }
  return null;
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log("وصل إشعار جديد:", payload);
      resolve(payload);
    });
  });

export default app;
