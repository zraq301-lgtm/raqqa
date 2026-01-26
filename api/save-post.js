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
    
    // تحديد نوع العملية: هل هي رابط فيديو خارجي أم منشور عادي؟
    const isExternalLink = fields.isExternal?.[0] === 'true';

    if (isExternalLink) {
      // منطق حفظ الرابط الخارجي في جدول video_links
      const videoUrl = fields.videoUrl?.[0] || "";
      const description = fields.description?.[0] || "";
      const section = fields.section?.[0] || "bouh-display-1";

      await sql`
        INSERT INTO video_links (url, description, section, created_at)
        VALUES (${videoUrl}, ${description}, ${section}, NOW())
      `;
      return res.status(200).json({ success: true, message: "تم حفظ الرابط بنجاح" });

    } else {
      // منطق رفع المنشور العادي في جدول raqqa_posts
      const content = fields.content?.[0] || "";
      const section = fields.section?.[0] || "bouh-display-1";
      const type = fields.type?.[0] || "نصي";
      let mediaUrl = "";

      if (files.file && files.file[0]) {
        const file = files.file[0];
        const blob = await put(file.originalFilename, fs.createReadStream(file.filepath), {
          access: 'public',
          token: process.env.BLOB_READ_WRITE_TOKEN
        });
        mediaUrl = blob.url;
      }

      await sql`
        INSERT INTO raqqa_posts (content, media_url, section, type, created_at)
        VALUES (${content}, ${mediaUrl}, ${section}, ${type}, NOW())
      `;
      return res.status(200).json({ success: true, message: "تم نشر المنشور بنجاح" });
    }

  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "حدث خطأ: " + error.message });
  }
}
