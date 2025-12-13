// File: api/delete-post.js
// الوظيفة: حذف محتوى محدد من قاعدة بيانات Neon PostGres

import { sql } from '@vercel/postgres';

// دالة لمعالجة طلبات DELETE
export default async function handler(request, response) {
    
    // 1. التحقق من طريقة الطلب (يجب أن تكون DELETE)
    if (request.method !== 'DELETE') {
        return response.status(405).json({ error: 'Method Not Allowed, use DELETE' });
    }

    try {
        // 2. استلام مُعرّف المنشور (ID) من خلال Query Parameter
        // (الواجهة الأمامية ترسل الطلب بهذا الشكل: /api/delete-post?id=123)
        const { id } = request.query;

        if (!id) {
            return response.status(400).json({ error: 'Missing required field (id)' });
        }
        
        // 3. تنفيذ استعلام الحذف (DELETE) باستخدام المُعرّف
        const result = await sql`
            DELETE FROM posts
            WHERE id = ${id};
        `;
        
        // 4. التحقق من نجاح عملية الحذف
        if (result.rowCount === 0) {
             // لم يتم العثور على أي صف للحذف
             return response.status(404).json({ message: `Post with ID ${id} not found or already deleted.` });
        }

        // 5. إرسال استجابة نجاح
        return response.status(200).json({ message: `Post with ID ${id} successfully deleted from Neon.` });

    } catch (error) {
        // 6. التعامل مع الأخطاء
        console.error('Database Delete Error:', error);
        return response.status(500).json({ error: 'Failed to delete post from database.', details: error.message });
    }
}