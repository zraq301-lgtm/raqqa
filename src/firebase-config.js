import { initializeApp } from "firebase/app";
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

// تهيئة تطبيق فيربيس
const app = initializeApp(firebaseConfig);

// التصدير للاستخدام في المشروع
export const db = getFirestore(app); 
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null; 

// --- إعداد Remote Config ---
export const remoteConfig = typeof window !== "undefined" ? getRemoteConfig(app) : null;

if (remoteConfig) {
  // تم ضبط القيمة على 0 لرؤية النتائج فوراً عند تغييرها من لوحة التحكم
  remoteConfig.settings.minimumFetchIntervalMillis = 0;
  
  // وضع قيم افتراضية للتطبيق في حال لم يتوفر إنترنت
  remoteConfig.defaultConfig = {
    "app_name": "رقة",
    "theme_color": "#FFC0CB"
  };
}

// دالة جلب الإعدادات عن بعد وتطبيقها على واجهة التطبيق
export const applyRemoteSettings = async () => {
  if (!remoteConfig) return;
  try {
    // جلب القيم من السحابة وتفعيلها
    await fetchAndActivate(remoteConfig);
    
    const appName = getString(remoteConfig, "app_name");
    const themeColor = getString(remoteConfig, "theme_color");

    // تغيير عنوان التبويب في المتصفح تلقائياً
    if (appName) document.title = appName;

    // تطبيق اللون المختار على متغير CSS ليتغير شكل التطبيق بالكامل
    if (themeColor) {
      document.documentElement.style.setProperty('--main-theme-color', themeColor);
      console.log("تم تحديث لون الثيم إلى:", themeColor);
    }
  } catch (err) {
    console.error("خطأ في جلب إعدادات Remote Config:", err);
  }
};

// --- إعدادات الإشعارات (Firebase Messaging) ---
const messaging = typeof window !== "undefined" ? getMessaging(app) : null;

export const requestForToken = async () => {
  if (!messaging) return null;
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
    console.error("خطأ في جلب توكن الإشعارات:", err);
  }
  return null;
};

// الاستماع للإشعارات أثناء فتح التطبيق
export const onMessageListener = () =>
  new Promise((resolve) => {
    if (!messaging) return;
    onMessage(messaging, (payload) => {
      console.log("وصل إشعار جديد:", payload);
      resolve(payload);
    });
  });

export default app;
