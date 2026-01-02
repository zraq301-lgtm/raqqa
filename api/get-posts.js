// File: api/get-posts.js
import { sql } from '@vercel/postgres';

// دالة لمعالجة طلبات GET
export default async function handler(request, response) {
    
    // ==========================================================
    // **1. إضافة رأس CORS لحل مشكلة المنع في المتصفح**
    // ==========================================================
    response.setHeader('Access-Control-Allow-Origin', '*'); 
    
    // نضمن أن طريقة الطلب هي GET فقط لجلب البيانات
    if (request.method !== 'GET') {
        return response.status(405).json({ error: 'Method Not Allowed, use GET' });
    }

    try {
        // تنفيذ استعلام الجلب (SELECT) مع إضافة عمود media_url لدعم الفيديو والصور
        const { rows } = await sql`
            SELECT id, content, section, type, media_url, created_at 
            FROM posts 
            ORDER BY created_at DESC;
        `;

        // إرسال المنشورات المجلوبة كاستجابة JSON
        // (ملاحظة: المنطق يستخدم مفاتيح bouh-display-1, bouh-display-2... في حقل 'section')
        return response.status(200).json({ posts: rows });

    } catch (error) {
        // التعامل مع أي خطأ يحدث أثناء الاتصال أو التنفيذ
        console.error('Database Fetch Error:', error);
        return response.status(500).json({ error: 'Failed to fetch posts from Neon/Vercel Postgres.' });
    }
}
