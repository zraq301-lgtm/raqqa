import { createPool } from '@vercel/postgres';

export default async function handler(req, res) {
    // 1. إعدادات CORS للسماح بالوصول من واجهة التطبيق الخارجية
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // التعامل مع طلبات OPTIONS التمهيدية
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { user_id } = req.query;

    // التحقق من وجود user_id لتجنب أخطاء الاستعلام
    if (!user_id) {
        return res.status(400).json({ success: false, error: "Missing user_id parameter" });
    }

    // 2. إنشاء الاتصال باستخدام المسمى الدقيق الظاهر في صورتك: raqqa_POSTGRES_URL
    const pool = createPool({
        connectionString: process.env.raqqa_POSTGRES_URL 
    });

    try {
        // 3. تنفيذ الاستعلام مع معالجة البيانات (التأكد من أن user_id رقم)
        const { rows } = await pool.query(
            `SELECT id, title, body, created_at 
             FROM notifications 
             WHERE user_id = $1 AND is_read = FALSE 
             ORDER BY created_at DESC`,
            [parseInt(user_id)]
        );

        // إرجاع النتائج بنجاح
        return res.status(200).json({ 
            success: true, 
            notifications: rows 
        });

    } catch (error) {
        // طباعة الخطأ في سجلات Vercel لتسهيل تتبعه
        console.error("Database Error:", error.message);
        return res.status(500).json({ 
            success: false, 
            error: "فشل الاتصال بقاعدة البيانات",
            details: error.message 
        });
    } finally {
        // 4. إغلاق الاتصال فوراً لتحرير الموارد ومنع تراكم الجلسات
        await pool.end();
    }
}
