// File: api/raqqa-ai.js
import { MixedbreadAIClient } from '@mixedbread-ai/sdk';

// إعداد عملاء الخدمة عبر متغيرات البيئة في Vercel
const mxbClient = new MixedbreadAIClient({ apiKey: process process.env.MXB_API_KEY });
const GROQ_API_KEY = process.env.GROQ_API_KEY;

export default async function handler(req, res) {
    // إضافة رؤوس CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const { prompt } = req.body;

    try {
        // 1. استخدام Mixedbread للبحث عن سياق (Context) من قاعدة بياناتك
        // ملاحظة: نفترض أنك قمت بإنشاء Index في Mixedbread يحتوي على منشورات نيون
        const searchResults = await mxbClient.search({
            query: prompt,
            model: 'mixedbread-ai/mxbai-embed-large-v1', // نموذج فهم اللغة العربية
            topK: 3 // جلب أفضل 3 نتائج من محتواكِ
        });

        // تحويل نتائج البحث إلى نص سياقي
        const context = searchResults.hits
            .map(hit => hit.body)
            .join('\n---\n');

        // 2. إرسال السؤال مع السياق إلى Groq (Llama 3) لإنشاء رد رقيق
        const aiResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "llama3-70b-8192",
                messages: [
                    {
                        role: "system", 
                        content: `أنتِ "رقة"، مستشارة ذكية رقيقة تساعد النساء. 
                        استخدمي المعلومات التالية للرد (إذا كانت مفيدة): ${context}.
                        يجب أن يكون أسلوبكِ حنوناً، ملهماً، وباللغة العربية.`
                    },
                    { role: "user", content: prompt }
                ],
                temperature: 0.7
            })
        });

        const data = await aiResponse.json();
        const reply = data.choices[0].message.content;

        return res.status(200).json({ reply });

    } catch (error) {
        console.error('AI Logic Error:', error);
        return res.status(500).json({ 
            reply: "عذراً يا رقيقة، واجهتُ صعوبة في التفكير الآن. هل يمكنكِ إعادة السؤال لاحقاً؟" 
        });
    }
}
