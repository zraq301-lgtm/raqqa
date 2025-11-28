// api/generate.js
export default async function handler(req, res) {
  // التأكد من أن الطلب هو POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, type } = req.body;

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OpenAI API key not configured' });
  }

  // تخصيص التعليمات بناءً على نوع المحتوى المطلوب
  let systemMessage = "أنت مساعد ذكي لتطبيق نسائي يسمى 'رقة'. أسلوبك لطيف، راقٍ، وداعم.";
  if (type === 'poem') systemMessage += " اكتب شعراً فصيحاً وموزوناً.";
  if (type === 'article') systemMessage += " اكتب مقالاً مفيداً ومنظماً.";

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo', // أو gpt-4o-mini (أرخص وأسرع)
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: prompt }
        ],
        max_tokens: 300, // حدد طول الإجابة
      }),
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    return res.status(200).json({ 
      content: data.choices[0].message.content 
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'فشل في توليد المحتوى.' });
  }
}
