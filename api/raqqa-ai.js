export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ reply: 'Method Not Allowed' });

    const { prompt } = req.body;
    
    // تم تغيير الاسم هنا ليطابق حروفاً جديدة اخترناها لكِ
    const apiKey = process.env.RAQQA_SECRET_AI; 

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile", 
                messages: [
                    { role: "system", content: "أنتِ 'رقة' - مساعدة ذكية للنساء. أسلوبك: دافئ، رقيق، ومختصر. لغتك: العربية." },
                    { role: "user", content: prompt }
                ],
                temperature: 0.7
            })
        });

        const data = await response.json();

        if (data.choices && data.choices[0]) {
            res.status(200).json({ reply: data.choices[0].message.content });
        } else {
            console.error("Error Detail:", data);
            res.status(200).json({ reply: "عذراً رقيقة، يرجى التأكد من تطابق اسم المفتاح الجديد في Vercel." });
        }
    } catch (error) {
        res.status(500).json({ reply: "حدث خطأ في الشبكة، حاولي مرة أخرى." });
    }
}
