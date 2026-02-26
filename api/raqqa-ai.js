export default async function handler(req, res) {
    // 1. إعدادات CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const { prompt } = req.body;
    
    // المفاتيح (أضيفي GEMINI_API_KEY في Vercel يدوياً)
    const groqKey = process.env.GROQ_API_KEY; 
    const mxbKey = process.env.MXBAI_API_KEY; 
    const geminiKey = process.env.GEMINI_API_KEY; 
    const storeId = "66de0209-e17d-4e42-81d1-3851d5a0d826"; 

    try {
        const urlRegex = /https?:\/\/[^\s]+(?:png|jpg|jpeg|webp)/gi;
        const imageUrl = (prompt.match(urlRegex) || [])[0];
        const cleanText = prompt.replace(urlRegex, '').replace(/\(تم إرسال وسائط للمعالجة\.\.\.\)/g, '').trim();

        // 2. جلب السياق من Mixedbread (Mix)
        let context = "";
        try {
            const mxbRes = await fetch(`https://api.mixedbread.ai/v1/stores/${storeId}/query`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${mxbKey}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: cleanText || "تحليل", top_k: 2 })
            });
            if (mxbRes.ok) {
                const mxbData = await mxbRes.json();
                context = mxbData.hits?.map(h => h.content).join("\n\n") || "";
            }
        } catch (e) { console.error("Mix Error"); }

        // 3. التوجيه الذكي: إذا وجدت صورة تذهب لـ Gemini، إذا نص فقط يذهب لـ Groq
        if (imageUrl) {
            // استدعاء Gemini لتحليل الصورة
            const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            { text: `أنتِ رقة، خبيرة متخصصة. السياق: ${context}\n\n حللي الصورة وأجيبي بلباقة: ${cleanText}` },
                            { inline_data: { mime_type: "image/jpeg", data: await getBase64(imageUrl) } }
                        ]
                    }]
                })
            });
            const data = await geminiRes.json();
            return res.status(200).json({ message: data.candidates[0].content.parts[0].text });
        } else {
            // استدعاء Groq للرد النصي السريع
            const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${groqKey}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile",
                    messages: [
                        { role: "system", content: `أنتِ رقة. السياق: ${context}` },
                        { role: "user", content: cleanText }
                    ]
                })
            });
            const groqData = await groqRes.json();
            return res.status(200).json({ message: groqData.choices[0].message.content });
        }

    } catch (error) {
        res.status(200).json({ message: "أهلاً بكِ رقيقة، رقة تقوم بضبط الأنظمة الآن، جربي بعد لحظة." });
    }
}

// وظيفة مساعدة لتحويل الصورة لـ Gemini
async function getBase64(url) {
    const res = await fetch(url);
    const buffer = await res.arrayBuffer();
    return Buffer.from(buffer).toString('base64');
}
