import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
    // حل مشكلة CORS للاتصال من خارج فيرسل
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const { user_id } = req.query;

    if (!user_id) {
        return res.status(200).json({ success: false, error: "user_id is missing" });
    }

    try {
        // الاستعلام مطابق تماماً لأسماء المفاتيح في صورتك (id, user_id, title, body, is_read)
        const result = await sql`
            SELECT id, title, body, created_at 
            FROM notifications 
            WHERE user_id = ${parseInt(user_id)} AND is_read = FALSE
            ORDER BY created_at DESC;
        `;

        return res.status(200).json({ 
            success: true, 
            notifications: result.rows 
        });
    } catch (error) {
        console.error("Database Error:", error);
        return res.status(500).json({ 
            success: false, 
            error: "خطأ في الاتصال بقاعدة البيانات",
            details: error.message 
        });
    }
}
