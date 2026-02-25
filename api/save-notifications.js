import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
    // --- إعدادات CORS الموحدة ---
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // الاتصال بقاعدة البيانات باستخدام DATABASE_URL من متغيرات البيئة 
    const sql = neon(process.env.DATABASE_URL);

    // --- أولاً: منطق جلب البيانات (GET) ---
    if (req.method === 'GET') {
        const { user_name } = req.query;
        try {
            const rows = await sql`
                SELECT * FROM notifications 
                WHERE اسم_المستخدمة = ${user_name || 'زائرة رقة'} 
                ORDER BY تاريخ_التحديث DESC
            `;
            return res.status(200).json({ success: true, notifications: rows });
        } catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
    }

    // --- ثانياً: منطق حفظ البيانات (POST) ---
    if (req.method === 'POST') {
        // استخراج البيانات بناءً على هيكل الجدول الجديد
        const { 
            اسم_المستخدمة, العمر, الوزن_الحالي, الطول_سم, فصيلة_الدم,
            تاريخ_آخر_حيض, مدة_الدورة_بالأيام, موعد_التبويض_المتوقع,
            هل_يوجد_حمل, أسبوع_الحمل, موعد_الولادة_المتوقع,
            هل_توجد_رضاعة, مدة_الرضاعة_بالشهور,
            موعد_الطبيب_القادم, تخصص_الطبيب, الأدوية_الموصوفة, ملاحظات_صحية,
            category, value // البيانات القادمة من الواجهة للتحليل
        } = req.body;

        try {
            let aiAdvice = `تم تحديث بيانات ${category} بنجاح ✨`;

            // جلب نصيحة من GROQ 
            try {
                const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: "mixtral-8x7b-32768",
                        messages: [
                            { role: "system", content: "أنتِ طبيبة رقة. قدمي نصيحة طبية قصيرة جداً ورقيقة بناءً على بيانات المستخدمة." },
                            { role: "user", content: `الفئة: ${category}، القيمة: ${value}، الحالة: ${ملاحظات_صحية || 'متابعة دورية'}` }
                        ]
                    })
                });
                const groqData = await groqRes.json();
                if (groqData?.choices?.[0]) {
                    aiAdvice = groqData.choices[0].message.content;
                }
            } catch (aiError) {
                console.error("AI Error:", aiError);
            }

            // الحفظ في جدول notifications بالأعمدة الجديدة
            await sql`
                INSERT INTO notifications (
                    اسم_المستخدمة, العمر, الوزن_الحالي, الطول_سم, فصيلة_الدم,
                    تاريخ_آخر_حيض, مدة_الدورة_بالأيام, موعد_التبويض_المتوقع,
                    هل_يوجد_حمل, أسبوع_الحمل, موعد_الولادة_المتوقع,
                    هل_توجد_رضاعة, مدة_الرضاعة_بالشهور,
                    موعد_الطبيب_القادم, تخصص_الطبيب, الأدوية_الموصوفة, ملاحظات_صحية,
                    نص_الإشعار_الحالي, حالة_التنبيه, تاريخ_التحديث
                )
                VALUES (
                    ${اسم_المستخدمة || 'زائرة رقة'}, ${العمر || null}, ${الوزن_الحالي || null}, ${الطول_سم || null}, ${فصيلة_الدم || null},
                    ${تاريخ_آخر_حيض || null}, ${مدة_الدورة_بالأيام || 28}, ${موعد_التبويض_المتوقع || null},
                    ${هل_يوجد_حمل || false}, ${أسبوع_الحمل || null}, ${موعد_الولادة_المتوقع || null},
                    ${هل_توجد_رضاعة || false}, ${مدة_الرضاعة_بالشهور || null},
                    ${موعد_الطبيب_القادم || null}, ${تخصص_الطبيب || null}, ${الأدوية_الموصوفة || null}, ${ملاحظات_صحية || null},
                    ${aiAdvice}, 'نشط', NOW()
                );
            `;

            // المزامنة مع Pipedream 
            try {
                await fetch('https://eoo9361730x7onl.m.pipedream.net', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        user_name: اسم_المستخدمة,
                        advice: aiAdvice,
                        category: category,
                        timestamp: new Date().toISOString()
                    })
                });
            } catch (pipeError) {
                console.error("Pipedream Error:", pipeError);
            }

            return res.status(200).json({ success: true, advice: aiAdvice });

        } catch (dbError) {
            console.error("Database Error:", dbError);
            return res.status(500).json({ error: "فشل في تسجيل البيانات في الجدول الجديد" });
        }
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
}
