import Replicate from "replicate";

export default async function handler(req, res) {
    // إعدادات CORS للسماح بالاتصال من الواجهة
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

    const { prompt } = req.body;
    const mixedbreadKey = process.env.MIXEDBREAD_API_KEY; // الحفاظ على مفتاح Mixedbread كما هو
    const storeId = "66de0209-e17d-4e42-81d1-3851d5a0d826";
    const replicateToken = process.env.REPLICATE_API_TOKEN; // المفتاح الجديد من الصورة المرفقة

    try {
        // 1. استخراج رابط الصورة من الرسالة إن وجد (الرابط المرفوع لـ Vercel Blob)
        const imageUrl = prompt.match(/https?:\/\/[^\s]+\.(jpg|jpeg|png|webp)/i)?.[0];

        // 2. توجيه التخصص عبر Mixedbread.ai (البحث في المكتبة)
        let context = "";
        try {
            const mxbResponse = await fetch(`https://api.mixedbread.ai/v1/stores/${storeId}/query`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${mixedbreadKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ query: prompt, top_k: 3 })
            });
            const mxbData = await mxbResponse.json();
            if (mxbData.hits) {
                context = mxbData.hits.map(item => item.content).join("\n\n");
            }
        } catch (e) { 
            console.error("Mixedbread Error:", e); 
        }

        // 3. التعامل مع Replicate (للدردشة وتحليل الصور)
        const replicate = new Replicate({ auth: replicateToken });

        // نستخدم نموذج Llama 3.2 Vision لأنه يدعم الصور والنصوص معاً
        const model = "meta/llama-3.2-11b-vision-instruct";
        
        const input = {
            prompt: `أنتِ 'رقة'... استعيني بهذا المحتوى المتخصص للرد: ${context}\n\nالسؤال: ${prompt}`,
            image: imageUrl || undefined, // إرسال الرابط لـ Replicate إذا وجد
            max_tokens: 512,
            temperature: 0.5
        };

        const output = await replicate.run(model, { input });

        // تجميع الرد من Replicate (يأتي غالباً كمصفوفة نصوص)
        const fullResponse = Array.isArray(output) ? output.join("") : output;

        if (fullResponse) {
            res.status(200).json({ message: fullResponse });
        } else {
            res.status(200).json({ message: "عذراً، لم أتمكن من معالجة طلبك حالياً." });
        }

    } catch (error) {
        console.error("Replicate API Error:", error);
        res.status(500).json({ message: "حدث خطأ في الاتصال بالسحاب، حاولي مرة أخرى." });
    }
}
