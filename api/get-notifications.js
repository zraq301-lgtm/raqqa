import pkg from 'pg';
const { Pool } = pkg;

// إعداد الاتصال بقاعدة بيانات نيون باستخدام المتغير DATABASE_URL
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
  // السماح فقط بعمليات الجلب GET
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });

  const { user_id } = req.query;
  const BASE_URL = "https://raqqa-hjl8.vercel.app";

  try {
    // جلب المواعيد القادمة فقط من جدول notifications
    const query = `
      SELECT id, title, body, category, scheduled_for 
      FROM notifications 
      WHERE user_id = $1 AND scheduled_for > NOW()
      ORDER BY scheduled_for ASC
    `;
    
    const result = await pool.query(query, [user_id || 1]);

    // مصفوفة لربط كل قسم بالصورة والجملة المناسبة (Logic)
    const processedRows = result.rows.map(row => {
      let iconName = 'default.png';
      let customTitle = row.title;
      let customBody = row.body;

      // تخصيص الصور والأسماء بناءً على الـ Category المكتوب في قاعدة البيانات
      switch (row.category) {
        case 'breastfeeding':
          iconName = 'milk.png';
          break;
        case 'pregnancy':
          iconName = 'preg.png';
          break;
        case 'period':
          iconName = 'period.png';
          break;
        case 'fitness':
          iconName = 'fit.png';
          break;
        case 'medical':
          iconName = 'doctor.png';
          break;
        case 'mood':
          iconName = 'mood.png';
          break;
        case 'intimacy':
          iconName = 'heart.png';
          break;
        case 'motherhood':
          iconName = 'baby.png';
          break;
        default:
          iconName = 'default.png';
      }

      return {
        id: row.id,
        title: customTitle,
        body: customBody,
        scheduled_for: row.scheduled_for,
        category: row.category,
        image_url: `${BASE_URL}/icons/${iconName}` // رابط الصورة المباشر من موقعك
      };
    });

    return res.status(200).json({ rows: processedRows });

  } catch (error) {
    console.error('❌ Database Error:', error.message);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
