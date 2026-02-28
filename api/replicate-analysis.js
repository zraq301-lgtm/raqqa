import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { imageUrl, prompt } = req.body;

  try {
    let output;

    // 1. حالة رسم صورة جديدة (إذا كان الطلب لا يحتوي على صورة ويبدأ بكلمة ارسم)
    if (!imageUrl && (prompt.includes("ارسم") || prompt.includes("صورة"))) {
      output = await replicate.run(
        "black-forest-labs/flux-schnell", // أسرع وأحدث نموذج لرسم الصور
        {
          input: {
            prompt: prompt,
            aspect_ratio: "1:1",
            output_format: "webp",
            output_quality: 80
          },
        }
      );
      // نموذج الرسم يعيد رابط الصورة مباشرة
      return res.status(200).json({ reply: `تم إنشاء الصورة بنجاح: ${output[0]}`, imageUrl: output[0] });
    }

    // 2. حالة تحليل صورة موجودة (باستخدام نموذج LLaVA)
    if (imageUrl) {
      output = await replicate.run(
        "yorickvp/llava-13b:b5fce518b306f4d0e7462e25913cfc5e2978c1d773f61b7dc6609da305915494",
        {
          input: {
            image: imageUrl,
            prompt: `بصفتك طبيبة تغذية متخصصة، حللي هذه الصورة: ${prompt}`,
          },
        }
      );
      return res.status(200).json({ reply: output.join("") });
    }

    // 3. حالة نص عادي بدون صورة أو أمر رسم
    return res.status(400).json({ error: "يرجى إرسال صورة للتحليل أو طلب رسم صورة محددة." });

  } catch (error) {
    console.error("Replicate Error:", error);
    return res.status(500).json({ error: "فشل المعالجة عبر Replicate، تأكد من توفر الرصيد وإعدادات الـ Token." });
  }
}
