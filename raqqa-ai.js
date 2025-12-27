import { MixedbreadAIClient } from '@mixedbread-ai/sdk';

// إعداد عميل Mixedbread باستخدام الأسماء الصحيحة من الصورة
const mxbClient = process.env.MXBAI_API_KEY ? new MixedbreadAIClient({ 
    apiKey: process.env.MXBAI_API_KEY 
}) : null;

export default async function handler(req, res) {
    // إعدادات CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    try {
        const { prompt } = req.body;
        let context = "";

        // 1. البحث في Mixedbread باستخدام الـ Store ID الخاص بكِ
        if (mxbClient && process.env.MXBAI_STORE_ID) {
            try {
                const searchResults = await mxbClient.search({
                    query: prompt,
                    model: 'mixedbread-ai/mxbai-embed-large-v1',
                    collectionId: process.env.MXBAI_STORE_ID, // استخدام Store ID من Vercel
                    topK: 3
                });
                context = searchResults.hits.map(h => h.body).join('\n---\n');
            } catch (err) {
                console.error("Mixedbread Search Error:", err.message);
            }
        }

        // 2. طلب الرد من Groq باستخدام المفتاح الصحيح
        const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "llama3-70b-8192",
                messages: [
                    { 
                        role: "system", 
                        content: `أنتِ رقة، مستشارة نسائية حنونة. استخدمي السياق التالي المستخرج من مستودعكِ للإجابة: ${context}` 
                    },
                    { role: "user", content: prompt }
                ],
                temperature: 0.7
            })
        });

        const data = await groqResponse.json();

        if (!groqResponse.ok) {
            throw new Error(data.error?.message || "Groq Error");
        }

        return res.status(200).json({ reply: data.choices[0].message.content });

    } catch (error) {
        console.error("API Error:", error.message);
        return res.status(200).json({ 
            reply: "عذراً يا رقيقة، واجهتُ مشكلة صغيرة. تأكدي من أن الـ Store ID والمفاتيح تعمل بشكل صحيح." 
        });
    }
}
