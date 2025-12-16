// File: api/delete-post.js
// الوظيفة: حذف محتوى محدد من قاعدة بيانات Neon PostGres

import { sql } from '@vercel/postgres';

// دالة لمعالجة طلبات DELETE
export default async function handler(request, response) {
    
    // ==========================================================
    // 1. **الحل المقترح:** إضافة معالجة طلب OPTIONS والسماح بـ DELETE
    // ==========================================================
    if (request.method === 'OPTIONS') {
        // تعيين رؤوس CORS للسماح بالوصول من أي مصدر ولطرق DELETE و OPTIONS
        response.setHeader('Access-Control-Allow-Origin', '*'); 
        response.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS'); // **تم إضافة DELETE**
        response.setHeader('Access-Control-Allow-Headers', 'Content-Type'); 
        response.status(200).end(); 
        return;
    }
    
    // تعيين رأس CORS لطلب DELETE الفعلي أيضاً
    response.setHeader('Access-Control-Allow-Origin', '*');

    // 2. التحقق من طريقة الطلب (يجب أن تكون DELETE)
    if (request.method !== 'DELETE') {
        // هذا الشرط لن يتم تنفيذه في حالة مشكلة CORS
        return response.status(405).json({ error: 'Method Not Allowed, use DELETE' });
    }

    try {
        // ... (باقي منطق الحذف)
        const { id } = request.query;

        if (!id) {
            return response.status(400).json({ error: 'Missing required field (id)' });
        }
        
        // تنفيذ استعلام الحذف (DELETE)
        const result = await sql`
            DELETE FROM posts
            WHERE id = ${id};
        `;
        
        // التحقق من نجاح عملية الحذف
        if (result.rowCount === 0) {
             return response.status(404).json({ message: `Post with ID ${id} not found or already deleted.` });
        }

        // إرسال استجابة نجاح
        return response.status(200).json({ message: `Post with ID ${id} successfully deleted from Neon.` });

    } catch (error) {
        // التعامل مع الأخطاء
        console.error('Database Delete Error:', error);
        return response.status(500).json({ error: 'Failed to delete post from database.', details: error.message });
    }
                }
