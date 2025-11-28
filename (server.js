const express = require('express');
const { OpenAI } = require('openai');
const cors = require('cors');
require('dotenv').config(); 

// يتم تحميل مفتاح API من متغيرات البيئة (OPENAI_API_KEY)
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const app = express();
app.use(cors()); 
app.use(express.json());

// نقطة نهاية توليد الذكاء الاصطناعي (المسار: /api/generate)
app.post('/api/generate', async (req, res) => {
    // يجب أن تتأكد من أن الفرونت إند يرسل البيانات المطلوبة في جسم الطلب (req.body)
    const { prompt } = req.body; 

    if (!prompt) {
        return res.status(400).json({ error: 'الرجاء توفير نص للـ prompt.' });
    }

    // التحقق من أن المفتاح السري تم تحميله (مهم لـ Vercel)
    if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ error: 'خطأ في الخادم: مفتاح API غير مُهيأ.' });
    }

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo", 
            messages: [{ role: "user", content: prompt }],
            max_tokens: 150, 
        });

        const generatedText = completion.choices[0].message.content;

        res.json({ text: generatedText });

    } catch (error) {
        console.error("Error calling OpenAI API:", error.message);
        res.status(500).json({ error: 'حدث خطأ أثناء التواصل مع خادم الذكاء الاصطناعي.' });
    }
});

// *****************************************************************
// التصدير: هذا ضروري لكي يتمكن Vercel من التعامل مع هذا الملف كوظيفة
// *****************************************************************
module.exports = app;

// تشغيل الخادم محلياً للـ Dev (اختياري)
if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`🚀 خادم الباك إند المحلي يعمل على المنفذ: http://localhost:${PORT}`);
    });
}
