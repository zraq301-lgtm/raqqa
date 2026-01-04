import { sql } from '@vercel/postgres';
import { put } from '@vercel/blob';

export const config = {
  api: { bodyParser: { sizeLimit: '10mb' } }, // لضمان استقبال الفيديوهات
};

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    try {
        const { content, section, type, media_url } = req.body;

        let finalUrl = null;

        // رفع الملف لـ Vercel Blob إذا وجد
        if (media_url && media_url.startsWith('data:')) {
            const buffer = Buffer.from(media_url.split(',')[1], 'base64');
            const { url } = await put(`raqqa-${Date.now()}.file`, buffer, {
                access: 'public',
                contentType: type === 'فيديو' ? 'video/mp4' : 'image/jpeg'
            });
            finalUrl = url;
        }

        // الحفظ في نيون - لاحظي تطابق الأسماء مع صورتك
        await sql`
            INSERT INTO posts (content, section, type, media_url, created_at)
            VALUES (${content}, ${section}, ${type}, ${finalUrl}, NOW());
        `;

        return res.status(200).json({ success: true, url: finalUrl });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message });
    }
}
