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

    // تحسين المنطق: التحقق من وجود كلمات دالة على الرسم بشكل أقوى
    const isDrawRequest = prompt.includes("ارسم") || 
                         prompt.includes("صورة") || 
                         prompt.includes("توليد") || 
                         prompt.includes("draw");

    // حالة 1: الرسم (يتم تفعيلها إذا طلب المستخدم رسم ولم يرفق صورة)
    if (!imageUrl && isDrawRequest) {
      // تنظيف النص من كلمة "ارسم" لإرسال الوصف النقي للنموذج
      const cleanPrompt = prompt.replace(/ارسم|صورة|توليد/g, "").trim();

      output = await replicate.run(
        "black-forest-labs/flux-schnell", 
        {
          input: {
            // نرسل الوصف بالإنجليزية لضمان أفضل جودة إذا أمكن، أو نرسله كما هو
            prompt: cleanPrompt || prompt, 
            aspect_ratio: "1:1",
            output_format: "webp",
            output_quality: 90
          },
        }
      );

      // التأكد من إرجاع رابط الصورة في حقل منفصل ليفهمه كود Advice.jsx
      return res.status(200).json({ 
        reply: "تفضلي، لقد قمت برسم الصورة لكِ:", 
        imageUrl: output[0] // هذا هو الرابط الذي سيعرض الصورة
      });
    }

    // حالة 2: تحليل صورة (إذا أرسل المستخدم صورة فعلياً)
    if (imageUrl) {
      output = await replicate.run(
        "yorickvp/llava-13b:b5fce518b306f4d0e7462e25913cfc5e2978c1d773f61b7dc6609da305915494",
        {
          input: {
            image: imageUrl,
            prompt: `بصفتكِ خبيرة، حللي هذه الصورة: ${prompt}`,
          },
        }
      );
      return res.status(200).json({ reply: output.join("") });
    }

    return res.status(400).json({ error: "لم أستطع تحديد ما إذا كنتِ تريدين الرسم أو التحليل." });

  } catch (error) {
    console.error("Replicate Error:", error);
    return res.status(500).json({ error: "فشل في معالجة الطلب عبر Replicate" });
  }
}
