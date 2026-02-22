import { neon } from '@neondatabase/serverless';

export default async function handler(request, response) {
    // إعدادات الوصول CORS
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (request.method === 'OPTIONS') return response.status(200).end();

    if (request.method !== 'GET') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const sql = neon(process.env.DATABASE_URL);
        
        const rows = await sql`
            SELECT id, content, section, type, media_url, created_at 
            FROM posts 
            ORDER BY created_at DESC;
        `;

        return response.status(200).json({ posts: rows });
    } catch (error) {
        console.error('Database Fetch Error:', error);
        return response.status(500).json({ error: 'Database Error', details: error.message });
    }
}
