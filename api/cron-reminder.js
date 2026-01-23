import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
    try {
        // 1. جلب السجلات التي مر عليها 25 يوماً ولم يتم التذكير بها
        const usersToRemind = await sql`
            SELECT * FROM health_tracking 
            WHERE category = 'الحيض' 
            AND created_at::date = CURRENT_DATE - INTERVAL '25 days';
        `;

        for (const user of usersToRemind.rows) {
            // 2. استشارة الذكاء الاصطناعي GROQ لكتابة نصيحة مخصصة
            const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: "mixtral-8x7b-32768",
                    messages: [
                        { role: "system", content: "أنتِ رقة، رفيقة صحية. اكتبي تذكيراً رقيقاً جداً باقتراب موعد الدورة." },
                        { role: "user", content: "اكتبي نصيحة لسيدة سجلت دورتها منذ 25 يوماً." }
                    ]
                })
            });

            const aiData = await groqRes.json();
            const aiMessage = aiData.choices[0].message.content;

            // 3. وضع النصيحة في جدول الإشعارات (الجرس)
            await sql`
                INSERT INTO notifications (user_id, title, body, type)
                VALUES (${user.user_id}, 'تذكير رقة الرقيق 🌸', ${aiMessage}, 'info');
            `;
        }

        return res.status(200).json({ success: true, processed: usersToRemind.rowCount });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
