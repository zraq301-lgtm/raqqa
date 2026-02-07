import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
    // --- بداية إعدادات CORS ---
    // السماح لجميع المصادر بالوصول (ضروري جداً لعمل الـ APK)
    res.setHeader('Access-Control-Allow-Origin', '*');
    // السماح بطرق الإرسال المطلوبة
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    // السماح بالعناوين (Headers) التي يرسلها التطبيق
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // معالجة طلب الـ "Preflight" (المتصفحات والـ WebView ترسل طلب OPTIONS قبل الـ POST)
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    // --- نهاية إعدادات CORS ---

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }
    
    const { user_id, category, value, note } = req.body;

    try {
        // الاتصال بـ Neon
        const sql = neon(process.env.POSTGRES_URL);

        let aiAdvice = `تم تسجيل ${category} بنجاح في رقة ✨`;

        // 1. جلب نصيحة رقيقة من GROQ لزيادة التفاعل
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

        // 2. الحفظ في جدول notifications الموحد في Neon
        await sql`
            INSERT INTO notifications (user_id, title, body)
            VALUES (${user_id || 1}, 'تنبيه من رقة ✨', ${aiAdvice});
        `;

        // 3. إرسال البيانات إلى Pipedream للمزامنة الإضافية
        try {
            await fetch('https://eoo9361730x7onl.m.pipedream.net', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user_id,
                    title: 'تنبيه جديد من رقة',
                    body: aiAdvice,
                    category: category,
                    value: value
                })
            });
        } catch (pipeError) {
            console.error("Pipedream Error:", pipeError);
        }

        return res.status(200).json({ success: true, advice: aiAdvice });

    } catch (dbError) {
        console.error("Database Error:", dbError);
        return res.status(500).json({ error: "فشل في تسجيل البيانات في نيون" });
    }
}
