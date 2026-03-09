// استيراد مكتبة فيربيس الرسمية (تأكد من وجودها في package.json)
const admin = require('firebase-admin');

// هذا الكائن يحتوي على كل المفاتيح المطلوبة في مكان واحد
// يمكنك الحصول على هذه البيانات من ملف الـ JSON الذي حملناه سابقاً
const serviceAccount = {
  "type": "service_account",
  "project_id": "raqqa-xxxx", 
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEv...YOUR_KEY... \n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@raqqa-xxxx.iam.gserviceaccount.com",
};

// تشغيل التطبيق مرة واحدة فقط
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

export default async function handler(req, res) {
  const { fcmToken, title, body } = req.body;

  const message = {
    notification: {
      title: title || "رقة",
      body: body || "تنبيه جديد"
    },
    token: fcmToken
  };

  try {
    const response = await admin.messaging().send(message);
    return res.status(200).json({ success: true, response });
  } catch (error) {
    // هنا سيطبع لك السبب الحقيقي للفشل بدقة
    return res.status(500).json({ error: error.message });
  }
}
