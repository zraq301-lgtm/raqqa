export default async function handler(req, res) {
    // 1. إعدادات CORS الاحترافية لضمان عمل التطبيق
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

    const { prompt } = req.body;
    
    // سحب مفاتيح البيئة من إعدادات Vercel
    const groqKey = process.env.GROQ_API_KEY; 
    const mxbKey = process.env.MXBAI_API_KEY; 
    const geminiKey = process.env.GEMINI_API_KEY; 
    const storeId = "66de0209-e17d-4e42-81d1-3851d5a0d826"; // التأكيد على الـ ID الخاص بكِ

    try {
        // 2. معالجة المدخلات: استخراج الروابط وتنظيف النص
        const urlRegex = /https?:\/\/[^\s]+(?:png|jpg|jpeg|webp)/gi;
        const imageUrl = (prompt.match(urlRegex) || [])[0];
        const cleanText = prompt.replace(urlRegex, '').replace(/\(تم إرسال وسائط للمعالجة\.\.\.\)/g, '').trim();

        // 3. جلب السياق من المكتبة المتخصصة (Mixedbread) باستخدام المعرف الصحيح
        let context = "";
        try {
            const mxbRes = await fetch(`https://api.mixedbread.ai/v1/stores/${storeId}/query`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${mxbKey}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: cleanText || "تحليل محتوى بصري", top_k: 2 })
            });
            if (mxbRes.ok) {
                const mxbData = await mxbRes.json();
                if (mxbData && mxbData.hits) {
                    context = mxbData.hits.map(h => h.content).join("\n\n");
                }
            }
        } catch (e) { console.error("Mixedbread bypass"); }

        // 4. التوجيه الذكي: إذا وجدت صورة نستخدم Gemini، وللنصوص نستخدم Groq
        if (imageUrl) {
            // استدعاء Gemini 1.5 Flash للتحليل البصري (الأفضل والأكثر استقراراً للصور)
            const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            { text: `أنتِ رقة، مساعدة خبيرة ولباقة. السياق من مكتبتك: ${context}\n\n حللي الصورة وأجيبي: ${cleanText || 'وصفي الصورة بذكاء'}` },
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

        // 5. استدعاء Groq للنصوص لضمان سرعة الرد الفائقة
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
            res.status(200).json({ message: "أهلاً بكِ رقيقة، رقة تقوم بتنشيط أنظمتها الآن، جربي مجدداً." });
        }

    } catch (error) {
        res.status(200).json({ message: "حدث خطأ في الاتصال البصري، رقة ستحاول العودة قريباً." });
    }
}

// دالة مساعدة لتحويل الصورة إلى Base64 لـ Gemini
async function getBase64(url) {
    const res = await fetch(url);
    const buffer = await res.arrayBuffer();
    return Buffer.from(buffer).toString('base64');
}
