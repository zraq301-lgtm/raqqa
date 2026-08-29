export default async function handler(req, res) {
    // إعدادات CORS للسماح بالاتصال المباشر من التطبيق
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const { prompt, message: inputMsg, storeData } = req.body;
    // دعم قراءة المدخلات من prompt أو message
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

        // 2. إعداد نموذج النص المتاح من قائمتك في Groq
        let groqModel = "openai/gpt-oss-120b"; 
        let messages = [];

        if (foundImageUrl) {
            groqModel = "llama-3.2-11b-vision-preview";
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
            // دمج إحصائيات المتجر إن وجدت في الطلب
            const storeStatsContext = storeData ? `\nبيانات المتجر الإحصائية الحالية:\n${JSON.stringify(storeData, null, 2)}` : "";
            
            const systemPrompt = libraryContext 
                ? `أنتِ رقة، مساعدة خبيرة. استخدمي المعلومات التالية من المكتبة للرد بدقة: ${libraryContext}${storeStatsContext}`
                : `أنتِ مستشار ذكي مالي وإداري وتسويقي متكافئ وخبير. أجيبي على الأسئلة بوضوح وبطريقة احترافية لتطوير الأعمال.${storeStatsContext}`;
            
            messages = [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ];
        }

        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${groqKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: groqModel,
                messages: messages,
                temperature: 0.6
            })
        });

        const data = await groqRes.json();
        
        if (data.choices && data.choices[0]) {
            const replyText = data.choices[0].message.content;
            res.status(200).json({ reply: replyText, message: replyText });
        } else {
            console.error("Groq Response Error:", data);
            throw new Error(data.error?.message || "فشل رد الذكاء الاصطناعي");
        }

    } catch (error) {
        console.error("Final API Error:", error);
        const fallbackMsg = "عذراً رقيقة، رقة تواجه ضغطاً في الاتصال حالياً. حاولي مرة أخرى.";
        res.status(200).json({ reply: fallbackMsg, message: fallbackMsg });
    }
}
