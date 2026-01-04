import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
    const { user_id } = req.query;

    try {
        // استعلام جلب آخر 5 أنشطة من جدولك الفعلي
        const { rows } = await sql`
            SELECT category, numeric_value, text_note, rating_score, log_date 
            FROM health_tracking 
            WHERE user_id = ${user_id} 
            ORDER BY created_at DESC 
            LIMIT 5;
        `;

        // هنا يتم دمج البيانات مع الـ AI (مثال مبسط للرد)
        return res.status(200).json({ 
            data: rows,
            ai_hint: "جاهز لتحليل هذه البيانات بواسطة طبيب رقة الافتراضي"
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
