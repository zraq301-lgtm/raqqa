import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

// دالة التهيئة (نفس التي تعمل معك في كود الإرسال)
const getFirebaseAdmin = () => {
  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };

  if (!serviceAccount.projectId) throw new Error('FIREBASE_PROJECT_ID is missing');

  if (getApps().length === 0) {
    return initializeApp({ credential: cert(serviceAccount) });
  }
  return getApps()[0];
};

export default async function handler(req, res) {
  // الحفظ يتطلب دائماً POST لاستقبال البيانات
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    getFirebaseAdmin();
    const db = getFirestore();

    // 1. استلام البيانات من واجهة تطبيق "رقة"
    const { title, body, category, fcm_token, scheduled_for, extra_data } = req.body;

    // فحص البيانات الأساسية قبل الحفظ
    if (!title || !fcm_token) {
      return res.status(400).json({ error: 'العنوان ورمز الجهاز (Token) مطلوبان.' });
    }

    // 2. الحفظ في مجموعة "notifications"
    const docRef = await db.collection('notifications').add({
      title,
      body: body || '',
      category: category || 'General',
      fcm_token,
      extra_data: extra_data || {},
      is_sent: false, // الحالة الافتراضية عند الحفظ
      // تحويل التاريخ القادم من الواجهة إلى صيغة Timestamp
      scheduled_for: scheduled_for ? Timestamp.fromDate(new Date(scheduled_for)) : Timestamp.now(),
      created_at: Timestamp.now()
    });

    return res.status(200).json({
      success: true,
      message: "تم جدولة الإشعار بنجاح في فيربيس",
      id: docRef.id
    });

  } catch (error) {
    console.error('❌ Save Error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
}
