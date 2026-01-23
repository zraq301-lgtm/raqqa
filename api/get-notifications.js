import { createPool } from '@vercel/postgres';

export default async function handler(req, res) {
    // 1. إعدادات الـ CORS للسماح بالوصول من واجهة التطبيق
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // التعامل مع طلبات OPTIONS التمهيدية
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { user_id } = req.query;

    // التأكد من إرسال user_id في الطلب
    if (!user_id) {
        return res.status(200).json({ success: false, error: "Missing user_id parameter" });
    }

    // 2. إنشاء اتصال بقاعدة بيانات Neon باستخدام الرابط المخزن في Vercel
    const pool = createPool({
        connectionString: process.env.POSTGRES_URL
    });

    try {
        // 3. الاستعلام باستخدام أسماء المفاتيح الدقيقة من صورك
        // استخدمنا $1 كمعامل أمان لمنع ثغرات SQL Injection
        const { rows } = await pool.query(
            `SELECT id, title, body, created_at 
             FROM notifications 
             WHERE user_id = $1 AND is_read = FALSE 
             ORDER BY created_at DESC`,
            [parseInt(user_id)]
        );

        // إرجاع النتيجة بنجاح
        return res.status(200).json({ 
            success: true, 
            notifications: rows 
        });

    } catch (error) {
        // في حال فشل الاتصال، سيظهر لكِ السبب في "خطأ المزامنة" بالواجهة
        console.error("Database Error:", error);
        return res.status(500).json({ 
            success: false, 
            error: "فشل الاتصال بـ Neon",
            details: error.message 
        });
    } finally {
        // إغلاق الاتصال لتحسين الأداء
        await pool.end();
    }
            }
