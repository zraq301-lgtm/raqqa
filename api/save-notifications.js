import { createPool } from '@vercel/postgres';

// الاتصال بقاعدة البيانات باستخدام المتغيرات الموضحة في صورتك
const pool = createPool({
    connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL
});

export default async function handler(req, res) {
    // إعدادات CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
    
    // استخراج البيانات من الطلب
    const { 
        user_id, fcm_token, username, current_weight, height_cm, 
        category, note 
    } = req.body;

    // --- منطق التحقق الجديد لإصلاح مشكلة "البيانات الفارغة" ---
    if (!fcm_token || fcm_token.trim() === "") {
        console.error("خطأ: تم استلام طلب بدون fcm_token");
        return res.status(400).json({ 
            success: false, 
            error: "fcm_token is required. الجهاز لم يرسل معرف الإشعارات." 
        });
    }

    const activeUserId = user_id || 'init_user';
    const aiAdvice = note || `تم تحديث ملفك الصحي في رقة ✨`;

    try {
        // 1. إرسال البيانات إلى Make.com مع التأكد من إرسال التوكن
        try {
            const makeResponse = await fetch('https://hook.eu1.make.com/e9aratm1mdbwa38cfoerzdgfoqbco6ky', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    title: category || "تحديث صحي", 
                    message: aiAdvice,             
                    fcm_token: fcm_token, // سيرسل الآن القيمة التي تأكدنا من وجودها
                    username: username,
                    user_id: activeUserId,
                    note: aiAdvice
                })
            });
            
            if (!makeResponse.ok) {
                console.warn("Make.com responded with an error");
            }
        } catch (e) { 
            console.error("Make Communication Error:", e); 
        }

        // 2. الحفظ في قاعدة بيانات Postgres (نيون)
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

        return res.status(200).json({ 
            success: true, 
            status: "تم الحفظ والإرسال بنجاح",
            received_token: fcm_token // نرسل التوكن في الرد للتأكد من وصوله
        });

    } catch (dbError) {
        console.error("DB Error:", dbError.message);
        return res.status(500).json({ error: dbError.message });
    }
}
