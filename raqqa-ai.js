// File: api/raqqa-ai.js
import { MixedbreadAIClient } from '@mixedbread-ai/sdk';

// إعداد عملاء الخدمة عبر متغيرات البيئة في Vercel
// ملاحظة: تم تصحيح الخطأ هنا (حذف process المكررة)
const mxbClient = new MixedbreadAIClient({ 
    apiKey: process.env.MXB_API_KEY 
});

const GROQ_API_KEY = process.env.GROQ_API_KEY;

export default async function handler(req, res) {
    // رؤوس CORS للسماح بالطلبات من الواجهة الأمامية
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'الطريقة غير مسموحة، استخدم POST' });
    }

    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ reply: "من فضلكِ اكتبي سؤالكِ أولاً." });
    }

    try {
        let context = "";
        
        // 1. محاولة جلب سياق من Mixedbread إذا كان مفعلاً
        try {
            const searchResults = await mxbClient.search({
                query: prompt,
                model: 'mixedbread-ai/mxbai-embed-large-v1',
                topK: 3
            });
            context = searchResults.hits.map(hit => hit.body).join('\n---\n');
        } catch (mxbError) {
            console.warn('Mixedbread Search Skip:', mxbError.message);
            // سنكمل حتى لو فشل Mixedbread ليعمل الـ AI بشكل طبيعي
        }

        // 2. إرسال الطلب إلى Groq
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
                        content: `أنتِ "رقة"، رفيقة ذكية حنونة تساعد النساء بوعي. 
                        استخدمي هذا السياق إذا كان مفيداً: ${context}.
                        أسلوبكِ: رقيق، داعم، وباللغة العربية.`
                    },
                    { role: "user", content: prompt }
                ],
                temperature: 0.7
            })
        });

        const data = await aiResponse.json();
        
        if (!data.choices || data.choices.length === 0) {
            throw new Error('فشل Groq في توليد رد');
        }

        const reply = data.choices[0].message.content;
        return res.status(200).json({ reply });

    } catch (error) {
        console.error('AI Logic Error:', error);
        return res.status(500).json({ 
            reply: "عذراً يا رقيقة، يبدو أن هناك ضغطاً على النظام. حاولي مرة أخرى بعد قليل." 
        });
    }
}
