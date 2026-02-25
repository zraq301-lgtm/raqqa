import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
    // --- إعدادات CORS الموحدة ---
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // الاتصال بقاعدة البيانات باستخدام المفتاح المعتمد في الصورة
    const sql = neon(process.env.DATABASE_URL);

    // --- أولاً: منطق جلب البيانات (GET) ---
    if (req.method === 'GET') {
        const { user_id } = req.query;
        try {
            const rows = await sql`
                SELECT id, title, body, created_at 
                FROM notifications 
                WHERE user_id = ${parseInt(user_id || 1)} AND is_read = FALSE 
                ORDER BY created_at DESC
            `;
            return res.status(200).json({ success: true, notifications: rows });
        } catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
    }

    // --- ثانياً: منطق حفظ البيانات (POST) ---
    if (req.method === 'POST') {
        const { user_id, category, value, note } = req.body;

        try {
            let aiAdvice = `تم تسجيل ${category} بنجاح في رقة ✨`;

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

            // الحفظ في جدول notifications
            await sql`
                INSERT INTO notifications (user_id, title, body, created_at)
                VALUES (${user_id || 1}, 'تنبيه من رقة ✨', ${aiAdvice}, NOW());
            `;

            // المزامنة مع Pipedream
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
            return res.status(500).json({ error: "فشل في تسجيل البيانات في قاعدة البيانات" });
        }
    }

    // إذا تم استخدام طريقة أخرى غير GET أو POST
    return res.status(405).json({ error: 'Method Not Allowed' });
}
