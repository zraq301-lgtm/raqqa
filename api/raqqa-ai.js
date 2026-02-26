export default async function handler(req, res) {
    // إعدادات CORS للسماح بالاتصال
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

    const { prompt } = req.body;
    const mixedbreadKey = process.env.MIXEDBREAD_API_KEY;
    const storeId = "66de0209-e17d-4e42-81d1-3851d5a0d826";
    const replicateToken = process.env.REPLICATE_API_TOKEN;

    try {
        // 1. استخراج رابط الصورة
        const imageUrl = prompt.match(/https?:\/\/[^\s]+\.(jpg|jpeg|png|webp)/i)?.[0];

        // 2. جلب السياق من Mixedbread
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

        // 3. الاتصال بـ Replicate عبر HTTP مباشرة (لتجنب خطأ Module Not Found)
        const replicateResponse = await fetch("https://api.replicate.com/v1/predictions", {
            method: "POST",
            headers: {
                "Authorization": `Token ${replicateToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                version: "11e483980757d478198a23c31671520624f0c406380645479a61327177579c31", // Llama 3.2 Vision
                input: {
                    prompt: `أنتِ 'رقة'... استعيني بهذا المحتوى: ${context}\n\nالسؤال: ${prompt}`,
                    image: imageUrl || undefined,
                    max_tokens: 512
                }
            })
        });

        let prediction = await replicateResponse.json();

        // انتظر النتيجة (Replicate يحتاج وقت للمعالجة)
        while (prediction.status !== "succeeded" && prediction.status !== "failed") {
            await new Promise(resolve => setTimeout(resolve, 1000));
            const statusRes = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
                headers: { "Authorization": `Token ${replicateToken}` }
            });
            prediction = await statusRes.json();
        }

        const fullResponse = Array.isArray(prediction.output) ? prediction.output.join("") : prediction.output;

        res.status(200).json({ message: fullResponse || "عذراً، لم أتمكن من الحصول على رد." });

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "حدث خطأ في النظام الداخلي." });
    }
}
