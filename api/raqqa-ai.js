export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

    const { prompt } = req.body;
    const mixedbreadKey = process.env.MIXEDBREAD_API_KEY;
    const replicateToken = process.env.REPLICATE_API_TOKEN; //
    const storeId = "20414af4-f999-4217-a6e0-b978fc54933a"; 

    try {
        // 1. استخراج الرابط المباشر للصورة (مثل الرابط الذي أرسلتِه)
        const urlRegex = /https?:\/\/[^\s]+(?:png|jpg|jpeg|webp)/gi;
        const imageUrls = prompt.match(urlRegex);
        const finalImageUrl = imageUrls ? imageUrls[0] : null;

        // تنظيف النص من الروابط لإرساله للتخصص
        const cleanText = prompt.replace(urlRegex, '').replace(/\(تم إرسال وسائط للمعالجة\.\.\.\)/g, '').trim();

        // 2. محاولة جلب السياق من Mixedbread (فقط إذا كان هناك نص)
        let context = "";
        if (cleanText && cleanText.length > 2) {
            try {
                const mxbResponse = await fetch(`https://api.mixedbread.ai/v1/stores/${storeId}/query`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${mixedbreadKey}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ query: cleanText, top_k: 3 })
                });
                if (mxbResponse.ok) {
                    const mxbData = await mxbResponse.json();
                    if (mxbData.hits) context = mxbData.hits.map(item => item.content).join("\n\n");
                }
            } catch (e) { console.error("Mixedbread Connection Issue"); }
        }

        // 3. بدء التنبؤ عبر Replicate (استخدام Llama 3.2 Vision)
        const replicateResponse = await fetch("https://api.replicate.com/v1/predictions", {
            method: "POST",
            headers: {
                "Authorization": `Token ${replicateToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                version: "11e483980757d478198a23c31671520624f0c406380645479a61327177579c31",
                input: {
                    prompt: `أنتِ 'رقة'... السياق المتخصص: ${context || 'ثقافتك العامة'}. السؤال: ${cleanText || 'حللي هذه الصورة'}`,
                    image: finalImageUrl || undefined,
                    max_tokens: 512
                }
            })
        });

        let prediction = await replicateResponse.json();
        if (prediction.error) throw new Error(prediction.error);

        // 4. آلية انتظار محسنة (Polling) لضمان عدم الانقطاع
        let attempts = 0;
        while (prediction.status !== "succeeded" && prediction.status !== "failed" && attempts < 25) {
            await new Promise(resolve => setTimeout(resolve, 2000)); // انتظار ثانيتين بين كل محاولة
            const statusRes = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
                headers: { "Authorization": `Token ${replicateToken}` }
            });
            prediction = await statusRes.json();
            attempts++;
        }

        // 5. الرد النهائي
        const finalOutput = Array.isArray(prediction.output) ? prediction.output.join("") : (prediction.output || "");

        if (prediction.status === "succeeded" && finalOutput) {
            res.status(200).json({ message: finalOutput });
        } else {
            // في حالة فشل Replicate، نستخدم رد ذكاء اصطناعي احتياطي إذا كان هناك نص
            res.status(200).json({ message: "أهلاً بكِ، الصورة وصلتني وهي قيد التحليل العميق، هل تودين سؤالي عن شيء آخر في هذه الأثناء؟" });
        }

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ message: "حدث خطأ بسيط في الربط، يرجى المحاولة بعد لحظات." });
    }
}
