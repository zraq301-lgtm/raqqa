import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
    // 1. التأكد من أن الطريقة هي DELETE لمنع أخطاء السجلات (Security check)
    if (req.method !== 'DELETE') {
        return res.status(405).json({ message: 'يرجى استخدام DELETE للحذف' });
    }

    const { id } = req.query; // استلام الـ ID من الرابط

    if (!id) {
        return res.status(400).json({ success: false, error: 'معرف السجل مفقود' });
    }

    try {
        const sql = neon(process.env.DATABASE_URL);

        // 2. تنفيذ الحذف الفعلي من جدول health_tracking
        await sql`DELETE FROM health_tracking WHERE id = ${id}`;

        return res.status(200).json({ success: true, message: 'تم الحذف بنجاح' });
    } catch (error) {
        console.error('Database Error:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
}
