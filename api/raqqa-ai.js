export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ reply: 'الطريقة غير مسموحة' });
    }

    const { prompt } = req.body;
    const apiKey = process.env.GROQ_API_KEY;

    // فحص إذا كان المفتاح موجود أصلاً في إعدادات Vercel
    if (!apiKey) {
        return res.status(500).json({ reply: "المفتاح GROQ_API_KEY غير موجود في إعدادات Vercel." });
    }

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "llama3-8b-8192", // نموذج سريع ومستقر
                messages: [
                    { role: "system", content: "أنتِ رقة، مساعدة ذكية وصديقة وفية للنساء. أجيبي برقة واحترام وباللغة العربية." },
                    { role: "user", content: prompt }
                ],
                max_tokens: 500
            })
        });

        const data = await response.json();

        if (data.choices && data.choices[0]) {
            res.status(200).json({ reply: data.choices[0].message.content });
        } else {
            // في حال وجود خطأ من Groq نفسه (مثل انتهاء الكوتا)
            res.status(500).json({ reply: "عذراً، محرك الذكاء الاصطناعي لا يستجيب حالياً. تأكدي من صلاحية مفتاح GROQ." });
        }
    } catch (error) {
        res.status(500).json({ reply: "حدث خطأ في الاتصال بالخادم، يرجى المحاولة لاحقاً." });
    }
}
