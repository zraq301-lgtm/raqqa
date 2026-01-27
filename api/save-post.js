import { put } from '@vercel/blob';
import { neon } from '@neondatabase/serverless';
import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: { bodyParser: false }, 
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const connectionString = process.env.POSTGRES_URL; 
  
  if (!connectionString) {
    return res.status(500).json({ error: "خطأ: لم يتم العثور على رابط POSTGRES_URL" });
  }

  const form = formidable({});
  const sql = neon(connectionString);

  try {
    const [fields, files] = await form.parse(req);
    
    const content = fields.content?.[0] || "";
    const section = fields.section?.[0] || "bouh-display-1";
    const type = fields.type?.[0] || "نصي";
    let mediaUrl = "";

    // --- الإضافة الجديدة لمعالجة الرابط الخارجي ---
    if (type === "رابط") {
      // إذا كان النوع رابط، نأخذ القيمة من حقل external_url أو من حقل file إذا أُرسل كنص
      mediaUrl = fields.external_link?.[0] || fields.file?.[0] || "";
    } 
    // --- منطق رفع الملفات الأصلي كما هو ---
    else if (files.file && files.file[0]) {
      const file = files.file[0];
      const blob = await put(file.originalFilename, fs.createReadStream(file.filepath), {
        access: 'public',
        contentType: file.mimetype,
        token: process.env.BLOB_READ_WRITE_TOKEN 
      });
      mediaUrl = blob.url;
    }

    // الحفظ في الجدول - الآن mediaUrl سيحتوي على الرابط الكامل سواء كان مرفوعاً أو خارجياً
    await sql`
      INSERT INTO posts (content, media_url, section, type, created_at)
      VALUES (${content}, ${mediaUrl}, ${section}, ${type}, NOW())
    `;

    return res.status(200).json({ success: true, url: mediaUrl });

  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "حدث خطأ: " + error.message });
  }
}
