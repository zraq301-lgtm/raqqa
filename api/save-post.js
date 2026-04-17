export default async function handler(req, res) {
    // 1. إعدادات CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

    // --- تحسين استلام الـ Body لضمان عدم حدوث خطأ 400 ---
    let body = req.body;
    
    // إذا وصل الـ body كنص (String) قم بتحويله لـ JSON
    if (typeof body === 'string') {
        try {
            body = JSON.parse(body);
        } catch (e) {
            console.error("Failed to parse body string");
        }
    }

    const { prompt, name, age } = body || {};

    // فحص مرن للـ prompt
    if (!prompt) {
        return res.status(400).json({ 
            message: "الرجاء التأكد من إرسال الـ prompt بشكل صحيح.",
            debug: { receivedBody: !!body } 
        });
    }

    const groqKey = process.env.GROQ_API_KEY; 
    const mxbKey = process.env.MXBAI_API_KEY; 
    const storeId = "66de0209-e17d-4e42-81d1-3851d5a0d826"; 

    try {
        // 2. استخراج الروابط وتنظيف النص
        const urlRegex = /https?:\/\/[^\s]+(?:png|jpg|jpeg|webp|gif)/gi;
        const imageUrl = (prompt.match(urlRegex) || [])[0];
        const cleanText = prompt.replace(urlRegex, '').replace(/\(تم إرسال وسائط للمعالجة\.\.\.\)/g, '').trim();

        // 3. جلب السياق من Mixedbread
        let context = "";
        if (cleanText) {
            try {
                const mxbRes = await fetch(`https://api.mixedbread.ai/v1/stores/${storeId}/query`, {
                    method: 'POST',
                    headers: { 
                        'Authorization': `Bearer ${mxbKey}`, 
                        'Content-Type': 'application/json' 
                    },
                    body: JSON.stringify({ query: cleanText, top_k: 2 })
                });

                if (mxbRes.ok) {
                    const mxbData = await mxbRes.json();
                    if (mxbData?.hits) {
                        context = mxbData.hits.map(h => h.content).join("\n\n");
                    }
                }
            } catch (e) { 
                console.error("Mixedbread Error:", e.message); 
            }
        }

        // 4. بناء محتوى الرسالة لـ Groq
        const userPersona = `تتحدثين مع ${name || 'صديقتكِ'}، عمرها ${age || 'غير محدد'}.`;
        const messageContent = [];
        
        messageContent.push({ 
            type: "text", 
            text: `أنتِ 'رقة'... مساعدة ذكية ولباقة. ${userPersona}\nالسياق المتخصص: ${context}\n\nطلب المستخدم: ${cleanText || 'حللي محتوى هذه الصورة.'}` 
        });

        if (imageUrl) {
            messageContent.push({ 
                type: "image_url", 
                image_url: { url: imageUrl } 
            });
        }

        // 5. استدعاء الموديل المناسب (Vision للصور أو Versatile للنصوص)
        const modelToUse = imageUrl ? "llama-3.2-11b-vision-preview" : "llama-3.3-70b-versatile";

        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${groqKey}`, 
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify({
                model: modelToUse,
                messages: [{ role: "user", content: messageContent }],
                temperature: 0.7
            })
        });

        const data = await groqRes.json();
        
        if (data.choices?.[0]?.message?.content) {
            return res.status(200).json({ message: data.choices[0].message.content });
        } else {
            return res.status(200).json({ message: "أهلاً بكِ، رقة مشغولة قليلاً، حاولي مرة أخرى." });
        }

    } catch (error) {
        console.error("Server Error:", error);
        return res.status(500).json({ message: "حدث خطأ داخلي، رقة ستعود قريباً." });
    }
}
