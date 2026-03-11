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
        // التعديل الجوهري: استخدام أسماء الأعمدة العربية كما تظهر في قاعدة البيانات (صورة 181757)
        // يجب وضع الأسماء العربية بين علامتي اقتباس مزدوجة " " داخل الاستعلام
        const { rows } = await pool.query(
            `SELECT 
                id, 
                title, 
                body, 
                category,
                "تاريخ_بداية_الفترة", 
                "تاريخ_نهاية_الفترة", 
                is_sent,
                created_at 
             FROM notifications 
             WHERE user_id = $1 
             ORDER BY "تاريخ_بداية_الفترة" DESC`, 
            [parseInt(user_id || 1)]
        );

        // تنظيف البيانات وتغيير المفاتيح لتكون سهلة الاستخدام في الواجهة (بدلاً من باطل)
        const formattedNotifications = rows.map(row => ({
            id: row.id,
            title: row.title,
            body: row.body,
            category: row.category,
            is_sent: row.is_sent,
            created_at: row.created_at,
            // معالجة الأعمدة العربية وتحويلها لتنسيق تاريخ بسيط
            period_start_date: row.تاريخ_بداية_الفترة ? new Date(row.تاريخ_بداية_الفترة).toISOString().split('T')[0] : null,
            period_end_date: row.تاريخ_نهاية_الفترة ? new Date(row.تاريخ_نهاية_الفترة).toISOString().split('T')[0] : null
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
