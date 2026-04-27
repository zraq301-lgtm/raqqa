import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { getAnalytics } from "firebase/analytics"; 
import { getFirestore } from "firebase/firestore";

// الإعدادات شاملة الـ Measurement ID لتفعيل الإعلانات
const firebaseConfig = {
  apiKey: "AIzaSyCT2wRZgzPv1Xg3M41ZhN7-_RGze_HrZkk",
  authDomain: "raqqa-43dc8.firebaseapp.com",
  projectId: "raqqa-43dc8",
  storageBucket: "raqqa-43dc8.firebasestorage.app",
  messagingSenderId: "162488255991",
  appId: "1:162488255991:web:74fe1680fc6cb5bbc61af2",
  measurementId: "G-QLKV71T66E" 
};

// تهيئة Firebase مرة واحدة فقط لكل الخدمات
const app = initializeApp(firebaseConfig);

// 1. تفعيل قاعدة البيانات (Firestore) لجلب الفيديوهات
export const db = getFirestore(app); 

// 2. تفعيل التحليلات (Analytics) لربط إعلانات جوجل
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null; 

// 3. تفعيل الإشعارات (Messaging)
const messaging = getMessaging(app);

// دالة طلب التوكن للإشعارات (كما هي لديك)
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

// الاستماع للإشعارات
export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log("وصل إشعار جديد:", payload);
      resolve(payload);
    });
  });

export default app;
