import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
    // 1. تصاريح الوصول (مهمة جداً لعمل كود AppCreator24)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const { user_id } = req.query;

    try {
        // 2. الاستعلام بناءً على أسماء الحقول في صورتك: title, body, user_id, is_read
        const result = await sql`
            SELECT id, title, body, created_at 
            FROM notifications 
            WHERE user_id = ${parseInt(user_id)} AND is_read = FALSE
            ORDER BY created_at DESC;
        `;

        // 3. إرجاع النتائج بصيغة JSON
        return res.status(200).json({ success: true, notifications: result.rows });
    } catch (error) {
        // إذا حدث خطأ سيظهر لكِ سببه بوضوح في شاشة التطبيق
        return res.status(500).json({ success: false, error: error.message });
    }
}
