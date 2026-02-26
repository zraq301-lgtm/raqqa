export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const { prompt } = req.body;
    const geminiKey = process.env.GEMINI_API_KEY; //

    try {
        const urlRegex = /https?:\/\/[^\s]+(?:png|jpg|jpeg|webp)/gi;
        const imageUrl = (prompt.match(urlRegex) || [])[0];
        const cleanText = prompt.replace(urlRegex, '').trim();

        // إعداد أجزاء الرسالة
        let parts = [{ text: `أنتِ رقة، خبيرة ذكية. أجيبي: ${cleanText || 'حللي الصورة'}` }];

        if (imageUrl) {
            const imgRes = await fetch(imageUrl);
            const buffer = await imgRes.arrayBuffer();
            parts.push({
                inline_data: { mime_type: "image/jpeg", data: Buffer.from(buffer).toString('base64') }
            });
        }

        // التعديل الذهبي: استخدام اسم الموديل المختصر والمستقر
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts }] })
        });

        const data = await response.json();

        // إذا فشل الموديل الحديث، ننتقل فوراً للموديل المضمون gemini-pro
        if (data.error) {
            const retry = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: cleanText || "مرحباً" }] }] })
            });
            const retryData = await retry.json();
            return res.status(200).json({ message: retryData.candidates?.[0]?.content?.parts?.[0]?.text || "رقة معكِ، جربي إرسال رسالتك مرة أخرى." });
        }

        res.status(200).json({ message: data.candidates[0].content.parts[0].text });

    } catch (error) {
        res.status(200).json({ message: "رقة تقوم بتحديث أنظمتها، لحظات وتكون معكِ." });
    }
}
