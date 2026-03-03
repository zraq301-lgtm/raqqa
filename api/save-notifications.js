import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
    // التأكد من أن الطلب من نوع POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }
    
    // استلام البيانات من الواجهة (Frontend)
    const { user_id, category, value, note, fcm_token } = req.body;

    try {
        // 1. الحفظ في جدول المتابعة الصحية (health_tracking) في نيون
        await sql`
            INSERT INTO health_tracking (user_id, category, numeric_value, text_note)
            VALUES (${user_id}, ${category}, ${value}, ${note});
        `;

        // نصيحة افتراضية في حال فشل الاتصال بـ Gemini
        let aiAdvice = `تم تسجيل ${category} بنجاح في رقة ✨`;

        // 2. إرسال البيانات إلى Make لجلب نصيحة Gemini الذكية
        try {
            const response = await fetch('https://hook.eu1.make.com/e9aratm1mdbwa38cfoerzdgfoqbco6ky', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_id: user_id,
                    fcm_token: fcm_token, // إرسال التوكن لضمان وصول الإشعار للهاتف
                    category: category,
                    value: value,
                    note: note
                })
            });
            
            // استلام الرد الذي يحتوي على النصيحة من Make
            const data = await response.json();
            if (data?.advice) {
                aiAdvice = data.advice;
            }
        } catch (aiError) {
            console.error("خطأ في الاتصال بـ Make/Gemini:", aiError);
        }

        // 3. حفظ النصيحة النهائية في جدول الإشعارات (notifications)
        // هذا هو الجدول الذي طلبت التأكيد عليه في قاعدة بيانات نيون
        await sql`
            INSERT INTO notifications (user_id, title, body, created_at)
            VALUES (${user_id}, 'تنبيه ذكي من رقة ✨', ${aiAdvice}, NOW());
        `;

        // إعادة النصيحة للتطبيق لإظهارها للمستخدمة فوراً
        return res.status(200).json({ 
            success: true, 
            advice: aiAdvice,
            message: "تم الحفظ في نيون وإرسال النصيحة بنجاح" 
        });

    } catch (dbError) {
        // معالجة أخطاء قاعدة بيانات نيون
        console.error("Neon Database Error:", dbError);
        return res.status(500).json({ 
            error: "فشل في حفظ البيانات في نيون", 
            details: dbError.message 
        });
    }
}
