import { MixedbreadAIClient } from '@mixedbread-ai/sdk';

const mxbClient = process.env.MXB_API_KEY ? new MixedbreadAIClient({ apiKey: process.env.MXB_API_KEY }) : null;

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    try {
        const { prompt } = req.body;
        let context = "";

        // 1. استخدام Mixedbread لجلب سياق من قاعدة بياناتك (Neon/Supabase)
        if (mxbClient) {
            try {
                const searchResults = await mxbClient.search({
                    query: prompt,
                    model: 'mixedbread-ai/mxbai-embed-large-v1',
                    topK: 3
                });
                context = searchResults.hits.map(h => h.body).join('\n---\n');
            } catch (e) { console.error("Mixedbread Search Error:", e); }
        }

        // 2. إرسال السياق والطلب إلى Groq للرد برقة
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
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
                        content: `أنتِ رقة، مستشارة نسائية حنونة. السياق المتاح: ${context || 'لا يوجد سياق محدد، أجيبي برقة عامة.'}` 
                    },
                    { role: "user", content: prompt }
                ]
            })
        });

        const data = await response.json();
        return res.status(200).json({ reply: data.choices[0].message.content });

    } catch (error) {
        return res.status(500).json({ reply: "عذراً يا رقيقة، واجهتُ مشكلة في معالجة طلبكِ. حاولي مرة أخرى." });
    }
}
