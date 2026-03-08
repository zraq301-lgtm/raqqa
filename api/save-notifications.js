import { createPool } from '@vercel/postgres';

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
    
    const { 
        user_id, fcm_token, username, current_weight, height_cm, 
        period_date, pregnancy_status, medications, category, note 
    } = req.body;

    const activeUserId = user_id || 'init_user';
    const aiAdvice = note || `تم تحديث ملفك الصحي في رقة ✨`;
    // تنظيف التوكن والتأكد من وجوده
    let finalToken = fcm_token && fcm_token.trim() !== "" ? fcm_token : null;

    try {
        // 1. تحديث أو إدخال البيانات في Neon واستعادة التوكن الصحيح فوراً
        // استخدمنا RETURNING fcm_token لضمان أننا نملك القيمة الحقيقية المخزنة
        const dbResult = await pool.query(`
            INSERT INTO notifications (
                user_id, fcm_token, username, "الوزن_الحالي", "الطول_سم", 
                title, body, "تاريخ_آخر_حيض", "ظرف_الحمل", "الأدوية_الموصوفة", created_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
            ON CONFLICT (user_id) 
            DO UPDATE SET 
                fcm_token = COALESCE(EXCLUDED.fcm_token, notifications.fcm_token),
                username = EXCLUDED.username,
                "الوزن_الحالي" = EXCLUDED."الوزن_الحالي",
                "الطول_سم" = EXCLUDED."الطول_سم",
                body = EXCLUDED.body,
                "تاريخ_آخر_حيض" = EXCLUDED."تاريخ_آخر_حيض",
                "ظرف_الحمل" = EXCLUDED."ظرف_الحمل",
                "الأدوية_الموصوفة" = EXCLUDED."الأدوية_الموصوفة",
                created_at = NOW()
            RETURNING fcm_token;
        `, [
            activeUserId, finalToken, username || 'زائرة رقة',
            current_weight || null, height_cm || null, 
            category || "تحديث صحي", aiAdvice, 
            period_date || null, pregnancy_status || null, medications || null
        ]);

        // تحديث قيمة finalToken بما هو موجود فعلياً في قاعدة البيانات
        finalToken = dbResult.rows[0].fcm_token;

        let makeSent = false;

        // 2. الإرسال إلى الـ Webhook الخاص بـ Make (فقط إذا توفر التوكن)
        if (finalToken && finalToken !== "") {
            try {
                const makeResponse = await fetch('https://hook.eu1.make.com/e9aratm1mdbwa38cfoerzdgfoqbco6ky', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        fcm_token: finalToken, // سيصل الآن كـ fcm_token ملون في Make
                        title: category || "تحديث صحي", 
                        message: aiAdvice,             
                        username: username || "مستخدمة رقة",
                        user_id: activeUserId,
                        weight: current_weight,
                        height: height_cm,
                        period_date: period_date,
                        pregnancy_status: pregnancy_status,
                        medications: medications
                    })
                });
                
                if (makeResponse.ok) {
                    makeSent = true;
                }
            } catch (fetchError) {
                console.error("Make Webhook Error:", fetchError.message);
                // لا نريد تعطيل الاستجابة إذا فشل الويب هوك فقط
            }
        }

        // 3. الرد النهائي للعميل
        return res.status(200).json({ 
            success: true, 
            db_saved: true,
            make_sent: makeSent,
            user: activeUserId,
            token_status: finalToken ? "Sent" : "Missing"
        });

    } catch (error) {
        console.error("Critical Error:", error.message);
        return res.status(500).json({ 
            error: "حدث خطأ داخلي", 
            details: error.message 
        });
    }
}
