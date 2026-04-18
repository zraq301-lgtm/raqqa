// api/debug-ads.js
export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { error, device, appId, network } = req.body;

    // هنا يمكنك طباعة الخطأ في سجلات Vercel (Logs)
    console.log("--- Ad Error Report ---");
    console.log(`Device: ${device}`);
    console.log(`Network: ${network}`);
    console.log(`App ID Sent: ${appId}`);
    console.log(`Error Detail: ${error}`);

    return res.status(200).json({ message: "Error logged successfully" });
  }

  res.status(405).json({ message: "Method not allowed" });
}
