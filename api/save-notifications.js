import { createPool } from '@vercel/postgres';

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

    // التحقق من وجود التوكن لضمان الربط
    const activeToken = fcm_token || null;

    try {
        let aiAdvice = note || `تم تحديث ملفك الصحي في رقة ✨`;

        // 1. إرسال البيانات إلى Make
        try {
            await fetch('https://hook.eu1.make.com/e9aratm1mdbwa38cfoerzdgfoqbco6ky', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id, fcm_token: activeToken, category, current_weight })
            });
        } catch (e) { console.error("Make Error:", e); }

        // 2. الحفظ الذكي (Upsert): البحث عن التوكن وتحديث بياناته
        // هذا الاستعلام يضمن دمج البيانات الصحية مع التوكن المسجل عند الافتتاح
        await pool.sql`
            INSERT INTO notifications (
                user_id, fcm_token, اسم_المستخدمة, الوزن_الحالي, 
                الطول_سم, تاريخ_آخر_حيض, ظرف_الحمل, الأدوية_الموصوفة, 
                title, body, created_at
            )
            VALUES (
                ${user_id || 'init'}, 
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
            ON CONFLICT (fcm_token) 
            DO UPDATE SET 
                user_id = EXCLUDED.user_id,
                اسم_المستخدمة = COALESCE(EXCLUDED.اسم_المستخدمة, notifications.اسم_المستخدمة),
                الوزن_الحالي = EXCLUDED.الوزن_الحالي,
                الطول_سم = COALESCE(EXCLUDED.الطول_سم, notifications.الطول_سم),
                ظرف_الحمل = COALESCE(EXCLUDED.ظرف_الحمل, notifications.ظرف_الحمل),
                body = EXCLUDED.body,
                created_at = NOW();
        `;

        return res.status(200).json({ success: true, message: "تم دمج البيانات بنجاح" });

    } catch (dbError) {
        console.error("Database Error:", dbError);
        return res.status(500).json({ error: "خطأ في الدمج", details: dbError.message });
    }
}
