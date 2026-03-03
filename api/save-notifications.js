import { createPool } from '@vercel/postgres';

// إنشاء اتصال باستخدام المتغيرات الظاهرة في صورتك (DATABASE_URL أو POSTGRES_URL)
const pool = createPool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL
});

export default async function handler(req, res) {
    // إعدادات CORS للسماح للـ APK بالوصول وتخطي مرحلة "جاري التحميل"
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
    
    const { 
        user_id, 
        fcm_token,
        username,            
        current_weight,      
        height_cm,           
        period_date,         
        cycle_days,          
        pregnancy_status,    
        breastfeeding_months,
        doctor_type,         
        medications,         
        category,            
        note                 
    } = req.body;

    try {
        // 1. طلب النصيحة من Make/Gemini
        let aiAdvice = `تم تحديث بياناتك في رقة ✨`;
        try {
            const response = await fetch('https://hook.eu1.make.com/e9aratm1mdbwa38cfoerzdgfoqbco6ky', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id, fcm_token, category, current_weight, pregnancy_status })
            });
            const data = await response.json();
            if (data?.advice) aiAdvice = data.advice;
        } catch (e) { 
            console.error("Make/AI Error:", e); 
        }

        // 2. الحفظ في جدول notifications (تأكد من مطابقة الأسماء للصور المرفقة)
        // تم استبدال "باطل" بـ null برمجياً لضمان سلامة قاعدة البيانات
        await pool.sql`
            INSERT INTO notifications (
                user_id, 
                fcm_token, 
                اسم_المستخدمة,
                الوزن_الحالي, 
                الطول_سم, 
                تاريخ_آخر_حيض, 
                ظرف_الحمل,
                الأدوية_الموصوفة,
                تخصص_الطبيب,
                مدة_الرضاعة_بالشهور,
                title, 
                body, 
                created_at
            )
            VALUES (
                ${user_id}, 
                ${fcm_token && fcm_token !== 'باطل' ? fcm_token : null}, 
                ${username || 'زائرة رقة'}, 
                ${current_weight || null}, 
                ${height_cm || null}, 
                ${period_date || null}, 
                ${pregnancy_status || null},
                ${medications && medications !== 'باطل' ? medications : null},
                ${doctor_type || null},
                ${breastfeeding_months || null},
                ${'تحديث: ' + category}, 
                ${aiAdvice}, 
                NOW()
            );
        `;

        return res.status(200).json({ 
            success: true, 
            advice: aiAdvice,
            message: "Data saved to Neon successfully" 
        });

    } catch (dbError) {
        console.error("Neon Database Error:", dbError);
        return res.status(500).json({ 
            error: "فشل الحفظ في نيون", 
            details: dbError.message 
        });
    }
}
