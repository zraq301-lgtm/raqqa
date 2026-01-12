import { put } from '@vercel/blob';
import { neon } from '@neondatabase/serverless';
import formidable from 'formidable'; // تأكدي من تثبيتها كما في الخطوة 1
import fs from 'fs';

export const config = {
  api: { bodyParser: false }, // ضروري لعمل formidable
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const form = formidable({});
  const sql = neon(process.env.DATABASE_URL);

  try {
    const [fields, files] = await form.parse(req);
    const content = fields.content[0];
    const section = fields.section[0];
    const type = fields.type[0];
    let media_url = '';

    if (files.file) {
      const file = files.file[0];
      const blob = await put(file.originalFilename, fs.createReadStream(file.filepath), {
        access: 'public',
        contentType: file.mimetype
      });
      media_url = blob.url;
    }

    // الحفظ في Neon مع القيم الجديدة للأقسام
    await sql`
      INSERT INTO posts (content, media_url, section, type, created_at)
      VALUES (${content}, ${media_url}, ${section}, ${type}, NOW())
    `;

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Critical Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
