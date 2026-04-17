const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json()); // لاستقبال بيانات JSON من الواجهة

// إعداد الاتصال باستخدام المتغير POSTGRES_PRISMA_URL
const pool = new Pool({
  connectionString: process.env.POSTGRES_PRISMA_URL,
  ssl: {
    rejectUnauthorized: false // مطلوب للاتصال بـ Neon
  }
});

// المسار (Endpoint) لحفظ البيانات
app.post('/api/posts', async (req, res) => {
  const { posts, age } = req.body;

  // التحقق من وصول البيانات
  if (!posts || !Array.isArray(posts)) {
    return res.status(400).json({ error: 'يرجى إرسال مصفوفة المنشورات بشكل صحيح' });
  }

  try {
    const client = await pool.connect();
    
    try {
      // بدء عملية (Transaction) لضمان حفظ كل البيانات أو فشلها معاً
      await client.query('BEGIN');

      const queryText = 'INSERT INTO posts_table (content, link, user_age) VALUES ($1, $2, $3)';

      // تكرار على مصفوفة المنشورات وحفظها مع العمر
      for (const item of posts) {
        await client.query(queryText, [item.content, item.url, age]);
      }

      await client.query('COMMIT');
      res.status(200).json({ message: 'تم حفظ المنشورات والعمر بنجاح' });

    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Database Error:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء الحفظ في قاعدة البيانات' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
