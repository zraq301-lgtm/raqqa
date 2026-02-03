import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
    if (req.method !== 'DELETE') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { id } = req.query;

    try {
        // قمنا بتغيير DATABASE_URL إلى POSTGRES_URL لتطابق ما هو موجود في لقطة الشاشة الخاصة بكِ
        const sql = neon(process.env.POSTGRES_URL);

        // الحذف من الجدول الذي أكدتِ اسمه
        await sql`DELETE FROM health_tracking WHERE id = ${id}`;

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, error: error.message });
    }
}
