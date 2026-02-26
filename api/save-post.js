export default async function handler(req, res) {
    // 1. إعدادات CORS الاحترافية لضمان عمل التطبيق على كافة المنصات
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

    const { prompt } = req.body;
    
    // سحب مفاتيح البيئة بناءً على إعداداتك الفعلية في Vercel
    const groqKey = process.env.GROQ_API_KEY; //
    const mxbKey = process.env.MXBAI_API_KEY; //
    const storeId = "66de0209-e17d-4e42-81d1-3851d5a0d826"; // المعرف المطلوب

    try {
        // 2. معالجة المدخلات: استخراج الروابط وتنظيف النص
        const urlRegex = /https?:\/\/[^\s]+(?:png|jpg|jpeg|webp)/gi;
        const imageUrl = (prompt.match(urlRegex) || [])[0];
        const cleanText = prompt.replace(urlRegex, '').replace(/\(تم إرسال وسائط للمعالجة\.\.\.\)/g, '').trim();

        // 3. جلب السياق من المكتبة المتخصصة (Mixedbread)
        let context = "";
        if (cleanText || imageUrl) {
            try {
                const mxbRes = await fetch(`https://api.mixedbread.ai/v1/stores/${storeId}/query`, {
                    method: 'POST',
                    headers: { 
                        'Authorization': `Bearer ${mxbKey}`, 
                        'Content-Type': 'application/json' 
                    },
                    body: JSON.stringify({ query: cleanText || "تحليل محتوى بصري", top_k: 2 })
                });

                if (mxbRes.ok) {
                    const mxbData = await mxbRes.ok ? await mxbRes.json() : null;
                    if (mxbData && mxbData.hits) {
                        context = mxbData.hits.map(h => h.content).join("\n\n");
                    }
                }
            } catch (e) { 
                console.error("Mixedbread bypass to ensure continuity"); 
            }
        }

        // 4. بناء طلب Groq الموحد (نص + رؤية بصرية)
        const messageContent = [];
        
        // إضافة التعليمات البرمجية والسياق المتخصص
        messageContent.push({ 
            type: "text", 
            text: `أنتِ 'رقة'... مساعدة ذكية ولباقة. السياق المتخصص من مكتبتك: ${context}\n\nرسالة المستخدم: ${cleanText || 'يرجى تحليل هذه الصورة بذكاء.'}` 
        });

        // إذا وجدت صورة، يتم إرسال الرابط مباشرة لمعالجتها في أجزاء من الثانية
        if (imageUrl) {
            messageContent.push({ 
                type: "image_url", 
                image_url: { url: imageUrl } 
            });
        }

        // 5. استدعاء موديلات Groq فائقة السرعة
        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${groqKey}`, 
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify({
                // تبديل تلقائي للموديل بناءً على نوع المدخلات (بصري أم نصي) لضمان السرعة
                model: imageUrl ? "llama-3.2-11b-vision-preview" : "llama-3.3-70b-versatile",
                messages: [{ role: "user", content: messageContent }],
                temperature: 0.6,
                max_tokens: 800
            })
        });

        const data = await groqRes.json();
        
        // 6. إرسال الرد النهائي المتوافق مع واجهة التطبيق
        if (data.choices && data.choices[0]) {
            res.status(200).json({ message: data.choices[0].message.content });
        } else {
            res.status(200).json({ message: "أهلاً بكِ، واجهت رقة سحابة عابرة، هل يمكنكِ إعادة إرسال طلبك؟" });
        }

    } catch (error) {
        console.error("Critical Error:", error);
        res.status(500).json({ message: "حدث خطأ تقني في الاتصال، رقة ستحاول العودة قريباً." });
    }
}
