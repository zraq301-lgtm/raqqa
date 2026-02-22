// File: api/get-posts.js
import { sql } from '@vercel/postgres';

export default async function handler(request, response) {
    
    // ربط مفتاح raqqa_POSTGRES_URL بمغيرات النظام لضمان عمل مكتبة vercel/postgres
    if (process.env.raqqa_POSTGRES_URL && !process.env.POSTGRES_URL) {
        process.env.POSTGRES_URL = process.env.raqqa_POSTGRES_URL;
    }

    // إعدادات CORS للسماح بالوصول من المتصفح
    response.setHeader('Access-Control-Allow-Origin', '*'); 
    response.setHeader('Access-Control-Allow-Methods', 'GET');
    
    if (request.method !== 'GET') {
        return response.status(405).json({ error: 'Method Not Allowed, use GET' });
    }

    try {
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

        return response.status(200).json({ posts: rows });

    } catch (error) {
        console.error('Database Fetch Error:', error);
        return response.status(500).json({ 
            error: 'Database Error', 
            details: error.message 
        });
    }
}
