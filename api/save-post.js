import { neon } from '@neondatabase/serverless';

export default async function handler(request, response) {
    // إعدادات CORS
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (request.method === 'OPTIONS') return response.status(200).end();
    if (request.method !== 'POST') return response.status(405).json({ error: 'Method Not Allowed' });

    try {
        const sql = neon(process.env.DATABASE_URL);
        const body = request.body || {};

        // 1. استخراج البيانات (المصفوفة الذكية)
        let entries = [];
        if (Array.isArray(body)) entries = body;
        else if (body.posts && Array.isArray(body.posts)) entries = body.posts;
        else if (body.data && Array.isArray(body.data)) entries = body.data;
        else if (typeof body === 'object' && Object.keys(body).length > 0) entries = [body];

        if (entries.length === 0) {
            return response.status(200).json({ message: 'No data to process' });
        }

        // 2. معالجة البيانات وحفظها بناءً على أعمدة الجدول في الصور
        const insertPromises = entries.map(entry => {
            // محتوى المنشور
            const content = entry.content || entry.text || entry.body || '';
            
            // الرابط (media_url)
            const mediaUrl = entry.media_url || entry.url || entry.link || entry.image || '';
            
            // القسم (section) - مثل bouh-display
            const section = entry.section || body.section || 'default';
            
            // النوع (type) - مثل نصي أو رابط
            const type = entry.type || (mediaUrl ? 'رابط' : 'نصي');
            
            // التفاعلات (likes & comments)
            const likes = parseInt(entry.likes_count || entry.likes || 0);
            const comments = parseInt(entry.comments_count || entry.comments || 0);
            
            // البيانات الشخصية (age & name)
            const age = parseInt(entry.age || body.age || 0);
            const name = entry.name || body.name || null;

            return sql`
                INSERT INTO posts (
                    content, 
                    media_url, 
                    section, 
                    type, 
                    likes_count, 
                    comments_count, 
                    age, 
                    name
                ) 
                VALUES (
                    ${content}, 
                    ${mediaUrl}, 
                    ${section}, 
                    ${type}, 
                    ${likes}, 
                    ${comments}, 
                    ${age}, 
                    ${name}
                )
            `;
        });

        await Promise.all(insertPromises);

        return response.status(200).json({ 
            success: true, 
            count: entries.length,
            message: 'تم حفظ البيانات بنجاح طبقاً لتنسيق الجدول' 
        });

    } catch (error) {
        console.error('Database Error:', error);
        return response.status(500).json({ error: 'Database Error', details: error.message });
    }
}
