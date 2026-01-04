import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    // استلام البيانات من الواجهة
    const { user_id, category, value, note, rating } = req.body;

    try {
        // الاستعلام متوافق مع جدول health_tracking
        await sql`
            INSERT INTO health_tracking (user_id, category, numeric_value, text_note, rating_score)
            VALUES (${user_id}, ${category}, ${value}, ${note}, ${rating});
        `;
        
        return res.status(200).json({ success: true, message: `تم تسجيل بيانات ${category} بنجاح` });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "خطأ في الاتصال بقاعدة البيانات" });
    }
}
