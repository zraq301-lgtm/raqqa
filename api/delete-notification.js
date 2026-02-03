import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
    // التأكد من استخدام DELETE للحذف
    if (req.method !== 'DELETE') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    // استلام المعرف (id) من الرابط
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ success: false, error: 'ID is missing' });
    }

    try {
        // استخدام POSTGRES_URL كما يظهر في إعدادات فيرسل لديكِ
        const sql = neon(process.env.POSTGRES_URL);

        // تنفيذ الحذف الفعلي باستخدام الـ id من جدول health_tracking
        const result = await sql`DELETE FROM health_tracking WHERE id = ${id} RETURNING id`;

        if (result.length === 0) {
            // هذا يعني أن الـ id أُرسل للسيرفر لكنه غير موجود في قاعدة البيانات
            return res.status(404).json({ success: false, error: 'Record not found in database' });
        }

        return res.status(200).json({ success: true, message: 'Deleted successfully' });
    } catch (error) {
        console.error('Database Error:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
}
