export default async function handler(req, res) {
    // إعدادات CORS لضمان الاتصال من المتصفح
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const { prompt } = req.body;
    // التأكد من جلب المفتاح المضاف في Vercel
    const geminiKey = process.env.GEMINI_API_KEY; 

    try {
        // تنظيف النص من أي روابط صور لضمان التركيز على المحادثة فقط
        const cleanText = prompt.replace(/https?:\/\/[^\s]+/gi, '').trim();

        // استخدام موديل gemini-pro (المستقر جداً للنصوص) عبر إصدار v1
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${geminiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: `أنتِ رقة، خبيرة ذكية ولباقة. أجيبي على: ${cleanText || 'مرحباً'}` }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 800,
                }
            })
        });

        const data = await response.json();

        // فحص وجود أخطاء من جوجل وعرضها بوضوح في السجلات
        if (data.error) {
            console.error("Gemini Text Error:", data.error.message);
            return res.status(200).json({ message: "أهلاً بكِ رقيقة، رقة تقوم بضبط إعدادات النصوص حالياً، جربي مجدداً." });
        }

        if (data.candidates && data.candidates[0]) {
            res.status(200).json({ message: data.candidates[0].content.parts[0].text });
        } else {
            res.status(200).json({ message: "رقة مستعدة لسماعك، تفضلي بما لديكِ." });
        }

    } catch (error) {
        res.status(200).json({ message: "حدثت سحابة عابرة في الاتصال، رقة ستعود حالاً." });
    }
}
