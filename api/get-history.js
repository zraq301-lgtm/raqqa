import { createPool } from '@vercel/postgres';

export default async function handler(req, res) {
    // 1. السماح للتطبيق بالوصول للبيانات (CORS)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const { user_id } = req.query;
    const pool = createPool({ connectionString: process.env.POSTGRES_URL });

    try {
        // 2. جلب البيانات من الأعمدة التي ظهرت في نيون (period_start_date)
        const { rows } = await pool.query(
            `SELECT 
                id, 
                category, 
                period_start_date, 
                period_end_date, 
                is_sent 
             FROM notifications 
             WHERE user_id = $1 
             ORDER BY period_start_date DESC`, 
            [parseInt(user_id || 1)]
        );

        // 3. تحويل صيغة التاريخ ليفهمها تطبيقك (YYYY-MM-DD)
        const notifications = rows.map(row => ({
            ...row,
            startDate: row.period_start_date ? new Date(row.period_start_date).toISOString().split('T')[0] : null,
            endDate: row.period_end_date ? new Date(row.period_end_date).toISOString().split('T')[0] : null
        }));

        return res.status(200).json({ success: true, notifications });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    } finally {
        await pool.end();
    }
}
