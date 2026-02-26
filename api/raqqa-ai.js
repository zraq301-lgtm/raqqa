export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const { prompt } = req.body;
    const geminiKey = process.env.GEMINI_API_KEY; 

    try {
        const urlRegex = /https?:\/\/[^\s]+(?:png|jpg|jpeg|webp)/gi;
        const imageUrl = (prompt.match(urlRegex) || [])[0];
        const cleanText = prompt.replace(urlRegex, '').trim();

        const parts = [
            { text: `أنتِ رقة، خبيرة مساعدة وذكية. أجيبي على: ${cleanText || 'حللي الصورة'}` }
        ];

        if (imageUrl) {
            const imgRes = await fetch(imageUrl);
            const buffer = await imgRes.arrayBuffer();
            const base64Data = Buffer.from(buffer).toString('base64');
            parts.push({
                inline_data: { mime_type: "image/jpeg", data: base64Data }
            });
        }

        // التعديل الجوهري هنا: تغيير الموديل إلى gemini-pro-vision في حال وجود صورة
        // أو استخدام الرابط المباشر للموديل المستقر
        const modelName = imageUrl ? "gemini-1.5-flash" : "gemini-1.5-flash";
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                contents: [{ parts }]
            })
        });

        const data = await response.json();
        
        if (data.error) {
            // سجل الخطأ الدقيق في فيرسل للمتابعة
            console.error("Gemini Error:", data.error);
            return res.status(200).json({ message: `خطأ من جوجل: ${data.error.message}` });
        }

        if (data.candidates && data.candidates[0]) {
            res.status(200).json({ message: data.candidates[0].content.parts[0].text });
        } else {
            res.status(200).json({ message: "أهلاً بكِ، لم أستطع معالجة الطلب حالياً." });
        }

    } catch (error) {
        res.status(200).json({ message: "رقة تواجه مشكلة تقنية بسيطة، جربي مجدداً." });
    }
}
