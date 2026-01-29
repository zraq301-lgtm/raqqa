import { db } from '@vercel/postgres';
import { Knock } from "@knocklabs/node";

// تأكدي أن KNOCK_API_KEY في Vercel هو المفتاح السري (Secret Key) الذي يبدأ بـ sk_
const knock = new Knock(process.env.KNOCK_API_KEY);

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    const { userId, title, body } = req.body;

    try {
        // 1. الحفظ في نيون (Neon)
        const query = 'INSERT INTO notifications (user_id, title, body) VALUES ($1, $2, $3) RETURNING *';
        const values = [userId, title, body];
        const { rows } = await db.query(query, values);

        // 2. إرسال الإشارة لـ Knock (تم تصحيح الاسم إلى raqqa)
        await knock.workflows.trigger("raqqa", { // تم التغيير من new-notification إلى raqqa
            recipients: [userId],
            data: {
                title: title, // سيظهر مكان {{ title }} في القالب
                body: body,   // سيظهر مكان {{ body }} في القالب
            },
        });

        return res.status(200).json({ success: true, data: rows[0] });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ success: false, error: error.message });
    }
}
