export default async function handler(req, res) {
    // إعدادات CORS الاحترافية
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

    const { prompt } = req.body;
    
    // سحب المتغيرات من البيئة بناءً على الصور المرفقة
    const groqKey = process.env.GROQ_API_KEY; //
    const mxbKey = process.env.MXBAI_API_KEY; //
    const replicateToken = process.env.REPLICATE_API_TOKEN; //
    const storeId = "66de0209-e17d-4e42-81d1-3851d5a0d826"; //

    try {
        // 1. الفرز الذكي: هل توجد صورة في الرسالة؟
        const urlRegex = /https?:\/\/[^\s]+(?:png|jpg|jpeg|webp)/gi;
        const imageUrl = (prompt.match(urlRegex) || [])[0];
        const cleanText = prompt.replace(urlRegex, '').replace(/\(تم إرسال وسائط للمعالجة\.\.\.\)/g, '').trim();

        // 2. جلب السياق من Mixedbread (يتم دائماً لتغذية الرد)
        let context = "";
        try {
            const mxbRes = await fetch(`https://api.mixedbread.ai/v1/stores/${storeId}/query`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${mxbKey}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: cleanText || "تحليل صورة", top_k: 2 })
            });
            const mxbData = await mxbRes.json();
            if (mxbData.hits) context = mxbData.hits.map(h => h.content).join("\n\n");
        } catch (e) { console.error("MXB Error"); }

        // 3. مسار المعالجة
        if (imageUrl) {
            // مسار الصور: استخدام Replicate (تحليل عميق)
            const repRes = await fetch("https://api.replicate.com/v1/predictions", {
                method: "POST",
                headers: { "Authorization": `Token ${replicateToken}`, "Content-Type": "application/json" },
                body: JSON.stringify({
                    version: "11e483980757d478198a23c31671520624f0c406380645479a61327177579c31", // Llama 3.2 Vision
                    input: { prompt: `أنتِ رقة... السياق: ${context}. حللي هذه الصورة بلباقة.`, image: imageUrl }
                })
            });
            
            let prediction = await repRes.json();
            let attempts = 0;
            // انتظار النتيجة (Polling)
            while (prediction.status !== "succeeded" && prediction.status !== "failed" && attempts < 20) {
                await new Promise(r => setTimeout(r, 1500));
                const check = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
                    headers: { "Authorization": `Token ${replicateToken}` }
                });
                prediction = await check.json();
                attempts++;
            }
            const output = Array.isArray(prediction.output) ? prediction.output.join("") : prediction.output;
            return res.status(200).json({ message: output || "تم استلام الصورة، كيف أساعدكِ فيها؟" });

        } else {
            // مسار النصوص: استخدام Groq (سرعة فائقة)
            const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${groqKey}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile",
                    messages: [
                        { role: "system", content: `أنتِ 'رقة'... استعيني بهذا السياق للرد: ${context}` },
                        { role: "user", content: cleanText }
                    ],
                    temperature: 0.6
                })
            });
            const groqData = await groqRes.json();
            return res.status(200).json({ message: groqData.choices[0].message.content });
        }

    } catch (error) {
        console.error("Critical Error:", error);
        res.status(500).json({ message: "رقة واجهت سحابة عابرة، حاولي مجدداً." });
    }
}
