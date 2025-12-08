// File: api/get-posts.js

import { sql } from '@vercel/postgres';

// دالة لمعالجة طلبات GET
export default async function handler(request, response) {
    
    // نضمن أن طريقة الطلب هي GET فقط لجلب البيانات
    if (request.method !== 'GET') {
        return response.status(405).json({ error: 'Method Not Allowed, use GET' });
    }

    try {
        // تنفيذ استعلام الجلب (SELECT)
        // ORDER BY created_at DESC لضمان ظهور أحدث المنشورات أولاً
        // يتم جلب البيانات من جدول 'posts' الذي سيتم إنشاؤه
        const { rows } = await sql`
            SELECT id, content, section, type, created_at 
            FROM posts 
            ORDER BY created_at DESC;
        `;

        // إرسال المنشورات المجلوبة كاستجابة JSON
        return response.status(200).json({ posts: rows });

    } catch (error) {
        // التعامل مع أي خطأ يحدث أثناء الاتصال أو التنفيذ
        console.error('Database Fetch Error:', error);
        // في بيئة الإنتاج، قد لا ترغب في إظهار تفاصيل الخطأ للمستخدم النهائي
        return response.status(500).json({ error: 'Failed to fetch posts from Neon/Vercel Postgres.' });
    }
}
