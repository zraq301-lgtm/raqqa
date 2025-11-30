import { GoogleGenAI } from '@google/genai';

// يتم استرداد مفتاح API من متغيرات بيئة Vercel
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("خطأ: لم يتم العثور على مفتاح GEMINI_API_KEY في متغيرات البيئة.");
}

// تهيئة GoogleGenAI.
const ai = new GoogleGenAI({ apiKey });

/**
 * دالة Vercel Serverless التي تتلقى طلب POST وتحول النص إلى نموذج Gemini.
 * @param {import('http').IncomingMessage} req - كائن الطلب.
 * @param {import('http').ServerResponse} res - كائن الاستجابة.
 */
export default async function handler(req, res) {
    // التأكد من أن المفتاح متوفر قبل المتابعة
    if (!apiKey) {
        res.status(500).json({ error: 'لم يتم تكوين مفتاح Gemini API بشكل صحيح.' });
        return;
    }

    // السماح فقط بطلبات POST
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'الطريقة غير مسموح بها. الرجاء استخدام POST.' });
        return;
    }

    try {
        // قراءة محتوى الطلب (body)
        const buffers = [];
        for await (const chunk of req) {
            buffers.push(chunk);
        }
        const data = JSON.parse(Buffer.concat(buffers).toString());

        const userPrompt = data.prompt;
        
        if (!userPrompt) {
            res.status(400).json({ error: 'الرجاء إرسال حقل "prompt" في نص الطلب.' });
            return;
        }

        console.log(`تلقي مطالبة المستخدم: ${userPrompt}`);

        // استدعاء نموذج Gemini
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-preview-09-2025',
            contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        });

        const generatedText = response.candidates?.[0]?.content?.parts?.[0]?.text || "حدث خطأ في توليد المحتوى.";
        
        // إرجاع النص المُولّد
        res.status(200).json({ 
            success: true,
            generatedText: generatedText
        });

    } catch (error) {
        console.error('خطأ في دالة Gemini:', error);
        res.status(500).json({ 
            success: false, 
            error: 'حدث خطأ داخلي أثناء معالجة طلبك.',
            details: error.message
        });
    }
}
