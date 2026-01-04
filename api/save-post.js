// نقوم باستيراد دالة 'sql' من حزمة @vercel/postgres
import { sql } from '@vercel/postgres';
// استيراد دالة الرفع إلى Blob
import { put } from '@vercel/blob';

export default async function handler(request, response) {
    
    // ==========================================================
    // **1. حل مشكلة OPTIONS 405 (إصلاح CORS)**
    // هذا الشرط ضروري للسماح لطلبات المتصفح المُرسلة من الواجهة الأمامية بالمرور.
    // ==========================================================
    if (request.method === 'OPTIONS') {
        // تعيين رؤوس CORS للسماح بالوصول من أي مصدر ولطرق POST و OPTIONS
        response.setHeader('Access-Control-Allow-Origin', '*'); // للسماح بالوصول من أي نطاق
        response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS'); // السماح بطرق POST و OPTIONS
        response.setHeader('Access-Control-Allow-Headers', 'Content-Type'); // السماح بنوع المحتوى JSON
        response.status(200).end(); // إرجاع استجابة نجاح (200) لإنهاء طلب OPTIONS
        return;
    }
    
    // تعيين رأس CORS لطلب POST الفعلي أيضاً (يضمن عدم ظهور مشاكل لاحقاً)
    response.setHeader('Access-Control-Allow-Origin', '*'); 

    // ==========================================================
    // 2. معالجة طلب POST (الحفظ)
    // ==========================================================
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed, use POST' });
    }

    try {
        // قراءة البيانات المرسلة من الواجهة الأمامية (ملف admin.html)
        // أضفنا media_url لاستقبال بيانات الـ Base64 من كود الإدارة
        const { content, section, type, created_at, media_url } = request.body;

        // التحقق من وجود البيانات المطلوبة
        if (!content || !section || !type) {
            return response.status(400).json({ error: 'Missing required fields (content, section, type)' });
        }

        let finalMediaUrl = null;

        // **إضافة دالة الرفع إلى Blob**
        // إذا كان هناك ملف مروفوع (Base64) نقوم بتحويله ورفعه لـ Blob
        if (media_url && media_url.startsWith('data:')) {
            const buffer = Buffer.from(media_url.split(',')[1], 'base64');
            const fileName = `raqqa-${Date.now()}-${section}`;
            
            // رفع الملف إلى Vercel Blob
            const blob = await put(fileName, buffer, {
                access: 'public',
                contentType: type === 'فيديو' ? 'video/mp4' : 'image/jpeg'
            });
            
            finalMediaUrl = blob.url; // الرابط الذي سيتم حفظه في نيون
        }
        
        // تنفيذ استعلام الإدخال (INSERT) إلى قاعدة بيانات Neon
        // ملاحظة: قمنا بإضافة قيمة افتراضية للتاريخ في حال لم يتم إرساله
        // أضفنا عمود media_url في الاستعلام
        const result = await sql`
            INSERT INTO posts (content, section, type, created_at, media_url)
            VALUES (${content}, ${section}, ${type}, ${created_at || new Date().toISOString()}, ${finalMediaUrl});
        `;

        // إرسال استجابة نجاح (201 Created)
        return response.status(201).json({ 
            message: 'Post successfully saved to Neon!', 
            postData: { content, section, type, media_url: finalMediaUrl } 
        });

    } catch (error) {
        // التعامل مع أي خطأ يحدث أثناء الاتصال أو التنفيذ
        console.error('Database Save Error:', error);
        return response.status(500).json({ error: 'Failed to save post to database.', details: error.message });
    }
                }
