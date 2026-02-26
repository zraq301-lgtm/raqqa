export default async function handler(req, res) {
    // 1. إعدادات الوصول (CORS)
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

    const { prompt } = req.body;
    
    // سحب مفتاح جيميني فقط
    const geminiKey = process.env.GEMINI_API_KEY; 

    try {
        // 2. معالجة الرابط واستخراج الصورة
        const urlRegex = /https?:\/\/[^\s]+(?:png|jpg|jpeg|webp)/gi;
        const imageUrl = (prompt.match(urlRegex) || [])[0];
        const cleanText = prompt.replace(urlRegex, '').replace(/\(تم إرسال وسائط للمعالجة\.\.\.\)/g, '').trim();

        // 3. بناء محتوى الرسالة لـ Gemini
        const parts = [
            { text: `أنتِ 'رقة'... خبيرة ذكية، لباقة، ومساعدة. أجيبي على هذا السؤال: ${cleanText || 'حللي محتوى هذه الصورة ببراعة.'}` }
        ];

        if (imageUrl) {
            // تحويل الصورة لبيانات (Base64) لضمان أن يراها جيميني حتماً
            const imgRes = await fetch(imageUrl);
            const buffer = await imgRes.arrayBuffer();
            const base64Data = Buffer.from(buffer).toString('base64');
            parts.push({
                inline_data: { mime_type: "image/jpeg", data: base64Data }
            });
        }

        // 4. استدعاء Gemini API (إصدار 1.5 Flash السريع والمجاني)
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                contents: [{ parts }],
                generationConfig: {
                    maxOutputTokens: 1000,
                    temperature: 0.7
                }
            })
        });

        const data = await response.json();
        
        if (data.candidates && data.candidates[0]) {
            const reply = data.candidates[0].content.parts[0].text;
            res.status(200).json({ message: reply });
        } else {
            // في حال وجود مشكلة في الرد من جيميني
            console.error("Gemini Error Detail:", data);
            res.status(200).json({ message: "أهلاً بكِ رقيقة، رقة تقوم بضبط إعدادات جيميني الآن، تأكدي من صحة المفتاح." });
        }

    } catch (error) {
        res.status(200).json({ message: "رقة تحاول تشغيل نظامها البصري الجديد، يرجى إعادة المحاولة بعد ثوانٍ." });
    }
}
