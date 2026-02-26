export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', '*');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

    const { prompt } = req.body;
    const groqKey = process.env.GROQ_API_KEY; 
    const mxbKey = process.env.MXBAI_API_KEY; 
    const storeId = "66de0209-e17d-4e42-81d1-3851d5a0d826"; //

    try {
        // 1. استخراج رابط الصورة وتنظيف النص
        const urlRegex = /https?:\/\/[^\s]+(?:png|jpg|jpeg|webp)/gi;
        const imageUrl = (prompt.match(urlRegex) || [])[0];
        const cleanText = prompt.replace(urlRegex, '').replace(/\(تم إرسال وسائط للمعالجة\.\.\.\)/g, '').trim();

        // 2. جلب التخصص من Mixedbread
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
        } catch (e) { console.error("MXB Skip"); }

        // 3. التحقق من وجود صورة وبناء الطلب لـ Groq
        let messages = [];
        if (imageUrl) {
            // مسار الرؤية (Vision Path)
            messages = [{
                role: "user",
                content: [
                    { type: "text", text: `أنتِ 'رقة'... السياق: ${context}\n\n حللي هذه الصورة وأجيبي على: ${cleanText || 'ماذا يوجد في الصورة؟'}` },
                    { type: "image_url", image_url: { url: imageUrl } }
                ]
            }];
        } else {
            // مسار النص الصافي (Chat Path)
            messages = [
                { role: "system", content: `أنتِ 'رقة'... السياق: ${context}` },
                { role: "user", content: cleanText }
            ];
        }

        // 4. استدعاء الموديل المناسب
        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${groqKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                // استخدام موديل Vision محدد عند وجود صورة
                model: imageUrl ? "llama-3.2-11b-vision-preview" : "llama-3.3-70b-versatile",
                messages: messages,
                temperature: 0.6,
                max_tokens: 1024
            })
        });

        const data = await groqRes.json();

        // معالجة رد Groq
        if (data.choices && data.choices[0]) {
            res.status(200).json({ message: data.choices[0].message.content });
        } else if (data.error) {
            // إظهار نوع الخطأ في السجلات لمعرفته (مثل خطأ حجم الصورة أو صيغتها)
            console.error("Groq API Error:", data.error);
            res.status(200).json({ message: "رقة واجهت مشكلة في قراءة الرابط، تأكدي من جودة الصورة وحاولي مرة أخرى." });
        } else {
            res.status(200).json({ message: "عذراً رقيقة، لم أستطع تحليل الصورة، جربي رفعها مجدداً." });
        }

    } catch (error) {
        res.status(500).json({ message: "حدث خطأ في السيرفر." });
    }
}
