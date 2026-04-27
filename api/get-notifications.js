import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

// 1. إعداد الاتصال بفيربيس باستخدام المفاتيح المنفصلة
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  // معالجة مفتاح الخصوصية لضمان قراءة الأسطر الجديدة بشكل صحيح في فيرسل
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount)
  });
}

const db = getFirestore();

export default async function handler(req, res) {
  // السماح بـ GET و POST كما في منطقك السابق
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const notificationsRef = db.collection('notifications');

    // --- وظيفة الحذف التلقائي (Cleanup) ---
    // حذف الإشعارات المرسلة أو التي مر عليها أكثر من يومين
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() - 2);

    const oldDocs = await notificationsRef
      .where('is_sent', '==', true)
      .get();
    
    const expiredDocs = await notificationsRef
      .where('scheduled_for', '<', Timestamp.fromDate(expirationDate))
      .get();

    // تنفيذ الحذف (Batch Delete)
    const batch = db.batch();
    oldDocs.forEach(doc => batch.delete(doc.ref));
    expiredDocs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    // --------------------------------------

    // 1. ضبط توقيت الجلب (يوم ماضي ويوم مستقبلي)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    // 2. جلب الإشعارات المجدولة (نفس المنطق الأصلي)
    const snapshot = await notificationsRef
      .where('scheduled_for', '>=', Timestamp.fromDate(yesterday))
      .where('scheduled_for', '<=', Timestamp.fromDate(tomorrow))
      .where('is_sent', '==', false)
      .limit(10)
      .get();

    if (snapshot.empty) {
      return res.status(200).json({ success: true, message: "لا توجد بيانات بانتظار المعالجة." });
    }

    const processedResults = [];

    for (const doc of snapshot.docs) {
      const record = { id: doc.id, ...doc.data() };

      // 3. صياغة طلب للذكاء الاصطناعي (Raqqa AI)
      const aiPrompt = `بصفتك مساعداً ذكياً، حسن هذا الإشعار لفئة ${record.category}. العنوان: ${record.title}. النص: ${record.body}`;

      let smartBody = record.body;
      try {
        const aiResponse = await fetch('https://raqqa-v6cd.vercel.app/api/raqqa-ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: aiPrompt })
        });
        const aiData = await aiResponse.json();
        if (aiData.text) smartBody = aiData.text;
      } catch (aiErr) {
        console.error("AI API Error, using original body.");
      }

      // 4. إرسال الإشعار عبر خدمة FCM
      await fetch('https://raqqa-hjl8.vercel.app/api/send-fcm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: record.fcm_token,
          title: record.title,
          body: smartBody,
          data: record.extra_data
        })
      });

      // 5. تحديث حالة الوثيقة في فيربيس (UPDATE)
      await notificationsRef.doc(record.id).update({
        is_sent: true,
        sent_at: Timestamp.now()
      });

      processedResults.push({ id: record.id, status: 'Sent', updated_content: smartBody });
    }

    return res.status(200).json({
      success: true,
      count: processedResults.length,
      data: processedResults
    });

  } catch (error) {
    console.error('❌ Firestore/Server Error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
}
