import { MixedbreadAIClient } from '@mixedbread-ai/sdk';

const mxbClient = process.env.MXBAI_API_KEY ? new MixedbreadAIClient({ 
    apiKey: process.env.MXBAI_API_KEY 
}) : null;

export default async function handler(req, res) {
    // إعدادات CORS للسماح للواجهة بالاتصال
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const { prompt } = req.body;
        let context = "";

        // 1. البحث في Mixedbread باستخدام Store ID الصحيح
        if (mxbClient && process.env.MXBAI_STORE_ID) {
            try {
                const searchResults = await mxbClient.search({
                    query: prompt,
                    model: 'mixedbread-ai/mxbai-embed-large-v1',
                    collectionId: process.env.MXBAI_STORE_ID,
                    topK: 3
                });
                context = searchResults.hits.map(h => h.body).join('\n---\n');
            } catch (err) { console.error("Search Error:", err.message); }
        }

        // 2. طلب الرد من Groq
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
                        content: `أنتِ رقة، مستشارة نسائية حنونة. استخدمي السياق المرفوع: ${context || 'معلوماتك العامة'}` 
                    },
                    { role: "user", content: prompt }
                ]
            })
        });

        const data = await groqResponse.json();
        return res.status(200).json({ reply: data.choices[0].message.content });

    } catch (error) {
        return res.status(200).json({ reply: "عذراً يا رقيقة، واجهتُ مشكلة تقنية بسيطة في الاتصال." });
    }
                    }
