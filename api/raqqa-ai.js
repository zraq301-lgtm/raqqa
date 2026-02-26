export default async function handler(req, res) {
    // 1. إعدادات CORS الاحترافية للسماح بالاتصال من كافة المصادر
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

    const { prompt } = req.body;
    const mixedbreadKey = process.env.MIXEDBREAD_API_KEY;
    const replicateToken = process.env.REPLICATE_API_TOKEN;
    const newStoreId = "20414af4-f999-4217-a6e0-b978fc54933a"; // معرف المشروع الجديد

    try {
        // 2. الفرز الذكي: استخراج الروابط (صور أو وسائط) وتجريد النص
        const urlRegex = /https?:\/\/[^\s]+/gi;
        const urls = prompt.match(urlRegex) || [];
        const imageUrl = urls.find(url => /\.(jpg|jpeg|png|webp|gif)/i.test(url));
        
        // تنظيف النص من الروابط لإرساله للتوجيه المخصص فقط
        const cleanText = prompt.replace(urlRegex, '').trim();

        // 3. توجيه النص فقط إلى Mixedbread لجلب السياق المتخصص
        let context = "";
        if (cleanText) {
            try {
                const mxbResponse = await fetch(`https://api.mixedbread.ai/v1/stores/${newStoreId}/query`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${mixedbreadKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ query: cleanText, top_k: 3 })
                });
                
                if (mxbResponse.ok) {
                    const mxbData = await mxbResponse.json();
                    if (mxbData.hits) context = mxbData.hits.map(item => item.content).join("\n\n");
                }
            } catch (e) { console.error("Mixedbread Routing Error:", e); }
        }

        // 4. إرسال الطلب بالكامل إلى Replicate (تحليل الصور + الرد الذكي)
        const replicateResponse = await fetch("https://api.replicate.com/v1/predictions", {
            method: "POST",
            headers: {
                "Authorization": `Token ${replicateToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                version: "11e483980757d478198a23c31671520624f0c406380645479a61327177579c31", // Llama 3.2 Vision
                input: {
                    prompt: `أنتِ 'رقة'... السياق المتخصص من المكتبة: ${context}\n\nرسالة المستخدم: ${cleanText}`,
                    image: imageUrl || undefined, // إرسال رابط الصورة مباشرة للمنصة
                    max_tokens: 512,
                    temperature: 0.4
                }
            })
        });

        let prediction = await replicateResponse.json();

        // 5. آلية الانتظار الذكية (Polling) مع سقف زمني
        let attempts = 0;
        while (prediction.status !== "succeeded" && prediction.status !== "failed" && attempts < 15) {
            await new Promise(resolve => setTimeout(resolve, 1500));
            const statusRes = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
                headers: { "Authorization": `Token ${replicateToken}` }
            });
            prediction = await statusRes.json();
            attempts++;
        }

        const finalOutput = Array.isArray(prediction.output) ? prediction.output.join("") : prediction.output;

        res.status(200).json({ 
            message: finalOutput || "عذراً رقيقة، لم أستطع تحليل الطلب الآن، حاولي مرة أخرى." 
        });

    } catch (error) {
        console.error("Internal Server Error:", error);
        res.status(500).json({ message: "حدث خطأ في معالجة البيانات." });
    }
}
