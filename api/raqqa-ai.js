import { MixedbreadAIClient } from '@mixedbread-ai/sdk';

const mxb = new MixedbreadAIClient({ apiKey: process.env.MXB_API_KEY });

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();
    
    try {
        const { prompt } = req.body;
        
        // جلب سياق من Mixedbread
        const search = await mxb.search({
            query: prompt,
            model: 'mixedbread-ai/mxbai-embed-large-v1',
            topK: 2
        }).catch(() => ({ hits: [] }));

        const context = search.hits.map(h => h.body).join('\n');

        // الرد عبر Groq
        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "llama3-70b-8192",
                messages: [
                    { role: "system", content: `أنتِ رقة. السياق: ${context}` },
                    { role: "user", content: prompt }
                ]
            })
        });

        const data = await groqRes.json();
        res.status(200).json({ reply: data.choices[0].message.content });
    } catch (err) {
        res.status(500).json({ reply: "خطأ تقني، سأعود قريباً." });
    }
    }
