// api/generate.js
/**
 * هذا الملف يقوم بمعالجة طلبات POST لتوليد المحتوى باستخدام Gemini API.
 */
export default async function handler(req, res) {
  // 1. التحقق من طريقة الطلب
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 2. استخراج البيانات من جسم الطلب
  const { prompt, type } = req.body;

  // 3. التحقق من مفتاح API
  if (!process.env.GEMINI_API_KEY) {
    // يجب تعيين مفتاح API الخاص بـ Gemini في ملف .env
    return res.status(500).json({ error: 'Gemini API key not configured' });
  }

  // 4. تخصيص التعليمات بناءً على نوع المحتوى المطلوب (System Instruction)
  let systemInstruction = "أنت مساعد ذكي لتطبيق نسائي يسمى 'رقة'. أسلوبك لطيف، راقٍ، وداعم.";
  if (type === 'poem') systemInstruction += " اكتب شعراً فصيحاً وموزوناً.";
  if (type === 'article') systemInstruction += " اكتب مقالاً مفيداً ومنظماً.";

  // 5. إعداد معلمات واجهة برمجة تطبيقات Gemini
  const model = 'gemini-2.5-flash'; // نموذج سريع وفعال
  const maxOutputTokens = 300; // حدد طول الإجابة

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // محتوى الطلب
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }]
          }
        ],
        // إعدادات التوليد
        config: {
          systemInstruction: systemInstruction, // استخدام التعليمات المخصصة
          maxOutputTokens: maxOutputTokens,
          // يمكن إضافة temperature أو topP هنا إذا لزم الأمر
        }
      }),
    });

    // 6. معالجة الاستجابة
    const data = await response.json();

    if (data.error) {
      // التعامل مع أخطاء API (مثل مفتاح غير صالح أو تجاوز الحد)
      throw new Error(data.error.message || 'Gemini API returned an error.');
    }

    // استخراج المحتوى المتولد من استجابة Gemini
    const generatedContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedContent) {
        throw new Error('Failed to generate content or no output text was returned.');
    }

    return res.status(200).json({
      content: generatedContent
    });

  } catch (error) {
    console.error('Error:', error);
    // 7. إرجاع رسالة خطأ عامة في حالة الفشل
    return res.status(500).json({ error: 'فشل في توليد المحتوى.', details: error.message });
  }
}
