export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ reply: 'Method Not Allowed' });

    const { prompt } = req.body;
    
    // المفاتيح الخاصة بكِ من إعدادات Vercel
    const apiKey = process.env.RAQQA_SECRET_AI; 
    const mixedbreadKey = process.env.MIXEDBREAD_API_KEY;
    // الـ ID الخاص بالـ Store الذي زودتني به
    const storeId = "66de0209-e17d-4e42-81d1-3851d5a0d826";

    try {
        // 1. جلب المحتوى المخصص من Mixedbread (البحث في الملفات المرفوعة داخل الـ Store)
        let context = "";
        try {
            const mxbResponse = await fetch(`https://api.mixedbread.ai/v1/stores/${storeId}/query`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${mixedbreadKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    query: prompt,
                    top_k: 3 // جلب أكثر 3 فقرات صلة بسؤال المستخدمة من ملفاتك
                })
            });
            const mxbData = await mxbResponse.json();
            
            // استخراج المحتوى من النتائج (hits)
            if (mxbData.hits) {
                context = mxbData.hits.map(item => item.content).join("\n\n");
            }
        } catch (e) {
            console.error("Mixedbread Error:", e);
        }

        // 2. إرسال السياق المخصص إلى Groq للحصول على الرد النهائي
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile", 
                messages: [
                    { 
                        role: "system", 
                        content: `أنتِ 'رقة' - مساعدة ذكية للنساء. أسلوبك: دافئ، رقيق، ومختصر. 
                        يجب أن تكون إجابتك مستمدة بدقة من "المحتوى المرفق" أدناه. 
                        إذا لم تجدي المعلومة في المحتوى، ردي بأسلوبك الرقيق المعتاد ولكن بحدود المعرفة العامة.
                        
                        المحتوى المرفق:
                        ${context}` 
                    },
                    { role: "user", content: prompt }
                ],
                temperature: 0.5 
            })
        });

        const data = await response.json();

        if (data.choices && data.choices[0]) {
            res.status(200).json({ reply: data.choices[0].message.content });
        } else {
            console.error("Error Detail:", data);
            res.status(200).json({ reply: "عذراً رقيقة، واجهت مشكلة في قراءة المكتبة الخاصة بي." });
        }
    } catch (error) {
        res.status(500).json({ reply: "حدث خطأ في الشبكة، حاولي مرة أخرى يا رفيقتي." });
    }
    }
