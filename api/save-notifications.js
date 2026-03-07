import { createPool } from '@vercel/postgres';

// الاتصال بقاعدة البيانات باستخدام الرابط المباشر
const pool = createPool({
    connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL
});

export default async function handler(req, res) {
    // إعدادات CORS للسماح بالطلبات من التطبيق
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
    
    // استخراج البيانات من الطلب
    const { 
        user_id, fcm_token, username, current_weight, height_cm, 
        period_date, pregnancy_status, medications, category, note 
    } = req.body;

    const activeUserId = user_id || 'init_user';

    try {
        // تحديد نص الإشعار الافتراضي إذا لم يوجد ملاحظة
        let aiAdvice = note || `تم تحديث ملفك الصحي في رقة ✨`;

        // 1. إرسال البيانات إلى Make.com
        try {
            await fetch('https://hook.eu1.make.com/e9aratm1mdbwa38cfoerzdgfoqbco6ky', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    title: category || "تحديث صحي", 
                    message: aiAdvice,             
                    fcm_token: fcm_token,          
                    username: username,
                    user_id: activeUserId
                })
            });
        } catch (e) { 
            console.error("Make Error:", e); 
        }

        // 2. الحفظ في قاعدة بيانات Postgres باستخدام التعديل الموصى به لضمان الأمان
        const query = `
            INSERT INTO notifications (user_id, fcm_token, username, current_weight, height_cm, title, body, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
            ON CONFLICT (user_id) 
            DO UPDATE SET 
                fcm_token = EXCLUDED.fcm_token,
                username = COALESCE(EXCLUDED.username, notifications.username),
                body = EXCLUDED.body,
                created_at = NOW();
        `;

        const values = [
            activeUserId, 
            fcm_token, 
            username, 
            current_weight, 
            height_cm, 
            category || "تحديث صحي", 
            aiAdvice
        ];

        await pool.query(query, values);

        return res.status(200).json({ success: true, status: "تم الإرسال والحفظ بنجاح" });

    } catch (dbError) {
        console.error("DB Error:", dbError.message);
        return res.status(500).json({ error: dbError.message });
    }
}
