import { neon } from '@neondatabase/serverless';

export default async function handler(request, response) {
    // إعدادات CORS للسماح بالوصول من الواجهة الأمامية
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // التعامل مع طلب preflight الخاص بـ CORS
    if (request.method === 'OPTIONS') return response.status(200).end();

    // السماح فقط بطريقة POST
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        // استخدام المتغير الذي حددته
        const sql = neon(process.env.post_POSTGRES_URL);
        
        // استلام البيانات من الواجهة
        const { posts, age } = request.body;

        if (!posts || !Array.isArray(posts)) {
            return response.status(400).json({ error: 'Missing or invalid posts array' });
        }

        // إدخال البيانات في الجدول (حسب الأسماء الموجودة في كود الجلب الخاص بك)
        // سنفترض أن الأعمدة هي content و media_url و سنضيف age إذا كان موجوداً في جدولك
        for (const post of posts) {
            await sql`
                INSERT INTO posts (content, media_url, age) 
                VALUES (${post.content}, ${post.url || post.media_url}, ${age})
            `;
        }

        return response.status(200).json({ 
            success: true, 
            message: `تم حفظ ${posts.length} منشورات بنجاح` 
        });

    } catch (error) {
        console.error('Database Save Error:', error);
        return response.status(500).json({ 
            error: 'Database Error', 
            details: error.message 
        });
    }
}
