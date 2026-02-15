export default async function handler(req, res) {
    // إضافة رؤوس CORS للسماح للـ APK بالاتصال بالسيرفر
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

    const { prompt } = req.body;
    const apiKey = process.env.RAQQA_SECRET_AI; 
    const mixedbreadKey = process.env.MIXEDBREAD_API_KEY;
    const storeId = "66de0209-e17d-4e42-81d1-3851d5a0d826";

    try {
        let context = "";
        try {
            const mxbResponse = await fetch(`https://api.mixedbread.ai/v1/stores/${storeId}/query`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${mixedbreadKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ query: prompt, top_k: 3 })
            });
            const mxbData = await mxbResponse.json();
            if (mxbData.hits) context = mxbData.hits.map(item => item.content).join("\n\n");
        } catch (e) { console.error("Mixedbread Error:", e); }

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile", 
                messages: [
                    { role: "system", content: `أنتِ 'رقة'... المحتوى: ${context}` },
                    { role: "user", content: prompt }
                ],
                temperature: 0.5 
            })
        });

        const data = await response.json();

        // التعديل الجوهري: تغيير reply إلى message لتعمل الواجهة
        if (data.choices && data.choices[0]) {
            res.status(200).json({ message: data.choices[0].message.content });
        } else {
            res.status(200).json({ message: "عذراً رقيقة، واجهت مشكلة في قراءة المكتبة." });
        }
    } catch (error) {
        res.status(500).json({ message: "حدث خطأ في الشبكة، حاولي مرة أخرى." });
    }
}
