import pkg from 'pg';
const { Pool } = pkg;

const dbUrl = new URL(process.env.DATABASE_URL);
const pool = new Pool({
  host: dbUrl.hostname,
  port: dbUrl.port,
  user: dbUrl.username,
  password: dbUrl.password,
  database: dbUrl.pathname.split('/')[1],
  ssl: { rejectUnauthorized: false },
  max: 1
});

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });

  const { user_id } = req.query;
  const BASE_URL = "https://raqqa-hjl8.vercel.app";
  const AI_API_URL = "https://raqqa-v6cd.vercel.app/api/raqqa-ai"; // رابط الذكاء الخاص بك

  try {
    const query = `
      SELECT id, title, body, category, scheduled_for 
      FROM notifications 
      WHERE user_id = $1 AND scheduled_for > NOW()
      ORDER BY scheduled_for ASC
    `;
    
    const result = await pool.query(query, [user_id || 1]);

    // معالجة كل صف لإرساله للذكاء الاصطناعي
    const processedRows = await Promise.all(result.rows.map(async (row) => {
      let iconName = 'default.png';
      
      // تحديد الأيقونة
      const icons = {
        breastfeeding: 'milk.png',
        pregnancy: 'preg.png',
        period: 'period.png',
        fitness: 'fit.png',
        medical: 'doctor.png',
        mood: 'mood.png',
        intimacy: 'heart.png',
        motherhood: 'baby.png'
      };
      iconName = icons[row.category] || 'default.png';

      // --- الجزء الخاص بالذكاء الاصطناعي ---
      let smartBody = row.body; // النص الأصلي كاحتياط

      try {
        const aiResponse = await fetch(AI_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: `اكتب نص إشعار قصير وجذاب جداً لقسم: ${row.category}. العنوان الحالي هو: ${row.title}. الموعد المجدد: ${row.scheduled_for}. اجعل الأسلوب ودوداً وداعماً.`
          })
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          // نفترض أن الـ API الخاص بك يعيد النص في حقل اسمه text أو message أو content
          // قم بتعديل aiData.text بناءً على شكل الرد من الرابط الخاص بك
          smartBody = aiData.text || aiData.message || aiData.content || row.body;
        }
      } catch (aiErr) {
        console.error("AI API Connection Error:", aiErr.message);
      }
      // ------------------------------------

      return {
        id: row.id,
        title: row.title,
        body: smartBody, // النص الذي تمت صياغته بالذكاء
        scheduled_for: row.scheduled_for,
        category: row.category,
        image_url: `${BASE_URL}/assets/icons/${iconName}` 
      };
    }));

    return res.status(200).json({ rows: processedRows });

  } catch (error) {
    console.error('❌ Database Error:', error.message);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
