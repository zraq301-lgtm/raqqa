export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'الطريقة غير مسموحة' });
    }

    const { prompt } = req.body;
    // تأكدي أن هذا المتغير بنفس الاسم في إعدادات Vercel
    const apiKey = process.env.GROQ_API_KEY; 

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "mixtral-8x7b-32768",
                messages: [
                    { role: "system", content: "أنتِ رقة، مساعدة ذكية وصديقة وفية للنساء. أجيبي برقة واحترام وباللغة العربية." },
                    { role: "user", content: prompt }
                ]
            })
        });

        const data = await response.json();
        
        // التحقق من أن الرد يحتوي على البيانات المطلوبة قبل إرسالها
        if (data.choices && data.choices[0] && data.choices[0].message) {
            res.status(200).json({ reply: data.choices[0].message.content });
        } else {
            console.error("Groq Error:", data);
            res.status(500).json({ reply: "عذراً رقيقة، واجهت مشكلة في التفكير حالياً." });
        }
    } catch (error) {
        res.status(500).json({ reply: "خطأ في الاتصال بالذكاء الاصطناعي." });
    }
              }
