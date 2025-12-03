// 1. استيراد المكتبات الضرورية
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';

// 2. الوصول إلى متغيرات البيئة السرية
// GEMINI_API_KEY: مفتاح Gemini API لإنشاء المحتوى.
const geminiApiKey = process.env.GEMINI_API_KEY;

// SUPABASE_SERVICE_ROLE_KEY: مفتاح Supabase السري لتجاوز RLS والحفظ.
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// NEXT_PUBLIC_SUPABASE_URL: رابط المشروع العام.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

// تهيئة عميل Gemini
const ai = new GoogleGenAI({ apiKey: geminiApiKey });

// تهيئة عميل Supabase باستخدام المفتاح السري (للحفظ من الخادم بأقصى صلاحية)
// يستخدم المفتاح السري هنا ولا يتم كشفه للواجهة الأمامية.
const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    },
    global: {
        // تأكد من تمرير fetch لوظائف Vercel
        fetch: fetch 
    }
});

/**
 * دالة مساعدة لاستخلاص العنوان والمحتوى من نص Gemini
 * تفرض على Gemini تنسيق محدد باستخدام delimiters
 */
function extractTitleAndContent(text) {
    // يجب أن تطلب من Gemini أن يضع العنوان بين علامات ###TITLE### والمحتوى بين ###CONTENT###
    const titleMatch = text.match(/###TITLE###\s*(.*?)\s*###TITLE###/s);
    const contentMatch = text.match(/###CONTENT###\s*(.*?)\s*###CONTENT###/s);

    const title = titleMatch ? titleMatch[1].trim() : "منشور جديد بدون عنوان";
    const content = contentMatch ? contentMatch[1].trim() : text.trim();

    return { title, content };
}


// 3. وظيفة Vercel Serverless الرئيسية
export default async function handler(request, response) {
    // التحقق من أن الطلب من نوع POST
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed. Use POST.' });
    }

    try {
        const { prompt, user_id } = request.body;

        if (!prompt || !user_id) {
            return response.status(400).json({ error: 'Missing prompt or user_id in request body.' });
        }

        // 4. استدعاء نموذج Gemini لإنشاء المحتوى
        // تحديد تنسيق الإخراج المطلوب للمساعدة في الاستخلاص لاحقاً
        const systemInstruction = `
            أنت مساعد متخصص في إنشاء منشورات جذابة.
            قم بإنشاء عنوان ومحتوى بناءً على طلب المستخدم.
            يجب أن يكون الإخراج بتنسيق صارم:
            ###TITLE###[العنوان هنا]###TITLE###
            ###CONTENT###[المحتوى المفصل هنا]###CONTENT###
            لا تضف أي نص آخر خارج هذين الـ delimiters.
        `;

        const geminiResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
            }
        });
        
        const generatedText = geminiResponse.text.trim();
        const { title, content } = extractTitleAndContent(generatedText);

        // 5. حفظ المنشور في Supabase
        const { data, error } = await supabase
            .from('posts') // اسم الجدول الذي أنشأناه
            .insert([
                { 
                    user_id: user_id, 
                    title: title, 
                    content: content 
                }
            ])
            .select(); // لاسترداد البيانات المحفوظة

        if (error) {
            console.error('Supabase Save Error:', error);
            // إرسال رسالة خطأ واضحة
            return response.status(500).json({ 
                error: 'Failed to save post to database.', 
                details: error.message 
            });
        }
        
        // 6. إرجاع المنشور الذي تم إنشاؤه وحفظه بنجاح
        return response.status(201).json({ 
            message: 'Post created and saved successfully.', 
            post: data[0] // إرجاع المنشور المحفوظ
        });

    } catch (error) {
        console.error('API Execution Error:', error);
        return response.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
}
