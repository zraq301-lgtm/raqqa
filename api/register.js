import { db } from '@vercel/postgres';
import { Knock } from "@knocklabs/node";

// تهيئة Knock باستخدام المفتاح السري المضاف في Vercel
const knock = new Knock(process.env.KNOCK_API_KEY);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // استلام بيانات المستخدم الحقيقية من الطلب (Request Body)
    const { userId, userName, userEmail, message } = req.body;

    try {
        // 1. حفظ الإشعار في قاعدة بيانات Neon ليعرض في صفحة na.html
        await db.query(
            'INSERT INTO notifications (user_id, title, body) VALUES ($1, $2, $3)',
            [userId, "إشعار جديد للمستخدم: " + userName, message]
        );

        // 2. تفعيل سير العمل raqqa في Knock مع تمرير بيانات المستخدم
        await knock.workflows.trigger("raqqa", {
            recipients: [{
                id: userId,          // معرف المستخدم الفريد (Unique ID)
                name: userName,      // اسم المستخدم
                email: userEmail,    // بريد المستخدم لربطه بـ FCM
            }],
            data: {
                // المتغيرات التي سيتم استبدالها في قالب الإشعار
                title: "تنبيه جديد يا " + userName, 
                body: message,
                user_email: userEmail // معرف إضافي إذا احتجتِ استخدامه
            },
        });

        return res.status(200).json({ 
            success: true, 
            message: `تم إرسال الإشعار لـ ${userName} بنجاح` 
        });

    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ error: "فشل في الإرسال", details: error.message });
    }
}
