export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ reply: 'Method Not Allowed' });

    const { prompt } = req.body;
    
    // المفاتيح الخاصة بكِ من إعدادات Vercel
    const apiKey = process.env.RAQQA_SECRET_AI; 
    const mixedbreadKey = process.env.MIXEDBREAD_API_KEY;

    try {
        // 1. جلب المحتوى المخصص من Mixedbread (البحث في بياناتك المرفوعة)
        let context = "";
        try {
            const mxbResponse = await fetch('https://api.mixedbread.ai/v1/retrieval', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${mixedbreadKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: "mixedbread-ai/mxbai-embed-large-v1", // تأكدي من الموديل المستخدم في حسابك
                    query: prompt,
                    top_k: 3 // جلب أكثر 3 فقرات صلة بسؤال المستخدمة
                })
            });
            const mxbData = await mxbResponse.json();
            if (mxbData.data) {
                context = mxbData.data.map(item => item.content).join("\n\n");
            }
        } catch (e) {
            console.error("Mixedbread Error:", e);
            // في حال فشل Mixedbread يستمر البرنامج للرد العام لضمان عدم توقف الشات
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
                temperature: 0.5 // تقليل الـ temperature لضمان الالتزام بالمحتوى المرفوع
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
