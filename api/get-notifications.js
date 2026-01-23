import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
    // إعدادات السماح بالاتصال (CORS)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    // جلب user_id من الرابط (Query Parameter)
    const { user_id } = req.query;

    if (!user_id) {
        return res.status(400).json({ error: "يجب تزويد user_id" });
    }

    try {
        // الاستعلام مطابق لأسماء الأعمدة في لقطات الشاشة: id, user_id, title, body, is_read, created_at
        const result = await sql`
            SELECT id, title, body, created_at 
            FROM notifications 
            WHERE user_id = ${parseInt(user_id)} AND is_read = FALSE
            ORDER BY created_at DESC;
        `;

        return res.status(200).json({ success: true, notifications: result.rows });
    } catch (error) {
        // في حال وجود خطأ في الاتصال بقاعدة البيانات نيون
        return res.status(500).json({ error: error.message });
    }
}
