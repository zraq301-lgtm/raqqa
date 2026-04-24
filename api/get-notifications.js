import pkg from 'pg';
const { Pool } = pkg;

// استخدام WHATWG URL API بشكل صحيح لتجنب تحذير DEP0169
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
  // السماح بـ GET و POST للجلب والمعالجة
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // --- إضافة وظيفة الحذف التلقائي ---
    // حذف البيانات التي مر عليها يومان أو التي تم إرسالها (is_sent = true)
    const cleanupQuery = `
      DELETE FROM notifications 
      WHERE is_sent = true 
      OR scheduled_for < NOW() - INTERVAL '2 days'
    `;
    await pool.query(cleanupQuery);
    // --------------------------------

    // 1. ضبط توقيت الجلب (يوم ماضي ويوم مستقبلي)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    // 2. جلب الإشعارات المجدولة في هذا النطاق ولم تُرسل بعد
    const fetchQuery = `
      SELECT * FROM notifications 
      WHERE (scheduled_for BETWEEN $1 AND $2) 
      AND is_sent = false 
      LIMIT 10
    `;
    const { rows } = await pool.query(fetchQuery, [yesterday.toISOString(), tomorrow.toISOString()]);

    if (rows.length === 0) {
      return res.status(200).json({ success: true, message: "لا توجد بيانات بانتظار المعالجة." });
    }

    const processedResults = [];

    for (const record of rows) {
      // 3. صياغة طلب للذكاء الاصطناعي لتحسين المحتوى
      const aiPrompt = `بصفتك مساعداً ذكياً، حسن هذا الإشعار لفئة ${record.category}. العنوان: ${record.title}. النص: ${record.body}`;

      // استدعاء API الذكاء الاصطناعي
      let smartBody = record.body;
      try {
        const aiResponse = await fetch('https://raqqa-v6cd.vercel.app/api/raqqa-ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: aiPrompt })
        });
        const aiData = await aiResponse.json();
        if (aiData.text) smartBody = aiData.text;
      } catch (aiErr) {
        console.error("AI API Error, using original body.");
      }

      // 4. إرسال الإشعار عبر خدمة FCM الخاصة بك
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

      // 5. تحديث حالة الصف في قاعدة البيانات لعدم تكرار الإرسال
      await pool.query('UPDATE notifications SET is_sent = true WHERE id = $1', [record.id]);

      processedResults.push({ id: record.id, status: 'Sent', updated_content: smartBody });
    }

    return res.status(200).json({
      success: true,
      count: processedResults.length,
      data: processedResults
    });

  } catch (error) {
    console.error('❌ Server Error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
}
