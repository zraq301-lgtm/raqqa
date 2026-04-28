import admin from 'firebase-admin';

// 1. معالجة المفتاح الخاص بنفس الطريقة الناجحة تماماً
const rawKey = process.env.FIREBASE_PRIVATE_KEY;
const formattedKey = rawKey 
  ? rawKey.replace(/\\n/g, '\n').replace(/^"(.*)"$/, '$1').trim() 
  : undefined;

// استخدام نفس البيانات التي ضمنت نجاح كود الحفظ والدفع
const serviceAccount = {
  "type": "service_account",
  "project_id": "raqqa-43dc8",
  "client_email": "firebase-adminsdk-fbsvc@raqqa-43dc8.iam.gserviceaccount.com",
  "private_key": formattedKey,
};

// تهيئة Firebase Admin مرة واحدة فقط
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
  // السماح بـ GET و POST (مناسب للـ Cron Jobs)
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const notificationsRef = db.collection('notifications');

    // --- وظيفة الحذف التلقائي (Cleanup) لضمان عدم تراكم البيانات ---
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() - 2);

    const oldDocs = await notificationsRef.where('is_sent', '==', true).get();
    const expiredDocs = await notificationsRef.where('scheduled_for', '<', admin.firestore.Timestamp.fromDate(expirationDate)).get();

    const batch = db.batch();
    oldDocs.forEach(doc => batch.delete(doc.ref));
    expiredDocs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();

    // --- 1. ضبط توقيت الجلب (نفس المنطق الأصلي) ---
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    // --- 2. جلب الإشعارات التي لم تُرسل بعد في هذا النطاق ---
    const snapshot = await notificationsRef
      .where('scheduled_for', '>=', admin.firestore.Timestamp.fromDate(yesterday))
      .where('scheduled_for', '<=', admin.firestore.Timestamp.fromDate(tomorrow))
      .where('is_sent', '==', false)
      .limit(5) // معالجة 5 في كل مرة لتجنب انتهاء وقت دالة Vercel
      .get();

    if (snapshot.empty) {
      return res.status(200).json({ success: true, message: "لا توجد إشعارات بانتظار المعالجة حالياً." });
    }

    const processedResults = [];

    for (const doc of snapshot.docs) {
      const record = { id: doc.id, ...doc.data() };

      // --- 3. استدعاء الذكاء الاصطناعي (Raqqa AI) لتحسين النص ---
      let smartBody = record.body;
      try {
        const aiResponse = await fetch('https://raqqa-v6cd.vercel.app/api/raqqa-ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            prompt: `بصفتك مساعداً ذكياً، حسن هذا الإشعار لفئة ${record.category}. العنوان: ${record.title}. النص: ${record.body}` 
          })
        });
        const aiData = await aiResponse.json();
        if (aiData.text) smartBody = aiData.text;
      } catch (aiErr) {
        console.error("AI API Error, using original body.");
      }

      // --- 4. إرسال الإشعار الفعلي عبر خدمة FCM ---
      await fetch('https://raqqa-hjl8.vercel.app/api/send-fcm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: record.fcm_token,
          title: record.title,
          body: smartBody,
          category: record.category,
          extra_data: record.extra_data
        })
      });

      // --- 5. تحديث حالة الوثيقة في فيربيس لعدم تكرارها ---
      await notificationsRef.doc(record.id).update({
        is_sent: true,
        sent_at: admin.firestore.Timestamp.now()
      });

      processedResults.push({ id: record.id, status: 'Sent', ai_text: smartBody });
    }

    return res.status(200).json({
      success: true,
      processed_count: processedResults.length,
      data: processedResults
    });

  } catch (error) {
    console.error('❌ Fetch/Process Error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
}
