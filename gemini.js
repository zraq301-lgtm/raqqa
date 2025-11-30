// api/gemini.js
// Vercel Serverless Function for generating content using Gemini

// استيراد مكتبة Google Gen AI SDK
// تأكد من تثبيتها باستخدام: npm install @google/genai
import { GoogleGenAI } from '@google/genai';

// يتم قراءة مفتاح API من متغيرات البيئة المعرفة في Vercel
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// التحقق من وجود المفتاح
if (!GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY is not set in environment variables.");
}

// تهيئة نموذج Gemini
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
const model = 'gemini-2.5-flash'; // نموذج سريع ومناسب للمحتوى النصي

// الدالة الرئيسية التي تستجيب لطلبات Vercel
export default async function handler(req, res) {
  // تسمح فقط بطلبات POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed, only POST is supported.' });
  }

  // التحقق من وجود مفتاح API قبل المتابعة
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: "API Key is missing. Please set GEMINI_API_KEY environment variable." });
  }

  try {
    const { prompt } = req.body; // استخلاص الـ prompt من جسم الطلب (JSON)

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required in the request body.' });
    }

    // استدعاء نموذج Gemini
    const response = await ai.models.generateContent({
      model: model,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        // يمكنك تعديل هذه المعلمات لتحسين الإخراج
        temperature: 0.8,
        maxOutputTokens: 1024,
      }
    });

    // إرسال الرد المولد إلى الواجهة الأمامية
    res.status(200).json({
      generatedText: response.text,
      modelUsed: model
    });

  } catch (error) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: 'Internal Server Error during AI generation.', details: error.message });
  }
}
