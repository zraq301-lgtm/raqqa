import { db } from '@vercel/postgres';
import { Knock } from "@knocklabs/node";

// تهيئة مكتبة Knock باستخدام المفتاح السري (Secret Key) من Vercel Environment Variables
const knock = new Knock(process.env.KNOCK_API_KEY);

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    const { userId, title, body } = req.body;

    try {
        // الخطوة الأولى: الحفظ في نيون (Neon) لتظهر في صفحة na.html
        const query = 'INSERT INTO notifications (user_id, title, body) VALUES ($1, $2, $3) RETURNING *';
        const values = [userId, title, body];
        const { rows } = await db.query(query, values);

        // الخطوة الثانية: إرسال "إشارة" لـ Knock لإرسال إشعار الهاتف (Push)
        // يجب أن يكون اسم الـ Workflow مطابقاً لما أنشأته في لوحة تحكم Knock
        await knock.workflows.trigger("new-notification", {
            recipients: [userId],
            data: {
                title: title,
                body: body,
            },
        });

        return res.status(200).json({ success: true, data: rows[0] });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ success: false, error: error.message });
    }
}
