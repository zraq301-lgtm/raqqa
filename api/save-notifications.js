import pkg from 'pg';
const { Pool } = pkg;

// تحسين: التعامل مع الاتصال بشكل أكثر استقراراً في Serverless
const dbUrl = new URL(process.env.DATABASE_URL);
const poolConfig = {
  host: dbUrl.hostname,
  port: dbUrl.port,
  user: dbUrl.username,
  password: dbUrl.password,
  database: dbUrl.pathname.split('/')[1],
  ssl: { rejectUnauthorized: false },
  max: 1,
  idleTimeoutMillis: 30000, // مهلة للاتصالات الخاملة
  connectionTimeoutMillis: 2000,
};

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  // إنشاء Pool داخل الدالة أو استخدام واحد خارجي بحذر
  const pool = new Pool(poolConfig);

  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    // 1. جلب البيانات
    const query = `
      SELECT * FROM notifications  
      WHERE (scheduled_for BETWEEN $1 AND $2)  
      AND is_sent = false  
      LIMIT 5
    `;
    const { rows } = await pool.query(query, [yesterday.toISOString(), tomorrow.toISOString()]);

    if (rows.length === 0) {
      await pool.end(); // إغلاق الاتصال قبل الخروج
      return res.status(200).json({ message: "لا توجد بيانات للمعالجة حالياً." });
    }

    const results = [];

    for (const record of rows) {
      const aiPrompt = `اكتب نص إشعار قصير ومحفز لفئة ${record.category}. العنوان الأصلي: ${record.title}. المحتوى: ${record.body}`;

      // 2. استدعاء الذكاء الاصطناعي
      const aiResponse = await fetch('https://raqqa-v6cd.vercel.app/api/raqqa-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt })
      });
      const aiData = await aiResponse.json();
      const smartBody = aiData.text || record.body;

      // 3. إرسال FCM
      await fetch('https://raqqa-hjl8.vercel.app/api/send-fcm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: record.fcm_token,
          title: record.title,
          body: smartBody,
          data: record.extra_data
        })
      });

      // 4. التحديث في نيون (أهم خطوة)
      // أضفنا await لضمان أن الاستعلام ينتهي قبل الانتقال للإشعار التالي
      await pool.query('UPDATE notifications SET is_sent = true WHERE id = $1', [record.id]);

      results.push({ id: record.id, status: 'Sent', ai_text: smartBody });
    }

    // ضروري جداً في Serverless: إغلاق الـ Pool لضمان تنفيذ كل الـ Queries المعلقة
    await pool.end();

    return res.status(200).json({
      success: true,
      processed_count: results.length,
      details: results
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    // إغلاق الـ Pool حتى في حالة الخطأ
    try { await pool.end(); } catch (e) {}
    return res.status(500).json({ success: false, error: error.message });
  }
}
