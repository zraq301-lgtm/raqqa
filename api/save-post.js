const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

// تأكد من وضع المتغير في ملف .env أو إعدادات Vercel
const pool = new Pool({
  connectionString: process.env.POSTGRES_PRISMA_URL,
  ssl: { rejectUnauthorized: false }
});

app.post('/api/posts', async (req, res) => {
  console.log("--- طلب جديد وصل ---");
  console.log("البيانات القادمة:", JSON.stringify(req.body));

  const { posts, age } = req.body;

  // 1. التحقق من وجود البيانات
  if (!posts || !Array.isArray(posts)) {
    console.error("خطأ: مصفوفة المنشورات مفقودة أو غير صحيحة");
    return res.status(400).json({ error: 'بيانات posts غير صالحة' });
  }

  let client;
  try {
    client = await pool.connect();
    console.log("تم الاتصال بـ Neon بنجاح");

    await client.query('BEGIN');

    for (const post of posts) {
      const query = 'INSERT INTO posts_table (content, link, user_age) VALUES ($1, $2, $3)';
      // تأكد أن الأسماء (content و url) تطابق ما ترسله من الواجهة
      await client.query(query, [post.content, post.url, age]);
    }

    await client.query('COMMIT');
    console.log("تم الحفظ في القاعدة بنجاح");
    res.status(200).json({ success: true, message: 'Saved successfully' });

  } catch (error) {
    if (client) await client.query('ROLLBACK');
    console.error("خطأ كارثي في السيرفر:", error.message);
    res.status(500).json({ 
      error: 'Internal Server Error', 
      details: error.message 
    });
  } finally {
    if (client) client.release();
  }
});

// لمعالجة أي مسار غير موجود
app.use((req, res) => {
  res.status(404).json({ error: "المسار غير موجود (404)" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server ready on port ${PORT}`));
