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

    try {
        // 1. البحث أولاً في مكتبة Mixedbread المتخصصة
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
                    top_k: 3 // جلب أفضل 3 نتائج متعلقة
                })
            });

            if (mxbRes.ok) {
                const mxbData = await mxbRes.ok ? await mxbRes.json() : null;
                // تجميع النصوص المسترجعة من المكتبة
                libraryContext = mxbData?.hits?.map(h => h.content).join("\n\n") || "";
            }
        } catch (err) {
            console.error("Mixedbread Error: ", err.message);
        }

        // 2. توجيه الطلب إلى Groq مع سياق المكتبة إن وجد
        // إذا لم تكن هناك معلومات في المكتبة، سيعتمد Groq على ذكائه العام
        const systemPrompt = libraryContext 
            ? `أنتِ رقة، مساعدة خبيرة. استخدمي المعلومات التالية من المكتبة للرد بدقة: ${libraryContext}`
            : "أنتِ رقة، ذكاء اصطناعي لبق وذكي. أجيبي على الأسئلة بوضوح.";

        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${groqKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile", // موديل قوي جداً وسريع
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: prompt }
                ],
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
