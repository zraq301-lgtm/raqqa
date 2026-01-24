import { createPool } from '@vercel/postgres';

export default async function handler(req, res) {
    // 1. إعدادات CORS للسماح للواجهة بقراءة البيانات
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const { user_id } = req.query;

    // 2. الاتصال باستخدام المفتاح الدقيق الظاهر في إعداداتك
    const pool = createPool({
        connectionString: process.env.raqqa_POSTGRES_URL 
    });

    try {
        // 3. استعلام جلب الإشعارات غير المقروءة للمستخدم
        const { rows } = await pool.query(
            `SELECT id, title, body, created_at 
             FROM notifications 
             WHERE user_id = $1 AND is_read = FALSE 
             ORDER BY created_at DESC`,
            [parseInt(user_id || 1)]
        );

        return res.status(200).json({ 
            success: true, 
            notifications: rows 
        });

    } catch (error) {
        console.error("Database Error:", error.message);
        return res.status(500).json({ 
            success: false, 
            error: "فشل الاتصال بقاعدة البيانات",
            details: error.message 
        });
    } finally {
        // مهم جداً لإغلاق الاتصال وتحرير الموارد
        await pool.end();
    }
}
