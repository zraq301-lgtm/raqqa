export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', '*');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

    const { prompt } = req.body;
    const groqKey = process.env.GROQ_API_KEY; //
    const mxbKey = process.env.MXBAI_API_KEY; //
    const storeId = "66de0209-e17d-4e42-81d1-3851d5a0d826"; //

    try {
        const urlRegex = /https?:\/\/[^\s]+(?:png|jpg|jpeg|webp)/gi;
        const imageUrl = (prompt.match(urlRegex) || [])[0];
        const cleanText = prompt.replace(urlRegex, '').replace(/\(تم إرسال وسائط للمعالجة\.\.\.\)/g, '').trim();

        // 1. جلب السياق من التخصص
        let context = "";
        try {
            const mxbRes = await fetch(`https://api.mixedbread.ai/v1/stores/${storeId}/query`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${mxbKey}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: cleanText || "تحليل", top_k: 2 })
            });
            if (mxbRes.ok) {
                const mxbData = await mxbRes.json();
                if (mxbData?.hits) context = mxbData.hits.map(h => h.content).join("\n\n");
            }
        } catch (e) { console.error("MXB Error"); }

        // 2. إعداد محتوى الرسائل بشكل صارم لمتطلبات Groq
        let payload;
        if (imageUrl) {
            payload = {
                model: "llama-3.2-11b-vision-preview",
                messages: [{
                    role: "user",
                    content: [
                        { type: "text", text: `أنتِ 'رقة'... السياق: ${context}\n\n حللي الصورة بلباقة وأجيبي: ${cleanText || 'وصفي محتوى الصورة'}` },
                        { type: "image_url", image_url: { url: imageUrl } }
                    ]
                }],
                max_tokens: 1024
            };
        } else {
            payload = {
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: `أنتِ 'رقة'... السياق: ${context}` },
                    { role: "user", content: cleanText }
                ],
                temperature: 0.6
            };
        }

        // 3. طلب الرد
        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${groqKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await groqRes.json();

        if (data.choices && data.choices[0]) {
            res.status(200).json({ message: data.choices[0].message.content });
        } else {
            // سجل الخطأ الفعلي من Groq لمعرفة السبب (مثل رابط غير متاح للعامة)
            console.error("Groq detailed error:", data);
            res.status(200).json({ message: "أهلاً بكِ، واجهت رقة صعوبة تقنية في فتح الصورة، يرجى المحاولة بعد لحظات." });
        }

    } catch (error) {
        res.status(500).json({ message: "حدث خطأ في النظام الداخلي." });
    }
}
