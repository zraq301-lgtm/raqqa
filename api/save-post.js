import { neon } from '@neondatabase/serverless';

export default async function handler(request, response) {
    // إعدادات CORS للسماح بالوصول من أي مكان
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (request.method === 'OPTIONS') return response.status(200).end();
    if (request.method !== 'POST') return response.status(405).json({ error: 'Method Not Allowed' });

    try {
        const sql = neon(process.env.DATABASE_URL);
        const body = request.body || {};

        // تحويل البيانات القادمة لمصفوفة للتعامل معها بمرونة
        let entries = [];
        if (Array.isArray(body)) entries = body;
        else if (body.posts && Array.isArray(body.posts)) entries = body.posts;
        else if (typeof body === 'object' && Object.keys(body).length > 0) entries = [body];

        // فلترة البيانات لضمان عدم حفظ منشور فارغ تماماً
        const validEntries = entries.filter(e => e.content || e.media_url || e.text || e.url);

        if (validEntries.length === 0) {
            return response.status(200).json({ success: false, message: 'لا توجد بيانات صالحة للحفظ' });
        }

        const results = [];

        // استخدام الـ Loop لضمان حفظ كل عنصر بشكل مؤكد
        for (const entry of validEntries) {
            // استخراج القيم مع مراعاة المسميات المختلفة
            const content = entry.content || entry.text || '';
            const media_url = entry.media_url || entry.url || entry.link || '';
            const section = entry.section || body.section || 'bouh-display';
            const post_type = entry.type || (media_url ? 'رابط' : 'نصي');
            const likes = parseInt(entry.likes_count || entry.likes || 0);
            const comments = parseInt(entry.comments_count || entry.comments || 0);
            const age = parseInt(entry.age || body.age || 0);
            const name = entry.name || body.name || null;

            // تنفيذ الإدخال الفعلي في الجدول
            const res = await sql`
                INSERT INTO posts (
                    content, media_url, section, type, 
                    likes_count, comments_count, age, name
                ) VALUES (
                    ${content}, ${media_url}, ${section}, ${post_type}, 
                    ${likes}, ${comments}, ${age}, ${name}
                ) RETURNING id;
            `;
            results.push(res[0].id);
        }

        return response.status(200).json({ 
            success: true, 
            message: `تم حفظ ${results.length} منشور بنجاح`,
            ids: results 
        });

    } catch (error) {
        console.error('Neon Error:', error);
        return response.status(500).json({ 
            error: 'Database Error', 
            details: error.message 
        });
    }
}
