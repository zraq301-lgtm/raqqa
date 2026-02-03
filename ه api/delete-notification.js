import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
    // 1. التأكد أن الطلب هو DELETE لضمان الأمان ومنع أخطاء السجلات
    if (req.method !== 'DELETE') {
        return res.status(405).json({ message: 'طريقة غير مسموح بها، يرجى استخدام DELETE' });
    }

    // 2. الحصول على معرف الإشعار المراد حذفه من الرابط
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ message: 'معرف الإشعار مفقود' });
    }

    try {
        // 3. الاتصال بقاعدة بيانات نيون باستخدام الرابط المخزن في البيئة
        const sql = neon(process.env.DATABASE_URL);

        // 4. تنفيذ أمر الحذف الفعلي من الجدول
        await sql`DELETE FROM notifications WHERE id = ${id}`;

        // 5. إرسال رد بنجاح العملية
        return res.status(200).json({ success: true, message: 'تم حذف الإشعار بنجاح' });
        
    } catch (error) {
        console.error('Database Error:', error);
        return res.status(500).json({ success: false, error: 'حدث خطأ أثناء الحذف من قاعدة البيانات' });
    }
}
