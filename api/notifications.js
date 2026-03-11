import { createPool } from '@vercel/postgres';

export default async function handler(req, res) {
    // إعدادات CORS للسماح للواجهة بقراءة البيانات
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    const { user_id } = req.query;

    // الاتصال باستخدام POSTGRES_URL الخاص بـ Vercel/Neon
    const pool = createPool({
        connectionString: process.env.POSTGRES_URL 
    });

    try {
        // الاستعلام المحدث لجلب تواريخ البدء والانتهاء بوضوح
        // قمنا بجلب الأعمدة الجديدة التي تعبر عن "سجل التواريخ"
        const { rows } = await pool.query(
            `SELECT 
                id, 
                title, 
                body, 
                category,
                period_start_date, 
                period_end_date, 
                is_sent,
                created_at 
             FROM notifications 
             WHERE user_id = $1 
             ORDER BY period_start_date DESC`, 
            [parseInt(user_id || 1)]
        );

        // تنظيف البيانات قبل إرسالها للواجهة لضمان تنسيق تاريخ نظيف
        const formattedNotifications = rows.map(row => ({
            ...row,
            period_start_date: row.period_start_date ? new Date(row.period_start_date).toLocaleDateString('ar-EG') : null,
            period_end_date: row.period_end_date ? new Date(row.period_end_date).toLocaleDateString('ar-EG') : null
        }));

        return res.status(200).json({ 
            success: true, 
            count: rows.length,
            notifications: formattedNotifications 
        });
    } catch (error) {
        console.error("Database Error:", error.message);
        return res.status(500).json({ 
            success: false, 
            error: "خطأ في جلب بيانات السجل", 
            details: error.message 
        });
    } finally {
        // إغلاق الاتصال لتحسين الأداء في Vercel
        await pool.end();
    }
}
