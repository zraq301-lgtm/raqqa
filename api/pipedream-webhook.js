import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
    // إعدادات السماح للواجهة بالوصول (CORS)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    // نتحقق أن المنصة ترسل طلب POST
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'فقط طلبات POST مسموحة' });
    }

    // استلام البيانات القادمة من Pipedream (النصيحة، التوقيت، الفئة)
    const { user_id, title, body, category, type } = req.body;

    try {
        const sql = neon(process.env.POSTGRES_URL);

        // 1. حفظ الإشعار في جدول نيون (Neon) ليكون سجلاً دائماً
        const result = await sql`
            INSERT INTO notifications (user_id, title, body, is_read, created_at)
            VALUES (${user_id || 1}, ${title || 'تنبيه من رقة ✨'}, ${body}, false, NOW())
            RETURNING id;
        `;

        // 2. إرجاع استجابة نجاح للمنصة
        return res.status(200).json({ 
            success: true, 
            message: 'تم استلام الإشعار من المنصة وحفظه بنجاح',
            notification_id: result[0].id 
        });

    } catch (error) {
        console.error('Webhook Error:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
}
