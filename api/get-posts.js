// File: api/get-posts.js
import { sql } from '@vercel/postgres';

export default async function handler(request, response) {
    
    // إعدادات CORS للسماح بالوصول من المتصفح
    response.setHeader('Access-Control-Allow-Origin', '*'); 
    response.setHeader('Access-Control-Allow-Methods', 'GET');
    
    if (request.method !== 'GET') {
        return response.status(405).json({ error: 'Method Not Allowed, use GET' });
    }

    try {
        // الاستعلام المحدث لجلب محتوى الوسائط
        // تأكدي من وجود عمود media_url في جدول posts في Neon
        const { rows } = await sql`
            SELECT 
                id, 
                content, 
                section, 
                type, 
                media_url, 
                created_at 
            FROM posts 
            ORDER BY created_at DESC;
        `;

        // إرسال البيانات إلى التطبيق
        return response.status(200).json({ posts: rows });

    } catch (error) {
        // تسجيل الخطأ التفصيلي في Vercel Logs
        console.error('Database Fetch Error:', error);
        
        // رسالة خطأ واضحة في حال فقدان عمود media_url
        return response.status(500).json({ 
            error: 'Database Error', 
            details: error.message 
        });
    }
}
