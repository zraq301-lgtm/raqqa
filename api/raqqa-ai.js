export default async function handler(req, res) {
    // إعدادات CORS للسماح بالاتصال من تطبيقك
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const { prompt } = req.body;
    const groqKey = process.env.GROQ_API_KEY; 
    const mxbKey = process.env.MXBAI_API_KEY;
    const storeId = "66de0209-e17d-4e42-81d1-3851d5a0d826";

    // --- [إضافة 1: ميزة الرسم المجانية] ---
    const imageKeywords = ["ارسم", "تخيل", "صورة لـ", "صورة ل"];
    if (imageKeywords.some(keyword => prompt?.startsWith(keyword))) {
        const imageDescription = prompt.replace(/ارسم|تخيل|صورة لـ|صورة ل/g, "").trim();
        const generatedImageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(imageDescription)}?width=1024&height=1024&nologo=true`;
        return res.status(200).json({ 
            message: `تفضلي يا رفيقتي، هذه هي الصورة التي تخيلتها لكِ: \n\n ![image](${generatedImageUrl})` 
        });
    }

    try {
        // --- [تعديل 2: فحص وجود رابط صورة للتحليل] ---
        const imageRegex = /https?:\/\/\S+\.(jpg|jpeg|png|webp|gif)/i;
        const foundImageUrl = prompt?.match(imageRegex);

        // 1. البحث أولاً في مكتبة Mixedbread المتخصصة (كما في كودك الأصلي)
        let libraryContext = "";
        try {
            const mxbRes = await fetch(`https://api.mixedbread.ai/v1/stores/${storeId}/query`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${mxbKey}`,
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify({ 
                    query: prompt,
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

        // 2. إعداد الطلب لـ Groq
        let groqModel = "llama-3.3-70b-versatile"; // النموذج الأصلي
        let messages = [];

        if (foundImageUrl) {
            // إذا وجد رابط صورة، نستخدم نموذج الرؤية
            groqModel = "llama-3.2-11b-vision-preview";
            messages = [
                {
                    role: "user",
                    content: [
                        { type: "text", text: prompt },
                        { type: "image_url", image_url: { url: foundImageUrl[0] } }
                    ]
                }
            ];
        } else {
            // الاستمرار بالوضع الأصلي للنصوص
            const systemPrompt = libraryContext 
                ? `أنتِ رقة، مساعدة خبيرة. استخدمي المعلومات التالية من المكتبة للرد بدقة: ${libraryContext}`
                : "أنتِ رقة، ذكاء اصطناعي لبق وذكي. أجيبي على الأسئلة بوضوح.";
            
            messages = [
                { role: "system", content: systemPrompt },
                { role: "user", content: prompt }
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
            res.status(200).json({ message: data.choices[0].message.content });
        } else {
            // لتجنب خطأ "فشل رد الذكاء الاصطناعي" عند وجود مشاكل في النموذج
            console.error("Groq Response Error:", data);
            throw new Error(data.error?.message || "فشل رد الذكاء الاصطناعي");
        }

    } catch (error) {
        console.error("Final API Error:", error);
        res.status(200).json({ message: "عذراً رقيقة، رقة تواجه ضغطاً في الاتصال حالياً. حاولي مرة أخرى." });
    }
}
