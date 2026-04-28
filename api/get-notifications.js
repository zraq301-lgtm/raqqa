import admin from 'firebase-admin';

// 1. إعدادات المفتاح والبيانات (نفس طريقتك الناجحة)
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
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  } catch (initError) {
    console.error('❌ Firebase Init Error:', initError.message);
  }
}

const db = admin.firestore();

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const notificationsRef = db.collection('notifications');

    // --- 2. جلب الإشعارات غير المرسلة ---
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const snapshot = await notificationsRef
      .where('scheduled_for', '>=', admin.firestore.Timestamp.fromDate(yesterday))
      .where('scheduled_for', '<=', admin.firestore.Timestamp.fromDate(tomorrow))
      .where('is_sent', '==', false)
      .limit(5) 
      .get();

    if (snapshot.empty) return res.status(200).json({ success: true, message: "لا توجد إشعارات حالياً" });

    const results = [];

    for (const doc of snapshot.docs) {
      const record = { id: doc.id, ...doc.data() };

      // --- 3. استدعاء API الذكاء الاصطناعي الخاص بك لتوليد النص ---
      let aiText = record.body;
      try {
        const aiResponse = await fetch('https://raqqa-v6cd.vercel.app/api/raqqa-ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            prompt: `اكتب إشعاراً قصيراً ومحفزاً جداً باللغة العربية بأسلوب رقيق. الفئة: ${record.category}. العنوان: ${record.title}. النص الأصلي: ${record.body}` 
          })
        });
        const aiData = await aiResponse.json();
        if (aiData.text) aiText = aiData.text;
      } catch (e) { console.error("AI Error, using default body"); }

      // --- 4. اختيار صورة مخصصة بناءً على الفئة ---
      // نفترض أن الصور مرفوعة في مجلد assets بتطبيقك بنفس اسم الفئة
      const imageUrl = `https://raqqa-hjl8.vercel.app/assets/notifications/${record.category || 'general'}.png`;

      // --- 5. إرسال الإشعار النهائي عبر FCM ---
      await fetch('https://raqqa-hjl8.vercel.app/api/send-fcm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: record.fcm_token,
          title: record.title,
          body: aiText,
          image: imageUrl, // الصورة المخصصة
          data: { ...record.extra_data, category: record.category }
        })
      });

      // --- 6. تحديث الحالة لعدم التكرار ---
      await notificationsRef.doc(record.id).update({
        is_sent: true,
        sent_at: admin.firestore.Timestamp.now(),
        final_ai_text: aiText // حفظ النص الذي كتبه الذكاء للاطلاع عليه لاحقاً
      });

      results.push({ id: record.id, status: 'Sent' });
    }

    return res.status(200).json({ success: true, processed: results.length });

  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
