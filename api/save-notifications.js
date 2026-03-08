import { createPool } from '@vercel/postgres';

const pool = createPool({
    connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL
});

export default async function handler(req, res) {
    // 1. إعدادات CORS للسماح بالطلبات الخارجية
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
    
    // تنظيف التوكن المبدئي
    let finalToken = fcm_token && fcm_token.trim() !== "" ? fcm_token : null;

    try {
        // 2. تحديث Neon واستعادة التوكن (المخزن أو الجديد)
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

        finalToken = dbResult.rows[0].fcm_token;

        let makeSent = false;
        let makeResponseData = "No attempt";

        // 3. الإرسال إلى الـ Webhook (Make.com) مع تعقب الاستجابة
        if (finalToken) {
            console.log(`[Raqqa Log] Sending to Webhook. Token found: ${finalToken.substring(0, 10)}...`);
            
            try {
                const makeResponse = await fetch('https://hook.eu1.make.com/e9aratm1mdbwa38cfoerzdgfoqbco6ky', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({ 
                        fcm_token: finalToken,
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

                makeResponseData = await makeResponse.text();
                console.log(`[Raqqa Log] Make.com Response: ${makeResponse.status} - ${makeResponseData}`);

                if (makeResponse.ok) {
                    makeSent = true;
                }
            } catch (fetchError) {
                console.error("[Raqqa Log] Webhook Fetch Failed:", fetchError.message);
                makeResponseData = fetchError.message;
            }
        } else {
            console.log("[Raqqa Log] Skipping Webhook: No Token found in DB or Request.");
        }

        // 4. الرد النهائي
        return res.status(200).json({ 
            success: true, 
            db_saved: true,
            make_sent: makeSent,
            make_response: makeResponseData,
            token_status: finalToken ? "Processed" : "Missing"
        });

    } catch (error) {
        console.error("[Raqqa Log] Main Error:", error.message);
        return res.status(500).json({ 
            error: "حدث خطأ داخلي في الخادم", 
            details: error.message 
        });
    }
}
