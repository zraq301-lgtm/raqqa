import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

// 1. إعداد فيربيس باستخدام المتغيرات البيئية المنفصلة
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  // معالجة علامات السطر الجديد في المفتاح الخاص لضمان عمله في فيرسل
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
  if (req.method !== 'POST' && req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    // 2. تحديد النطاق الزمني (يوم ماضي ويوم مستقبلي) - نفس المنطق الأصلي
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    // 3. جلب البيانات من Firestore
    const notificationsRef = db.collection('notifications');
    const snapshot = await notificationsRef
      .where('scheduled_for', '>=', Timestamp.fromDate(yesterday))
      .where('scheduled_for', '<=', Timestamp.fromDate(tomorrow))
      .where('is_sent', '==', false)
      .limit(5)
      .get();

    if (snapshot.empty) {
      return res.status(200).json({ message: "لا توجد بيانات للمعالجة حالياً." });
    }

    const results = [];

    for (const doc of snapshot.docs) {
      const record = { id: doc.id, ...doc.data() };

      // 4. منطق الذكاء الاصطناعي (Raqqa AI)
      const aiPrompt = `اكتب نص إشعار قصير ومحفز لفئة ${record.category}. العنوان الأصلي: ${record.title}. المحتوى: ${record.body}`;

      const aiResponse = await fetch('https://raqqa-v6cd.vercel.app/api/raqqa-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt })
      });
      const aiData = await aiResponse.json();
      const smartBody = aiData.text || record.body;

      // 5. إرسال الإشعار عبر FCM
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

      // 6. التحديث في فيربيس (تغيير الحالة إلى "تم الإرسال")
      await notificationsRef.doc(record.id).update({
        is_sent: true,
        sent_at: Timestamp.now()
      });

      results.push({ id: record.id, status: 'Sent', ai_text: smartBody });
    }

    return res.status(200).json({
      success: true,
      processed_count: results.length,
      details: results
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
}
