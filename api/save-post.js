import { neon } from '@neondatabase/serverless';

export default async function handler(request, response) {
    // 1. إعدادات CORS الشاملة
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (request.method === 'OPTIONS') {
        return response.status(200).end();
    }

    // 2. التحقق من طريقة الطلب
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'يرجى استخدام POST لإرسال البيانات' });
    }

    try {
        // التحقق من وجود رابط القاعدة
        const connectionString = process.env.post_POSTGRES_URL;
        if (!connectionString) {
            throw new Error('متغير البيئة post_POSTGRES_URL غير موجود');
        }

        const sql = neon(connectionString);
        const { posts, age } = request.body;

        // 3. فحص البيانات القادمة
        if (!posts || !Array.isArray(posts)) {
            return response.status(400).json({ error: 'البيانات المرسلة غير صحيحة، posts يجب أن تكون مصفوفة' });
        }

        console.log(`بدء حفظ ${posts.length} منشورات للعمر ${age}`);

        // 4. تنفيذ الحفظ (استخدام Promise.all لضمان التنفيذ السريع والمتوازي)
        const insertPromises = posts.map(post => {
            return sql`
                INSERT INTO posts (content, media_url, age) 
                VALUES (${post.content || ''}, ${post.url || post.media_url || ''}, ${age || 0})
            `;
        });

        await Promise.all(insertPromises);

        // 5. إرسال رد النجاح
        return response.status(200).json({ 
            success: true, 
            message: 'تم الحفظ بنجاح في قاعدة بيانات نيون' 
        });

    } catch (error) {
        // 6. التقاط أي خطأ وإرساله فوراً للواجهة
        console.error('Detailed Error:', error);
        return response.status(500).json({ 
            error: 'حدث خطأ في السيرفر', 
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}
