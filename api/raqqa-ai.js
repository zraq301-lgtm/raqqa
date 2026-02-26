export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const { prompt } = req.body;
    const geminiKey = process.env.GEMINI_API_KEY; 

    try {
        const urlRegex = /https?:\/\/[^\s]+(?:png|jpg|jpeg|webp)/gi;
        const imageUrl = (prompt.match(urlRegex) || [])[0];
        const cleanText = prompt.replace(urlRegex, '').replace(/\(تم إرسال وسائط للمعالجة\.\.\.\)/g, '').trim();

        let parts = [{ text: `أنتِ رقة، خبيرة ذكية. السؤال: ${cleanText || 'حللي الصورة'}` }];

        if (imageUrl) {
            const imgRes = await fetch(imageUrl);
            const buffer = await imgRes.arrayBuffer();
            parts.push({
                inline_data: { mime_type: "image/jpeg", data: Buffer.from(buffer).toString('base64') }
            });
        }

        // التعديل الحاسم: استخدام المسار الكامل للموديل (models/gemini-1.5-flash)
        // واستخدام الإصدار المستقر v1
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts }] })
        });

        const data = await response.json();

        // فحص شامل للرد
        if (data.error) {
            console.error("Gemini Final Error:", data.error.message);
            // محاولة أخيرة بموديل Pro إذا فشل Flash
            const retry = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${geminiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: cleanText || "مرحباً" }] }] })
            });
            const retryData = await retry.json();
            return res.status(200).json({ message: retryData.candidates?.[0]?.content?.parts?.[0]?.text || "رقة تحاول جاهدة الوصول، يرجى التحقق من تفعيل الموديل في AI Studio." });
        }

        if (data.candidates && data.candidates[0]) {
            res.status(200).json({ message: data.candidates[0].content.parts[0].text });
        } else {
            res.status(200).json({ message: "أهلاً بكِ رقيقة، رقة جاهزة الآن." });
        }

    } catch (error) {
        res.status(200).json({ message: "عذراً، واجهت رقة مشكلة في الاتصال." });
    }
}
