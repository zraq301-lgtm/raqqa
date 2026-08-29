export default async function handler(req, res) {
    // إعدادات CORS للسماح بالاتصال المباشر من التطبيق
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const { prompt, message: inputMsg, storeData } = req.body;
    const userPrompt = prompt || inputMsg || "";

    const groqKey = process.env.GROQ_API_KEY; 
    const mxbKey = process.env.MXBAI_API_KEY;
    const storeId = "66de0209-e17d-4e42-81d1-3851d5a0d826";

    // --- [ميزة توليد الصور] ---
    const imageKeywords = ["ارسم", "تخيل", "صورة لـ", "صورة ل"];
    if (imageKeywords.some(keyword => userPrompt?.startsWith(keyword))) {
        const imageDescription = userPrompt.replace(/ارسم|تخيل|صورة لـ|صورة ل/g, "").trim();
        const generatedImageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(imageDescription)}?width=1024&height=1024&nologo=true`;
        const replyText = `تفضلي يا رفيقتي، هذه هي الصورة التي تخيلتها لكِ: \n\n ![image](${generatedImageUrl})`;
        return res.status(200).json({ reply: replyText, message: replyText });
    }

    try {
        // --- [فحص وجود روابط صور للتحليل] ---
        const imageRegex = /https?:\/\/\S+\.(jpg|jpeg|png|webp|gif)/i;
        const foundImageUrl = userPrompt?.match(imageRegex);

        // 1. البحث في مكتبة Mixedbread
        let libraryContext = "";
        try {
            const mxbRes = await fetch(`https://api.mixedbread.ai/v1/stores/${storeId}/query`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${mxbKey}`,
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify({ 
                    query: userPrompt,
                    top_k: 3 
                })
            });

            if (mxbRes.ok) {
                const mxbData = await mxbRes.json();
                libraryContext = mxbData?.hits?.map(h => h.content).join("\n\n") || "";
            }
        } catch (err) {
            console.error("Mixedbread Error: ", err.message);
        }

        // 2. تحديد النماذج المتاحة في حسابك بناءً على الصورة
        // النموذج الأساسي: openai/gpt-oss-120b، والاحتياطي: openai/gpt-oss-20b
        const candidateModels = foundImageUrl 
            ? ["llama-3.2-11b-vision-preview"] 
            : ["openai/gpt-oss-120b", "openai/gpt-oss-20b"];

        let messages = [];

        if (foundImageUrl) {
            messages = [
                {
                    role: "user",
                    content: [
                        { type: "text", text: userPrompt },
                        { type: "image_url", image_url: { url: foundImageUrl[0] } }
                    ]
                }
            ];
        } else {
            const storeStatsContext = storeData ? `\nبيانات المتجر الإحصائية الحالية:\n${JSON.stringify(storeData, null, 2)}` : "";
            
            const systemPrompt = libraryContext 
                ? `أنتِ رقة، مساعدة خبيرة. استخدمي المعلومات التالية من المكتبة للرد بدقة: ${libraryContext}${storeStatsContext}`
                : `أنتِ مستشار ذكي مالي وإداري وتسويقي متكافئ وخبير. أجيبي على الأسئلة بوضوح وبطريقة احترافية لتطوير الأعمال.${storeStatsContext}`;
            
            messages = [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ];
        }

        // المحاولة مع النماذج المتاحة بالتتابع
        let groqRes = null;
        let lastErrorData = null;

        for (const modelName of candidateModels) {
            const resFetch = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${groqKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: modelName,
                    messages: messages,
                    temperature: 0.6
                })
            });

            const resJson = await resFetch.json();

            if (resJson.choices && resJson.choices[0]) {
                groqRes = resJson;
                break; // تم الحصول على الرد بنجاح
            } else {
                console.warn(`Model ${modelName} failed, trying next fallback...`, resJson);
                lastErrorData = resJson;
            }
        }

        if (groqRes && groqRes.choices && groqRes.choices[0]) {
            const replyText = groqRes.choices[0].message.content;
            return res.status(200).json({ reply: replyText, message: replyText });
        } else {
            console.error("Groq Final Response Error:", lastErrorData);
            throw new Error(lastErrorData?.error?.message || "فشل رد الذكاء الاصطناعي");
        }

    } catch (error) {
        console.error("Final API Error:", error);
        const fallbackMsg = "عذراً رقيقة، رقة تواجه ضغطاً في الاتصال حالياً. حاولي مرة أخرى.";
        res.status(200).json({ reply: fallbackMsg, message: fallbackMsg });
    }
}
