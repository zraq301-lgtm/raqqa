import Replicate from "replicate";

// استخدام المفتاح الظاهر في الصورة المرفقة
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN, 
});

export default async function handler(req, res) {
  // التأكد من أن نوع الطلب POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { imageUrl, prompt } = req.body;

  try {
    let output;

    // حالة 1: طلب رسم صورة (إذا احتوى النص على كلمة رسم أو صورة ولم يرفق المستخدم صورة)
    if (!imageUrl && (prompt.includes("ارسم") || prompt.includes("صورة"))) {
      output = await replicate.run(
        "black-forest-labs/flux-schnell", 
        {
          input: {
            prompt: prompt,
            aspect_ratio: "1:1",
            output_format: "webp",
            output_quality: 80
          },
        }
      );
      // إرجاع رابط الصورة المولدة
      return res.status(200).json({ 
        reply: "تم توليد الصورة بناءً على طلبكِ:", 
        imageUrl: output[0] 
      });
    }

    // حالة 2: تحليل صورة موجودة (باستخدام نموذج LLaVA)
    if (imageUrl) {
      output = await replicate.run(
        "yorickvp/llava-13b:b5fce518b306f4d0e7462e25913cfc5e2978c1d773f61b7dc6609da305915494",
        {
          input: {
            image: imageUrl,
            prompt: `بصفتكِ خبيرة، حللي هذه الصورة وأجيبي على هذا الطلب: ${prompt}`,
          },
        }
      );
      // إرجاع النص المحلل من الصورة
      return res.status(200).json({ reply: output.join("") });
    }

    // حالة 3: نص عادي لا يتضمن رسم ولا تحليل صورة
    return res.status(400).json({ error: "يرجى إرسال صورة للتحليل أو طلب رسم صورة واضحة." });

  } catch (error) {
    console.error("Replicate Error Detail:", error);
    return res.status(500).json({ 
      error: "حدث خطأ أثناء الاتصال بـ Replicate. تأكدي من صلاحية التوكن وقدرة الحساب على الوصول للنماذج." 
    });
  }
}
