import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
    
    const { user_id, category, value, note } = req.body;

    try {
        // 1. الحفظ في قاعدة البيانات أولاً (هذا الجزء يعمل دائماً)
        await sql`
            INSERT INTO health_tracking (user_id, category, numeric_value, text_note)
            VALUES (${user_id}, ${category}, ${value}, ${note});
        `;

        // نصيحة افتراضية في حال فشل الذكاء الاصطناعي لتجنب خطأ 500
        let aiAdvice = `تم تسجيل ${category} بقيمة ${value} بنجاح في رقة ✨`;

        // 2. محاولة جلب نصيحة من GROQ بشكل آمن
        try {
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
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

            const data = await response.json();
            
            // التحقق من وجود الرد قبل القراءة لتجنب TypeError
            if (data && data.choices && data.choices[0]) {
                aiAdvice = data.choices[0].message.content;
            }
        } catch (aiError) {
            console.error("خطأ في الذكاء الاصطناعي ولكن سنكمل الحفظ:", aiError);
        }

        // 3. كتابة الإشعار النهائي (سواء كان ذكياً أو افتراضياً)
        await sql`
            INSERT INTO notifications (user_id, title, body)
            VALUES (${user_id}, 'تنبيه من رقة ✨', ${aiAdvice});
        `;

        return res.status(200).json({ success: true, advice: aiAdvice });

    } catch (dbError) {
        console.error("خطأ في قاعدة البيانات:", dbError);
        return res.status(500).json({ error: "فشل في الاتصال بقاعدة البيانات" });
    }
        }
