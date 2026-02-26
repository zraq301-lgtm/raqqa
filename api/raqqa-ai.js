export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const { prompt } = req.body;
    // التقاط رابط الصورة من Vercel Blob
    const urlRegex = /https?:\/\/[^\s]+(?:png|jpg|jpeg|webp)/gi;
    const imageUrl = (prompt.match(urlRegex) || [])[0];
    const cleanText = prompt.replace(urlRegex, '').trim();

    const apiKey = process.env.GROQ_API_KEY; //
    const mxbKey = process.env.MXBAI_API_KEY; //
    const storeId = "66de0209-e17d-4e42-81d1-3851d5a0d826"; //

    try {
        // 1. جلب التخصص من Mixedbread
        let context = "";
        const mxbRes = await fetch(`https://api.mixedbread.ai/v1/stores/${storeId}/query`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${mxbKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: cleanText || "تحليل صورة", top_k: 2 })
        });
        const mxbData = await mxbRes.json();
        if (mxbData.hits) context = mxbData.hits.map(h => h.content).join("\n\n");

        // 2. إعداد محتوى الرسالة لـ Groq (نص + صورة إن وجدت)
        const messageContent = [];
        if (cleanText) messageContent.push({ type: "text", text: `أنتِ 'رقة'... السياق المتخصص: ${context}\n\nالسؤال: ${cleanText}` });
        if (imageUrl) messageContent.push({ type: "image_url", image_url: { url: imageUrl } });

        // 3. الطلب الموحد والسريع من Groq Vision
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: imageUrl ? "llama-3.2-11b-vision-preview" : "llama-3.3-70b-versatile",
                messages: [{ role: "user", content: messageContent }],
                temperature: 0.5
            })
        });

        const data = await response.json();
        
        if (data.choices && data.choices[0]) {
            res.status(200).json({ message: data.choices[0].message.content });
        } else {
            res.status(200).json({ message: "أهلاً بكِ، واجهت رقة صعوبة في قراءة الصورة، هل يمكنكِ إعادة إرسالها؟" });
        }
    } catch (error) {
        res.status(500).json({ message: "حدث خطأ في الاتصال، حاولي مرة أخرى." });
    }
}
