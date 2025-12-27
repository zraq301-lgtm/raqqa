import { MixedbreadAIClient } from '@mixedbread-ai/sdk';

export default async function handler(req, res) {
    // 1. إعدادات CORS (لا غنى عنها لمنع أخطاء الاتصال)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    try {
        const { prompt } = req.body;
        if (!prompt) return res.status(400).json({ reply: "لم أستلم سؤالكِ يا رقيقة." });

        let context = "";

        // 2. محاولة جلب السياق من Mixedbread (محمية من الانهيار)
        if (process.env.MXB_API_KEY) {
            try {
                const mxbClient = new MixedbreadAIClient({ apiKey: process.env.MXB_API_KEY });
                const searchResults = await mxbClient.search({
                    query: prompt,
                    model: 'mixedbread-ai/mxbai-embed-large-v1',
                    topK: 2
                });
                context = searchResults.hits.map(h => h.body).join('\n---\n');
            } catch (searchError) {
                console.error("Mixedbread Search Error:", searchError.message);
                // نكمل العمل حتى لو فشل البحث
            }
        }

        // 3. طلب الرد من Groq (باستخدام fetch المدمج في Node 18+)
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
                        content: `أنتِ رقة، مستشارة نسائية حنونة جداً. السياق المتوفر: ${context}` 
                    },
                    { role: "user", content: prompt }
                ]
            })
        });

        if (!groqResponse.ok) {
            const errorData = await groqResponse.json();
            throw new Error(`Groq API Error: ${errorData.error?.message || 'Unknown'}`);
        }

        const data = await groqResponse.json();
        return res.status(200).json({ reply: data.choices[0].message.content });

    } catch (error) {
        console.error("Global API Error:", error.message);
        // إرجاع رد JSON سليم حتى في حالة الخطأ لمنع الـ 500 العمياء
        return res.status(200).json({ 
            reply: "عذراً يا رقيقة، واجهتُ مشكلة تقنية بسيطة في معالجة طلبكِ. تأكدي من إعدادات المفاتيح (API Keys)." 
        });
    }
}
