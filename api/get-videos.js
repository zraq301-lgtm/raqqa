import admin from 'firebase-admin';

// 1. معالجة المفتاح الخاص بنفس طريقتك الناجحة
const rawKey = process.env.FIREBASE_PRIVATE_KEY;
const formattedKey = rawKey 
  ? rawKey.replace(/\\n/g, '\n').replace(/^"(.*)"$/, '$1').trim() 
  : undefined;

const serviceAccount = {
  "type": "service_account",
  "project_id": "raqqa-43dc8",
  "client_email": "firebase-adminsdk-fbsvc@raqqa-43dc8.iam.gserviceaccount.com",
  "private_key": formattedKey,
};

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } catch (initError) {
    console.error('❌ Firebase Init Error:', initError.message);
  }
}

const db = admin.firestore();

export default async function handler(req, res) {
  // نستخدم GET لجلب البيانات
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' });

  try {
    if (!formattedKey) {
      throw new Error("FIREBASE_PRIVATE_KEY is missing in Vercel environment.");
    }

    // جلب البيانات من مجموعة فيديوهاتك
    const snapshot = await db.collection('videos').get();
    
    const videos = snapshot.docs.map(doc => {
      const data = doc.data();
      let finalThumbnail = data.image; // إذا كنت وضعت حقل صورة (image) في فيربيس

      // إذا لم توجد صورة يدوية، نستخرج صورة اليوتيوب تلقائياً من الرابط
      if (!finalThumbnail && data.url) {
        const videoId = data.url.split('v=')[1]?.split('&')[0] || data.url.split('/').pop();
        finalThumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      }

      return {
        id: doc.id,
        title: data.title || "بدون عنوان",
        url: data.url || "",
        category: data.category || "عام",
        thumbnail: finalThumbnail
      };
    });

    return res.status(200).json(videos);

  } catch (error) {
    console.error('❌ Fetch Error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
}
