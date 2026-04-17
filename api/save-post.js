import { neon } from '@neondatabase/serverless';

export default async function handler(request, response) {
    // 1. إعدادات CORS
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (request.method === 'OPTIONS') return response.status(200).end();

    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        // التعديل هنا: استخدام الاسم الصحيح للمتغير
        const connectionString = process.env.DATABASE_URL;
        
        if (!connectionString) {
            throw new Error('متغير البيئة DATABASE_URL غير موجود في إعدادات Vercel');
        }

        const sql = neon(connectionString);
        const { posts, age } = request.body;

        if (!posts || !Array.isArray(posts)) {
            return response.status(400).json({ error: 'البيانات المرسلة غير مكتملة (posts مفقودة)' });
        }

        // تنفيذ الحفظ لجميع المنشورات
        const insertPromises = posts.map(post => {
            return sql`
                INSERT INTO posts (content, media_url, age) 
                VALUES (${post.content || ''}, ${post.url || post.media_url || ''}, ${age || 0})
            `;
        });

        await Promise.all(insertPromises);

        return response.status(200).json({ 
            success: true, 
            message: `تم حفظ ${posts.length} منشورات بنجاح` 
        });

    } catch (error) {
        console.error('Database Error:', error);
        return response.status(500).json({ 
            error: 'Database Error', 
            details: error.message 
        });
    }
}
