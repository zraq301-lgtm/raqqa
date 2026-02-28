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
    // تشغيل نموذج تحليل الصور على Replicate
    // ملاحظة: يمكنك تغيير الإصدار (version) حسب النموذج المفضل لديك
    const output = await replicate.run(
      "yorickvp/llava-13b:b5fce518b306f4d0e7462e25913cfc5e2978c1d773f61b7dc6609da305915494",
      {
        input: {
          image: imageUrl,
          prompt: `بصفتك طبيبة تغذية متخصصة، حللي هذه الصورة: ${prompt}`,
        },
      }
    );

    return res.status(200).json({ reply: output.join("") });
  } catch (error) {
    console.error("Replicate Error:", error);
    return res.status(500).json({ error: "فشل التحليل عبر Replicate" });
  }
}
