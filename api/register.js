import { db } from '@vercel/postgres';
import { Knock } from "@knocklabs/node";

// تهيئة Knock باستخدام المفتاح الذي حصلت عليه من التكامل أو الإعداد اليدوي
const knock = new Knock(process.env.KNOCK_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { userId, name, email, message } = req.body;

  try {
    // أولاً: حفظ الإشعار في Neon لتظهر في صفحة na.html
    await db.query(
      'INSERT INTO notifications (user_id, title, body) VALUES ($1, $2, $3)',
      [userId, "تسجيل جديد", message]
    );

    // ثانياً: إرسال الإشارة لـ Knock لإرسال إشعار Push (مثل APK)
    await knock.workflows.trigger("new-data-workflow", {
      recipients: [userId], // المعرف الخاص بالمستخدم
      data: {
        user_name: name,
        content: message,
      },
    });

    return res.status(200).json({ success: true, message: "تم الحفظ والتنبيه" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "فشل في معالجة الطلب" });
  }
}
