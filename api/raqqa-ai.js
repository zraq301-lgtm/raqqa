export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const { prompt } = req.body;
    const groqKey = process.env.GROQ_API_KEY; 
    const mxbKey = process.env.MXBAI_API_KEY;
    const storeId = "66de0209-e17d-4e42-81d1-3851d5a0d826";

    // 1. منطق توليد (رسم) الصور - إذا بدأ المستخدم بكلمة "ارسم" أو "تخيل"
    const imageKeywords = ["ارسم", "تخيل", "صورة لـ", "صورة ل"];
    if (imageKeywords.some(keyword => prompt.startsWith(keyword))) {
        const imageDescription = prompt.replace(/ارسم|تخيل|صورة لـ|صورة ل/g, "").trim();
        // استخدام Pollinations.ai المجاني تماماً
        const generatedImageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(imageDescription)}?width=1024&height=1024&nologo=true&seed=${Date.now()}`;
        
        return res.status(200).json({ 
            message: `تفضلي، لقد رسمتُ لكِ ما طلبتِ: \n\n ![Image](${generatedImageUrl})` 
        });
    }

    try {
        // 2. منطق تحليل الصور (Vision) - إذا احتوى النص على رابط صورة
        const imageRegex = /https?:\/\/\S+\.(jpg|jpeg|png|webp|gif)/i;
        const foundImageUrl = prompt.match(imageRegex);

        let groqModel = "llama-3.3-70b-versatile"; // النموذج الافتراضي للنصوص
        let messages = [];

        if (foundImageUrl) {
            // استخدام نموذج الرؤية من Groq (مجاني)
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
            // 3. البحث في مكتبة Mixedbread (RAG) في حالة النصوص فقط
            let libraryContext = "";
            try {
                const mxbRes = await fetch(`https://api.mixedbread.ai/v1/stores/${storeId}/query`, {
                    method: 'POST',
                    headers: { 
                        'Authorization': `Bearer ${mxbKey}`,
                        'Content-Type': 'application/json' 
                    },
                    body: JSON.stringify({ query: prompt, top_k: 3 })
                });

                if (mxbRes.ok) {
                    const mxbData = await mxbRes.json();
                    libraryContext = mxbData?.hits?.map(h => h.content).join("\n\n") || "";
                }
            } catch (err) {
                console.error("Mixedbread Error: ", err.message);
            }

            const systemPrompt = libraryContext 
                ? `أنتِ رقة، مساعدة خبيرة. استخدمي المعلومات التالية للرد بدقة: ${libraryContext}`
                : "أنتِ رقة، ذكاء اصطناعي لبق وذكي. أجيبي على الأسئلة بوضوح.";

            messages = [
                { role: "system", content: systemPrompt },
                { role: "user", content: prompt }
            ];
        }

        // إرسال الطلب لـ Groq (سواء كان تحليل صورة أو نص)
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
            throw new Error("فشل رد الذكاء الاصطناعي");
        }

    } catch (error) {
        console.error("Final API Error:", error);
        res.status(200).json({ message: "عذراً رقيقة، رقة تواجه ضغطاً في الاتصال حالياً. حاولي مرة أخرى." });
    }
}
