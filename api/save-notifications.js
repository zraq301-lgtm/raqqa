import { createPool } from '@vercel/postgres';

// الربط مع قاعدة بيانات نيون باستخدام DATABASE_URL
const pool = createPool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL
});

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
    
    const { 
        user_id, fcm_token, username, current_weight, height_cm, 
        period_date, pregnancy_status, medications, category, note 
    } = req.body;

    // المفتاح الأساسي للربط هو user_id لضمان التعرف على الجهاز في OneSignal و Neon
    const activeToken = fcm_token || null;
    const activeUserId = user_id || 'init_user';

    try {
        let aiAdvice = note || `تم تحديث ملفك الصحي في رقة ✨`;

        // 1. إرسال البيانات إلى Make
        try {
            await fetch('https://hook.eu1.make.com/e9aratm1mdbwa38cfoerzdgfoqbco6ky', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    user_id: activeUserId, 
                    fcm_token: activeToken, 
                    username,
                    category, 
                    current_weight,
                    note: aiAdvice 
                })
            });
        } catch (e) { console.error("Make Platform Error:", e); }

        // 2. الحفظ في نيون (Neon DB) - التحديث بناءً على user_id لضمان استمرارية السجل
        await pool.sql`
            INSERT INTO notifications (
                user_id, fcm_token, اسم_المستخدمة, الوزن_الحالي, 
                الطول_سم, تاريخ_آخر_حيض, ظرف_الحمل, الأدوية_الموصوفة, 
                title, body, created_at
            )
            VALUES (
                ${activeUserId}, 
                ${activeToken}, 
                ${username || 'مستخدمة رقة'}, 
                ${current_weight || null}, 
                ${height_cm || null}, 
                ${period_date || null}, 
                ${pregnancy_status || null}, 
                ${medications || null}, 
                ${category || 'تحديث صحي'}, 
                ${aiAdvice}, 
                NOW()
            )
            ON CONFLICT (user_id) 
            DO UPDATE SET 
                fcm_token = EXCLUDED.fcm_token,
                اسم_المستخدمة = COALESCE(EXCLUDED.اسم_المستخدمة, notifications.اسم_المستخدمة),
                الوزن_الحالي = EXCLUDED.الوزن_الحالي,
                body = EXCLUDED.body,
                created_at = NOW();
        `;

        return res.status(200).json({ success: true, message: "تم الربط والحفظ بنجاح" });

    } catch (dbError) {
        console.error("Database Error:", dbError);
        return res.status(500).json({ error: "خطأ في قاعدة البيانات", details: dbError.message });
    }
}
