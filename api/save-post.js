import { sql } from '@vercel/postgres';
import { put } from '@vercel/blob';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // زيادة حد حجم البيانات المسموح بها لرفع الفيديوهات
    },
  },
};

export default async function handler(request, response) {
    if (request.method === 'OPTIONS') {
        response.setHeader('Access-Control-Allow-Origin', '*');
        response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        return response.status(200).end();
    }

    if (request.method !== 'POST') return response.status(405).json({ error: 'Method Not Allowed' });

    try {
        const { content, section, type, media_url } = request.body;

        let finalMediaUrl = null;

        // إذا وجد ملف Base64 نقوم برفعه إلى Vercel Blob
        if (media_url && media_url.startsWith('data:')) {
            const contentType = media_url.split(';')[0].split(':')[1];
            const buffer = Buffer.from(media_url.split(',')[1], 'base64');
            const fileName = `raqqa-${Date.now()}`;

            const blob = await put(fileName, buffer, {
                access: 'public',
                contentType: contentType
            });
            finalMediaUrl = blob.url;
        }

        // الحفظ في نيون - تأكدي من أسماء الأعمدة (content, section, type, media_url)
        await sql`
            INSERT INTO posts (content, section, type, media_url, created_at)
            VALUES (${content}, ${section}, ${type}, ${finalMediaUrl}, NOW());
        `;

        return response.status(200).json({ success: true, url: finalMediaUrl });

    } catch (error) {
        console.error("Error details:", error);
        return response.status(500).json({ 
            error: 'حدث خطأ في السيرفر', 
            details: error.message 
        });
    }
}
