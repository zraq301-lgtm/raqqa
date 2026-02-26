export default async function handler(req, res) {
    // 1. إعدادات CORS الاحترافية
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

    const { prompt } = req.body;
    
    // سحب مفاتيح البيئة المعرفة في Vercel
    const groqKey = process.env.GROQ_API_KEY; 
    const mxbKey = process.env.MXBAI_API_KEY; 
    const geminiKey = process.env.GEMINI_API_KEY; // المفتاح الذي أضفتِه يدوياً
    const storeId = "66de0209-e17d-4e42-81d1-3851d5a0d826"; //

    try {
        // 2. معالجة الروابط وتنظيف النص
        const urlRegex = /https?:\/\/[^\s]+(?:png|jpg|jpeg|webp)/gi;
        const imageUrl = (prompt.match(urlRegex) || [])[0];
        const cleanText = prompt.replace(urlRegex, '').replace(/\(تم إرسال وسائط للمعالجة\.\.\.\)/g, '').trim();

        // 3. جلب السياق من Mixedbread
        let context = "";
        try {
            const mxbRes = await fetch(`https://api.mixedbread.ai/v1/stores/${storeId}/query`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${mxbKey}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: cleanText || "تحليل محتوى", top_k: 2 })
            });
            if (mxbRes.ok) {
                const mxbData = await mxbRes.json();
                if (mxbData && mxbData.hits) {
                    context = mxbData.hits.map(h => h.content).join("\n\n");
                }
            }
        } catch (e) { console.error("Mixedbread bypass"); }

        // 4. التوجيه الذكي: الصور لـ Gemini والنصوص لـ Groq
        if (imageUrl) {
            // استخدام Gemini للتحليل البصري باستخدام المفتاح الجديد
            const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            { text: `أنتِ رقة، مساعدة خبيرة. السياق: ${context}\n\n حللي الصورة وأجيبي: ${cleanText || 'وصفي الصورة'}` },
                            { inline_data: { mime_type: "image/jpeg", data: await getBase64(imageUrl) } }
                        ]
                    }]
                })
            });

            const gData = await geminiRes.json();
            if (gData.candidates && gData.candidates[0]) {
                return res.status(200).json({ message: gData.candidates[0].content.parts[0].text });
            }
        } 

        // 5. استخدام Groq للردود النصية السريعة
        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${groqKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: `أنتِ رقة. السياق: ${context}` },
                    { role: "user", content: cleanText || "مرحباً" }
                ],
                max_tokens: 800
            })
        });

        const data = await groqRes.json();
        if (data.choices && data.choices[0]) {
            res.status(200).json({ message: data.choices[0].message.content });
        } else {
            res.status(200).json({ message: "أهلاً بكِ رقيقة، رقة تقوم بتحديث أنظمتها، جربي مجدداً." });
        }

    } catch (error) {
        res.status(200).json({ message: "رقة واجهت مشكلة في الاتصال البصري، يرجى التحقق من المفاتيح." });
    }
}

// دالة تحويل الصورة لـ Gemini
async function getBase64(url) {
    const res = await fetch(url);
    const buffer = await res.arrayBuffer();
    return Buffer.from(buffer).toString('base64');
}
