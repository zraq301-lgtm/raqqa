import pkg from 'pg';
const { Pool } = pkg;

// إعداد الاتصال بقاعدة البيانات باستخدام WHATWG URL API الحديثة
const dbUrl = new URL(process.env.DATABASE_URL);
const pool = new Pool({
  host: dbUrl.hostname,
  port: dbUrl.port,
  user: dbUrl.username,
  password: dbUrl.password,
  database: dbUrl.pathname.substring(1),
  ssl: { rejectUnauthorized: false },
  max: 1
});

// خريطة الأيقونات - سهلة التعديل والإضافة
const CATEGORY_ICONS = {
  breastfeeding: 'milk.png',
  pregnancy: 'preg.png',
  period: 'period.png',
  fitness: 'fit.png',
  medical: 'doctor.png',
  mood: 'mood.png',
  intimacy: 'heart.png',
  motherhood: 'baby.png',
  default: 'default.png'
};

export default async function handler(req, res) {
  // التحقق من نوع الطلب
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { user_id } = req.query;
  const BASE_URL = "https://raqqa-hjl8.vercel.app";
  const AI_API_URL = "https://raqqa-v6cd.vercel.app/api/raqqa-ai";

  try {
    // 1. جلب البيانات من نيون
    const query = `
      SELECT id, title, body, category, scheduled_for 
      FROM notifications 
      WHERE user_id = $1 AND scheduled_for > NOW()
      ORDER BY scheduled_for ASC
    `;
    
    const { rows } = await pool.query(query, [user_id || 1]);

    // 2. معالجة الصفوف بالتوازي لسرعة الأداء
    const processedRows = await Promise.all(rows.map(async (row) => {
      const iconName = CATEGORY_ICONS[row.category] || CATEGORY_ICONS.default;
      let smartBody = row.body;

      try {
        // 3. استدعاء الذكاء الاصطناعي الخاص بك
        const aiResponse = await fetch(AI_API_URL, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            // تمرير مفاتيح الـ API إذا كان الـ Endpoint يحتاجها مباشرة
            'x-api-key': process.env.GROQ_API_KEY 
          },
          body: JSON.stringify({
            category: row.category,
            current_title: row.title,
            scheduled_date: row.scheduled_for,
            store_id: process.env.MXBAI_STORE_ID,
            prompt: `صغ رسالة إشعار دافئة وقصيرة (أقل من 15 كلمة) لمستخدمة تطبيق "رقة" بخصوص ${row.category}. الموعد: ${row.scheduled_for}.`
          })
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          // استخراج النص (تعديل الحقل حسب مخرجات الـ API الخاص بك)
          smartBody = aiData.text || aiData.message || aiData.content || row.body;
        }
      } catch (aiError) {
        console.warn(`⚠️ AI generation failed for ID ${row.id}, using fallback text.`);
      }

      return {
        id: row.id,
        title: row.title,
        body: smartBody,
        category: row.category,
        scheduled_for: row.scheduled_for,
        image_url: `${BASE_URL}/assets/icons/${iconName}`
      };
    }));

    // 4. إرسال النتيجة النهائية
    return res.status(200).json({ 
      success: true,
      count: processedRows.length,
      rows: processedRows 
    });

  } catch (error) {
    console.error('❌ Server Error:', error.message);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
