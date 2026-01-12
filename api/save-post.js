import { put } from '@vercel/blob';
import { neon } from '@neondatabase/serverless';
import formidable from 'formidable';
import fs from 'fs';

// إعدادات Vercel للتعامل مع FormData
export const config = {
  api: { bodyParser: false }, 
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const sql = neon(process.env.DATABASE_URL);
  const form = formidable();

  try {
    const [fields, files] = await form.parse(req);
    const content = fields.content[0];
    const section = fields.section[0];
    const type = fields.type[0];
    const file = files.file ? files.file[0] : null;

    let media_url = '';

    // إذا وجد ملف، ارفعيه فوراً كـ Buffer لسرعة أكبر
    if (file) {
      const fileBuffer = fs.readFileSync(file.filepath);
      const blob = await put(file.originalFilename, fileBuffer, {
        access: 'public',
        contentType: file.mimetype,
      });
      media_url = blob.url;
    }

    // حفظ البيانات في Neon
    const result = await sql`
      INSERT INTO posts (content, media_url, section, type, created_at)
      VALUES (${content}, ${media_url}, ${section}, ${type}, NOW())
      RETURNING id
    `;

    res.status(200).json({ success: true, id: result[0].id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'حدث خطأ أثناء المعالجة' });
  }
}
