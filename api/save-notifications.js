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
  // نستخدم GET أو POST لجلب البيانات ومعالجتها
  if (req.method !== 'POST' && req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    // 1. تحديد النطاق الزمني (يوم ماضي ويوم مستقبلي)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    // 2. جلب البيانات من قاعدة البيانات
    // نقوم بجلب التذكيرات التي تقع في هذا النطاق ولم يتم إرسالها بعد
    const query = `
      SELECT * FROM notifications 
      WHERE (scheduled_for BETWEEN $1 AND $2) 
      AND is_sent = false 
      LIMIT 5
    `;
    const { rows } = await pool.query(query, [yesterday.toISOString(), tomorrow.toISOString()]);

    if (rows.length === 0) {
      return res.status(200).json({ message: "لا توجد بيانات للمعالجة حالياً." });
    }

    const results = [];

    for (const record of rows) {
      // 3. صياغة محتوى للذكاء الاصطناعي بناءً على الفئة (Category)
      const aiPrompt = `اكتب نص إشعار قصير ومحفز لفئة ${record.category}. العنوان الأصلي: ${record.title}. المحتوى: ${record.body}`;

      // 4. استدعاء رابط الذكاء الاصطناعي (Raqqa AI)
      const aiResponse = await fetch('https://raqqa-v6cd.vercel.app/api/raqqa-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt })
      });
      const aiData = await aiResponse.json();
      const smartBody = aiData.text || record.body; // استخدام نص الذكاء الاصطناعي أو النص الأصلي كبديل

      // 5. إرسال الإشعار عبر رابط FCM
      const fcmResponse = await fetch('https://raqqa-hjl8.vercel.app/api/send-fcm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: record.fcm_token,
          title: record.title,
          body: smartBody,
          data: record.extra_data
        })
      });
      const fcmResult = await fcmResponse.json();

      // 6. تحديث حالة الإشعار في القاعدة بأنه "تم الإرسال"
      await pool.query('UPDATE notifications SET is_sent = true WHERE id = $1', [record.id]);

      results.push({ id: record.id, status: 'Sent', ai_text: smartBody });
    }

    return res.status(200).json({
      success: true,
      processed_count: results.length,
      details: results
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
}
