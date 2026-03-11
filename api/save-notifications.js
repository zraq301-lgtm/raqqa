import { createPool } from '@vercel/postgres';

export default async function handler(req, res) {
    // إعدادات CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    const { user_id } = req.query;

    const pool = createPool({
        connectionString: process.env.POSTGRES_URL 
    });

    try {
        // الاستعلام باستخدام الأسماء العربية كما تظهر في قاعدة بياناتك (صورة 181757)
        const { rows } = await pool.query(
            `SELECT 
                id, 
                title, 
                body, 
                category,
                "تاريخ_بداية_الفترة" as start_date, 
                "تاريخ_نهاية_الفترة" as end_date, 
                is_sent,
                created_at 
             FROM notifications 
             WHERE user_id = $1 
             ORDER BY "تاريخ_بداية_الفترة" DESC`, 
            [parseInt(user_id || 1)]
        );

        // معالجة البيانات لضمان عدم ظهور كلمة "باطل" في الواجهة
        const notifications = rows.map(row => {
            const startDate = row.start_date ? new Date(row.start_date) : null;
            
            return {
                id: row.id,
                title: row.title,
                body: row.body,
                category: row.category,
                // تحويل التاريخ لتنسيق مقروء (مثال: 2026/02/10)
                startDate: startDate ? startDate.toISOString().split('T')[0] : "غير محدد",
                endDate: row.end_date ? new Date(row.end_date).toISOString().split('T')[0] : "غير محدد",
                // منطق TRUE/FALSE: إذا كان التاريخ قديم، تظهر كأنها أُرسلت (True)
                isSent: row.is_sent, 
                createdAt: row.created_at
            };
        });

        return res.status(200).json({ 
            success: true, 
            count: notifications.length,
            notifications: notifications 
        });

    } catch (error) {
        console.error("Database Error:", error.message);
        return res.status(500).json({ 
            success: false, 
            error: "خطأ في قراءة السجلات", 
            details: error.message 
        });
    } finally {
        await pool.end();
    }
}
