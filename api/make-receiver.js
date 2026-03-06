import { put } from '@vercel/blob';
import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
  });
}

export default async function handler(req, res) {
  // هذه الأسطر هي الحل لخطأ Method Not Allowed عند الاتصال من Make
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // السماح فقط بطلبات POST لمعالجة البيانات
  if (req.method === 'POST') {
    try {
      const { title, message, fcm_token, file_data, file_name } = req.body;
      
      let fileUrl = "";
      if (file_data) {
        const blob = await put(file_name || 'upload.png', Buffer.from(file_data, 'base64'), { access: 'public' });
        fileUrl = blob.url;
      }

      await admin.messaging().send({
        notification: { title, body: message, image: fileUrl },
        token: fcm_token
      });

      return res.status(200).json({ success: true, url: fileUrl });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  // في حال وصول أي طلب غير POST، سنعيد هذا الخطأ
  return res.status(405).json({ error: 'الرجاء التأكد من استخدام POST في موديول ميك' });
}
