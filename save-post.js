// نقوم باستيراد دالة 'sql' من حزمة @vercel/postgres
// هذه الحزمة مصممة للعمل بكفاءة مع Neon في بيئة Vercel
import { sql } from '@vercel/postgres';

// دالة لمعالجة طلبات POST
export default async function handler(request, response) {
    // نضمن أن طريقة الطلب هي POST فقط لعمليات الحفظ
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed, use POST' });
    }

    try {
        // قراءة البيانات المرسلة من الواجهة الأمامية (ملف index.html)
        const { content, section, type, created_at } = request.body;

        // التحقق من وجود البيانات المطلوبة
        if (!content || !section || !type) {
            return response.status(400).json({ error: 'Missing required fields (content, section, type)' });
        }
        
        // 💡 خطوة: يجب أن يكون لديك جدول باسم 'posts' (أو ما شابه) في Neon
        // ويحتوي على الأعمدة التالية: id (SERIAL), content (TEXT), section (TEXT), type (TEXT), created_at (TIMESTAMP)

        // تنفيذ استعلام الإدخال (INSERT) إلى قاعدة بيانات Neon
        // ملاحظة: يتم هنا استخدام 'sql' مباشرة، والتي تقرأ تلقائيًا متغيرات البيئة من Vercel
        const result = await sql`
            INSERT INTO posts (content, section, type, created_at)
            VALUES (${content}, ${section}, ${type}, ${created_at});
        `;

        // إرسال استجابة نجاح (201 Created)
        return response.status(201).json({ 
            message: 'Post successfully saved to Neon!', 
            postData: { content, section, type } 
        });

    } catch (error) {
        // التعامل مع أي خطأ يحدث أثناء الاتصال أو التنفيذ
        console.error('Database Save Error:', error);
        return response.status(500).json({ error: 'Failed to save post to database.', details: error.message });
    }
}