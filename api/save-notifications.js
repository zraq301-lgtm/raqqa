import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
    // --- إعدادات CORS ---
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // التأكد من أن نوع الطلب POST (للحفظ)
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }
    
    const { user_id, category, value, note } = req.body;

    try {
        const sql = neon(process.env.POSTGRES_URL);

        let aiAdvice = `تم تسجيل ${category} بنجاح في رقة ✨`;

        // 1. جلب نصيحة من AI (GROQ)
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
                        { role: "system", content: "أنتِ طبيبة رقة. قدمي نصيحة طبية قصيرة جداً ورقيقة." },
                        { role: "user", content: `الفئة: ${category}، القيمة: ${value}` }
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

        // 2. الحفظ في جدول notifications (توجيه الإشعار للجدول المطلوب)
        // تم التأكد من أن اسم الجدول هو notifications ليطابق منطق ملفات الجلب لديك
        await sql`
            INSERT INTO notifications (user_id, title, body, created_at)
            VALUES (${user_id || 1}, 'تنبيه من رقة ✨', ${aiAdvice}, NOW());
        `;

        // 3. مزامنة إضافية مع Pipedream
        try {
            await fetch('https://eoo9361730x7onl.m.pipedream.net', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user_id,
                    title: 'تنبيه جديد من رقة',
                    body: aiAdvice,
                    category: category,
                    value: value,
                    timestamp: new Date().toISOString()
                })
            });
        } catch (pipeError) {
            console.error("Pipedream Error:", pipeError);
        }

        return res.status(200).json({ success: true, advice: aiAdvice });

    } catch (dbError) {
        console.error("Database Error:", dbError);
        return res.status(500).json({ error: "فشل في تسجيل البيانات في جدول notifications" });
    }
}
