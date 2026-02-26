 export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

    const { prompt } = req.body;
    const geminiKey = process.env.GEMINI_API_KEY; 

    try {
        const urlRegex = /https?:\/\/[^\s]+(?:png|jpg|jpeg|webp)/gi;
        const imageUrl = (prompt.match(urlRegex) || [])[0];
        const cleanText = prompt.replace(urlRegex, '').replace(/\(تم إرسال وسائط للمعالجة\.\.\.\)/g, '').trim();

        const parts = [
            { text: `أنتِ 'رقة'... خبيرة ذكية ولباقة. أجيبي على الطلب التالي: ${cleanText || 'حللي الصورة.'}` }
        ];

        if (imageUrl) {
            const imgRes = await fetch(imageUrl);
            const buffer = await imgRes.arrayBuffer();
            const base64Data = Buffer.from(buffer).toString('base64');
            parts.push({
                inline_data: { mime_type: "image/jpeg", data: base64Data }
            });
        }

        // التعديل هنا: استخدام الإصدار v1 والموديل gemini-1.5-flash-latest لضمان التوافر
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                contents: [{ parts }]
            })
        });

        const data = await response.json();
        
        // التحقق من وجود خطأ في الرد الجديد
        if (data.error) {
            console.error("Gemini API Error:", data.error.message);
            return res.status(200).json({ message: "رقة تقوم بتحديث تصريح الدخول الخاص بها، جربي بعد لحظات." });
        }

        if (data.candidates && data.candidates[0]) {
            res.status(200).json({ message: data.candidates[0].content.parts[0].text });
        } else {
            res.status(200).json({ message: "أهلاً بكِ، رقة جاهزة لاستقبال طلباتك." });
        }

    } catch (error) {
        res.status(200).json({ message: "رقة في مرحلة الصيانة السريعة، شكراً لصبرك رقيقة." });
    }
}
