import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    try {
        const { content, section, type, media_url } = req.body;

        // الحفظ المباشر في نيون (الرابط يأتي جاهزاً من الواجهة الأمامية)
        await sql`
            INSERT INTO posts (content, section, type, media_url, created_at)
            VALUES (${content}, ${section}, ${type}, ${media_url}, NOW());
        `;

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message });
    }
}
