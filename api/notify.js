// api/notify.js
const { Knock } = require("@knocklabs/node");

// استدعاء المفاتيح من بيئة Vercel التي أعددتها
const knockClient = new Knock(process.env.KNOCK_API_KEY); 

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { user_id, notes_ai, mood_tag } = req.body;

    try {
      // إرسال البيانات إلى سير العمل في Knock
      await knockClient.workflows.trigger("user-followup", {
        recipients: [user_id.toString()],
        data: {
          message: notes_ai,
          mood: mood_tag,
        },
      });

      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).send('Method Not Allowed');
  }
}
