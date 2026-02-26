export default async function handler(req, res) {
    // إعدادات CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const { prompt } = req.body;
    const geminiKey = process.env.GEMINI_API_KEY; // المفتاح من إعدادات Vercel

    try {
        const urlRegex = /https?:\/\/[^\s]+(?:png|jpg|jpeg|webp)/gi;
        const imageUrl = (prompt.match(urlRegex) || [])[0];
        const cleanText = prompt.replace(urlRegex, '').replace(/\(تم إرسال وسائط للمعالجة\.\.\.\)/g, '').trim();

        const parts = [
            { text: `أنتِ رقة، خبيرة ذكية ولباقة. أجيبي على: ${cleanText || 'حللي الصورة'}` }
        ];

        if (imageUrl) {
            const imgRes = await fetch(imageUrl);
            const buffer = await imgRes.arrayBuffer();
            const base64Data = Buffer.from(buffer).toString('base64');
            parts.push({
                inline_data: { mime_type: "image/jpeg", data: base64Data }
            });
        }

        // التعديل لحل خطأ 404: استخدام المسار الكامل للموديل
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                contents: [{ parts }]
            })
        });

        const data = await response.json();
        
        if (data.error) {
            // إذا استمر الخطأ، نجرب الموديل الاحتياطي المستقر
            const retryResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: cleanText || "مرحباً" }] }] })
            });
            const retryData = await retryResponse.json();
            return res.status(200).json({ message: retryData.candidates?.[0]?.content?.parts?.[0]?.text || `خطأ من جوجل: ${data.error.message}` });
        }

        if (data.candidates && data.candidates[0]) {
            res.status(200).json({ message: data.candidates[0].content.parts[0].text });
        } else {
            res.status(200).json({ message: "أهلاً بكِ رقيقة، رقة جاهزة الآن." });
        }

    } catch (error) {
        res.status(200).json({ message: "حدث خطأ فني، يرجى إعادة المحاولة." });
    }
}
