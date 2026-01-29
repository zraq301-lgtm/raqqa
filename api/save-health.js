import { sql } from '@vercel/postgres';
import { Knock } from "@knocklabs/node";

// تهيئة مكتبة Knock باستخدام المفتاح السري المضاف في Vercel
const knock = new Knock(process.env.KNOCK_API_KEY);

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
    
    const { user_id, category, value, note } = req.body;

    try {
        // 1. الحفظ في جدول health_tracking
        await sql`
            INSERT INTO health_tracking (user_id, category, numeric_value, text_note)
            VALUES (${user_id}, ${category}, ${value}, ${note});
        `;

        let aiAdvice = `تم تسجيل ${category} بنجاح في رقة ✨`;

        // 2. جلب نصيحة من GROQ
        try {
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: "mixtral-8x7b-32768",
                    messages: [
                        { role: "system", content: "أنتِ طبيبة رقة. قدمي نصيحة طبية قصيرة جداً ورقيقة." },
                        { role: "user", content: `الفئة: ${category}، القيمة: ${value}` }
                    ]
                })
            });
            const data = await response.json();
            if (data?.choices?.[0]) {
                aiAdvice = data.choices[0].message.content;
            }
        } catch (aiError) {
            console.error("AI Error:", aiError);
        }

        // 3. حفظ الإشعار في جدول notifications (Neon)
        await sql`
            INSERT INTO notifications (user_id, title, body)
            VALUES (${user_id}, 'تنبيه من رقة ✨', ${aiAdvice});
        `;

        // --- التعديل الجديد (الربط مع Knock) ---
        // إرسال البيانات فوراً إلى سير العمل "raqqa" ليظهر الإشعار في الهاتف والواجهة
        try {
            await knock.workflows.trigger("raqqa", {
                recipients: [user_id.toString()], // التأكد من إرسال المعرف كـ String
                data: {
                    title: 'تنبيه من رقة ✨',
                    body: aiAdvice
                },
            });
        } catch (knockError) {
            console.error("Knock Webhook Error:", knockError);
            // لا يتم إيقاف العملية هنا لضمان وصول الرد للمستخدم حتى لو فشل الإشعار اللحظي
        }
        // ---------------------------------------

        return res.status(200).json({ success: true, advice: aiAdvice });

    } catch (dbError) {
        console.error("Database Error:", dbError);
        return res.status(500).json({ error: "فشل في الاتصال بقاعدة البيانات" });
    }
}
