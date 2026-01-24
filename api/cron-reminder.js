import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
    // التحقق من الأمان (اختياري: للتأكد من أن الطلب قادم من Vercel Cron فقط)
    const authHeader = req.headers.get('authorization');
    if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        // يمكنك تخطي هذا الشرط مؤقتاً للتجربة اليدوية
    }

    try {
        // 1. جلب السجلات التي مر عليها 25 يوماً (استخدام التاريخ الحالي - 25 يوم)
        // يعتمد الكود على جدول health_tracking ومفتاح POSTGRES_URL
        const usersToRemind = await sql`
            SELECT user_id FROM health_tracking 
            WHERE category = 'الحيض' 
            AND created_at::date = CURRENT_DATE - INTERVAL '25 days';
        `;

        // مصفوفة لتخزين نتائج المعالجة
        let processedCount = 0;

        for (const user of usersToRemind.rows) {
            try {
                // 2. استشارة الذكاء الاصطناعي GROQ
                const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: "mixtral-8x7b-32768",
                        messages: [
                            { 
                                role: "system", 
                                content: "أنتِ 'رقة'، رفيقة صحية بلهجة رقيقة. اكتبي تنبيهاً قصيراً جداً (أقل من 20 كلمة) يذكر السيدة باقتراب موعد دورتها الشهرية بأسلوب دافئ." 
                            },
                            { 
                                role: "user", 
                                content: "اكتبي نصيحة لسيدة سجلت بياناتها منذ 25 يوماً." 
                            }
                        ],
                        max_tokens: 150
                    })
                });

                const aiData = await groqRes.json();
                
                // التأكد من استلام رد من AI قبل الحفظ
                if (aiData.choices && aiData.choices.length > 0) {
                    const aiMessage = aiData.choices[0].message.content;

                    // 3. إدراج التنبيه في جدول notifications ليظهر في واجهتك الناجحة
                    // نستخدم الحقول المتوافقة مع كود الجلب (title, body, is_read)
                    await sql`
                        INSERT INTO notifications (user_id, title, body, is_read, type)
                        VALUES (${user.user_id}, 'تذكير رقة الرقيق 🌸', ${aiMessage}, FALSE, 'health');
                    `;
                    processedCount++;
                }
            } catch (innerError) {
                console.error(`خطأ في معالجة المستخدم ${user.user_id}:`, innerError.message);
                // الاستمرار مع المستخدم التالي في حال فشل واحد
            }
        }

        return res.status(200).json({ 
            success: true, 
            message: `تم فحص المواعيد بنجاح.`,
            notified_users: processedCount 
        });

    } catch (error) {
        console.error("Cron Error:", error.message);
        return res.status(500).json({ 
            success: false, 
            error: "فشل تشغيل المعالج التلقائي",
            details: error.message 
        });
    }
                    }
