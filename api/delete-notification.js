import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
    // 1. التأكد من نوع الطلب لضمان الأمان وتجنب أخطاء السجلات
    if (req.method !== 'DELETE') {
        return res.status(405).json({ message: 'Method Not Allowed. Please use DELETE method.' });
    }

    const { id } = req.query; // استلام معرف السجل المراد حذفه

    if (!id) {
        return res.status(400).json({ success: false, error: 'Missing notification ID' });
    }

    try {
        const sql = neon(process.env.DATABASE_URL);

        // 2. تنفيذ الحذف من جدول health_tracking الصحيح
        await sql`DELETE FROM health_tracking WHERE id = ${id}`;

        // 3. إرسال رد النجاح
        return res.status(200).json({ success: true, message: 'تم الحذف من قاعدة البيانات بنجاح' });
        
    } catch (error) {
        console.error('Database Error:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
}
