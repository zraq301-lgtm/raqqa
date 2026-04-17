import { neon } from '@neondatabase/serverless';

export default async function handler(request, response) {
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (request.method === 'OPTIONS') return response.status(200).end();
    if (request.method !== 'POST') return response.status(405).json({ error: 'Method Not Allowed' });

    try {
        const sql = neon(process.env.DATABASE_URL);
        
        // جلب البيانات مع وضع قيم افتراضية لمنع الانهيار
        const data = request.body || {};
        const posts = data.posts;
        const age = data.age || 0;

        // فحص دقيق للمصفوفة
        if (!posts || !Array.isArray(posts)) {
            return response.status(400).json({ 
                error: 'خطأ في استقبال البيانات', 
                received: data // سنرسل لك ما استلمه السيرفر لتعرف المشكلة
            });
        }

        // تنفيذ الحفظ
        for (const post of posts) {
            await sql`
                INSERT INTO posts (content, media_url, age) 
                VALUES (
                    ${post.content || ''}, 
                    ${post.url || post.media_url || ''}, 
                    ${age}
                )
            `;
        }

        return response.status(200).json({ success: true, count: posts.length });

    } catch (error) {
        console.error('Database Save Error:', error);
        return response.status(500).json({ error: 'Database Error', details: error.message });
    }
}
