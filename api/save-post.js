export default async function handler(req, res) {
    // 1. إعدادات CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') return res.status(200).end();

    let body = {};
    try {
        // فحص نوع البيانات القادمة من CapacitorHttp
        body = (typeof req.body === 'string') ? JSON.parse(req.body) : req.body;
    } catch (e) {
        console.error("Parse Error");
    }

    // استخراج البيانات (دعم prompt و name و age)
    const { prompt, name, age } = body || {};

    if (!prompt) {
        return res.status(400).json({ message: "أهلاً بكِ، رقة لم تستلم سؤالكِ بعد." });
    }

    const groqKey = process.env.GROQ_API_KEY;
    const mxbKey = process.env.MXBAI_API_KEY;
    const storeId = "66de0209-e17d-4e42-81d1-3851d5a0d826";

    try {
        // استخراج روابط الصور إن وجدت في النص
        const urlRegex = /https?:\/\/[^\s]+(?:png|jpg|jpeg|webp|gif)/gi;
        const imageUrl = (prompt.match(urlRegex) || [])[0];
        const cleanText = prompt.replace(urlRegex, '').trim();

        // بناء الشخصية (الاسم والعمر)
        const userIdentity = `تخاطبين ${name || 'صديقتكِ'}، عمرها ${age || 'غير معروف'}.`;
        
        // استدعاء Groq
        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${groqKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: imageUrl ? "llama-3.2-11b-vision-preview" : "llama-3.3-70b-versatile",
                messages: [{
                    role: "user",
                    content: [
                        { type: "text", text: `أنتِ رقة، مساعدة ذكية. ${userIdentity}\n\nالسؤال: ${cleanText || 'حللي الصورة'}` },
                        ...(imageUrl ? [{ type: "image_url", image_url: { url: imageUrl } }] : [])
                    ]
                }]
            })
        });

        const data = await groqRes.json();
        const aiReply = data.choices?.[0]?.message?.content || "رقة بجانبكِ دائماً، حاولي مجدداً.";

        return res.status(200).json({ message: aiReply });

    } catch (error) {
        return res.status(500).json({ message: "خطأ في السيرفر" });
    }
}
