export default async function handler(req, res) {
    // إعدادات CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const { prompt } = req.body;
    const geminiKey = process.env.GEMINI_API_KEY; // المفتاح الذي أضفتِه
    const mxbKey = process.env.MXBAI_API_KEY; 
    const storeId = "66de0209-e17d-4e42-81d1-3851d5a0d826"; // المعرف الخاص بكِ

    try {
        const urlRegex = /https?:\/\/[^\s]+(?:png|jpg|jpeg|webp)/gi;
        const imageUrl = (prompt.match(urlRegex) || [])[0];
        const cleanText = prompt.replace(urlRegex, '').replace(/\(تم إرسال وسائط للمعالجة\.\.\.\)/g, '').trim();

        // 1. جلب السياق من Mixedbread لضمان تخصص رقة
        let context = "";
        const mxbRes = await fetch(`https://api.mixedbread.ai/v1/stores/${storeId}/query`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${mxbKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: cleanText || "تحليل بصري", top_k: 2 })
        });
        if (mxbRes.ok) {
            const mxbData = await mxbRes.json();
            context = mxbData.hits?.map(h => h.content).join("\n\n") || "";
        }

        if (imageUrl) {
            // 2. تحويل الصورة لـ Base64 (Gemini يحتاج الصورة كبيانات وليس فقط رابط)
            const imageResponse = await fetch(imageUrl);
            const arrayBuffer = await imageResponse.arrayBuffer();
            const base64Image = Buffer.from(arrayBuffer).toString('base64');

            // 3. استدعاء Gemini الفعلي
            const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            { text: `أنتِ رقة، مساعدة خبيرة. السياق: ${context}\n\n الطلب: ${cleanText}` },
                            { inline_data: { mime_type: "image/jpeg", data: base64Image } }
                        ]
                    }]
                })
            });

            const data = await geminiRes.json();
            if (data.candidates && data.candidates[0]) {
                return res.status(200).json({ message: data.candidates[0].content.parts[0].text });
            }
        }
        
        res.status(200).json({ message: "يرجى إرسال صورة لتحليلها عبر نظام جيميني الجديد." });

    } catch (error) {
        res.status(200).json({ message: "رقة تحاول تشغيل عيونها، تأكدي من تحديث الكود في Vercel." });
    }
}
