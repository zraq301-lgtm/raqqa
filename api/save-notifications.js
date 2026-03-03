import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
    
    // استلام كافة الحقول الظاهرة في الصور لضمان عدم وجود NULL
    const { 
        user_id, 
        fcm_token,
        username,            // اسم_المستخدمة
        current_weight,      // الوزن_الحالي
        height_cm,           // الطول_سم
        period_date,         // تاريخ_آخر_حيض
        cycle_days,          // مدة_الدورة_بالأيام
        pregnancy_status,    // ظرف_الحمل (أسبوع الحمل)
        breastfeeding_months,// مدة_الرضاعة_بالشهور
        doctor_type,         // تخصص_الطبيب
        medications,         // الأدوية_الموصوفة
        category,            // الفئة (وزن، حمل، إلخ)
        note                 // الملاحظة
    } = req.body;

    try {
        // 1. جلب النصيحة من Make/Gemini
        let aiAdvice = `تم تحديث بياناتك في رقة ✨`;
        try {
            const response = await fetch('https://hook.eu1.make.com/e9aratm1mdbwa38cfoerzdgfoqbco6ky', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id, fcm_token, category, current_weight, pregnancy_status })
            });
            const data = await response.json();
            if (data?.advice) aiAdvice = data.advice;
        } catch (e) { console.error("Make Error:", e); }

        // 2. الحفظ الشامل في جدول notifications بمطابقة أعمدة صورك
        await sql`
            INSERT INTO notifications (
                user_id, 
                fcm_token, 
                اسم_المستخدمة,
                الوزن_الحالي, 
                الطول_سم, 
                تاريخ_آخر_حيض, 
                ظرف_الحمل,
                الأدوية_الموصوفة,
                title, 
                body, 
                created_at
            )
            VALUES (
                ${user_id}, 
                ${fcm_token}, 
                ${username || 'زائرة رقة'}, 
                ${current_weight || null}, 
                ${height_cm || null}, 
                ${period_date || null}, 
                ${pregnancy_status || null},
                ${medications || null},
                ${'تحديث: ' + category}, 
                ${aiAdvice}, 
                NOW()
            );
        `;

        return res.status(200).json({ success: true, advice: aiAdvice });

    } catch (dbError) {
        console.error("Neon Database Error:", dbError);
        return res.status(500).json({ error: "فشل الحفظ في نيون", details: dbError.message });
    }
}
