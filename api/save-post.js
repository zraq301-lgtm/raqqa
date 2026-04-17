export default async function handler(req, res) {
    // 1. إعدادات CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

    // --- الحل الجوهري: التأكد من أن req.body معرف ---
    if (!req.body) {
        return res.status(400).json({ message: "خطأ: لم يتم إرسال بيانات في الطلب (Body is missing)" });
    }

    const { prompt, name, age } = req.body;

    // التأكد من وجود النص الأساسي
    if (!prompt) {
        return res.status(400).json({ message: "الرجاء كتابة رسالة أو سؤال لرقة." });
    }

    // سحب مفاتيح البيئة
    const groqKey = process.env.GROQ_API_KEY; 
    const mxbKey = process.env.MXBAI_API_KEY; 
    const storeId = "66de0209-e17d-4e42-81d1-3851d5a0d826"; 

    try {
        // 2. معالجة الروابط وتنظيف النص (بشكل آمن)
        const urlRegex = /https?:\/\/[^\s]+(?:png|jpg|jpeg|webp)/gi;
        const imageUrl = (typeof prompt === 'string' ? (prompt.match(urlRegex) || [])[0] : null);
        const cleanText = typeof prompt === 'string' 
            ? prompt.replace(urlRegex, '').replace(/\(تم إرسال وسائط للمعالجة\.\.\.\)/g, '').trim() 
            : "";

        // 3. جلب السياق من Mixedbread
        let context = "";
        if (cleanText || imageUrl) {
            try {
                const mxbRes = await fetch(`https://api.mixedbread.ai/v1/stores/${storeId}/query`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${mxbKey}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ query: cleanText || "تحليل محتوى", top_k: 2 })
                });

                if (mxbRes.ok) {
                    const mxbData = await mxbRes.json();
                    if (mxbData && mxbData.hits) {
                        context = mxbData.hits.map(h => h.content).join("\n\n");
                    }
                }
            } catch (e) { 
                console.error("Mixedbread Error:", e.message); 
            }
        }

        // 4. بناء طلب Groq
        const userPersona = `تتحدثين مع ${name || 'صديقتكِ'}، عمرها ${age || 'غير محدد'}.`;
        const messageContent = [];
        
        messageContent.push({ 
            type: "text", 
            text: `أنتِ 'رقة'... مساعدة ذكية ولباقة. ${userPersona} السياق المتخصص: ${context}\n\nطلب المستخدم: ${cleanText || 'حللي محتوى الصورة.'}` 
        });

        if (imageUrl) {
            messageContent.push({ 
                type: "image_url", 
                image_url: { url: imageUrl } 
            });
        }

        // 5. استدعاء Groq
        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${groqKey}`, 
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify({
                model: imageUrl ? "llama-3.2-90b-vision-preview" : "llama-3.3-70b-versatile",
                messages: [{ role: "user", content: messageContent }],
                temperature: 0.6,
                max_tokens: 1024
            })
        });

        const data = await groqRes.json();
        
        if (data.choices && data.choices[0]) {
            return res.status(200).json({ message: data.choices[0].message.content });
        } else {
            console.error("Groq Empty Response:", data);
            return res.status(200).json({ message: "أهلاً بكِ رقيقة، رقة تقوم بتحديث أنظمتها حالياً، جربي مجدداً بعد لحظات." });
        }

    } catch (error) {
        console.error("Critical API Error:", error);
        return res.status(500).json({ message: "خطأ في الاتصال بالسيرفر، رقة ستعود قريباً." });
    }
}
