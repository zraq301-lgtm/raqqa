import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
    // 1. التأكد من أن نوع الطلب هو DELETE للحماية
    if (req.method !== 'DELETE') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    // 2. استلام المعرف (id) الخاص بالإشعار من رابط الاستدعاء
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ success: false, error: 'ID is missing' });
    }

    try {
        // 3. الاتصال بقاعدة بيانات Neon باستخدام الرابط الصحيح من Vercel
        const sql = neon(process.env.POSTGRES_URL);

        // 4. تنفيذ أمر الحذف من جدول notifications (الجدول الجديد)
        const result = await sql`DELETE FROM notifications WHERE id = ${id} RETURNING id`;

        // 5. التحقق مما إذا كان السجل موجوداً بالفعل وتم حذفه
        if (result.length === 0) {
            return res.status(404).json({ 
                success: false, 
                error: 'الإشعار غير موجود في قاعدة البيانات، ربما تم حذفه مسبقاً' 
            });
        }

        // 6. إرسال استجابة بالنجاح
        return res.status(200).json({ success: true, message: 'تم الحذف بنجاح' });

    } catch (error) {
        // في حال حدوث خطأ في الاتصال أو هيكل الجدول (مثل نقص عمود is_read)
        console.error('Database Error:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
}
