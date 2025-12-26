// هذا الكود سيتعرف تلقائياً على GROQ_API_KEY و TAVILY_API_KEY من إعدادات فيرسل
export default async function handler(req, res) {
    const { prompt } = req.body;

    // 1. البحث في الويب عبر Tavily
    const searchRes = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            api_key: process.env.TAVILY_API_KEY,
            query: prompt,
            search_depth: "smart"
        })
    });
    const searchData = await searchRes.json();
    const context = searchData.results.map(r => r.content).join("\n");

    // 2. صياغة الرد برقة عبر Groq
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: "llama3-8b-8192",
            messages: [
                { role: "system", content: "أنتِ رقة، رفيقة أنثوية. استخدمي المعلومات التالية للرد برقة ومودة وبحث علمي رصين: " + context },
                { role: "user", content: prompt }
            ]
        })
    });

    const groqData = await groqRes.json();
    res.status(200).json({ reply: groqData.choices[0].message.content });
}
