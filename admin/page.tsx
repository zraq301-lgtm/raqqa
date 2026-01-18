import { neon } from '@neondatabase/serverless';

export default async function AdminDashboard() {
  const sql = neon(process.env.POSTGRES_URL!);
  const settings = await sql`SELECT * FROM app_settings`;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">مركز قيادة التطبيق 🚀</h1>

      {/* قسم إدارة الإعلانات */}
      <section className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <span className="bg-blue-100 p-2 rounded-lg mr-2">💰</span> التحكم في الأرباح
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm text-gray-500">نوع الإعلان الحالي</label>
            <select className="w-full p-2 border rounded-lg bg-gray-50">
              <option value="admob">إعلانات جوجل (AdMob)</option>
              <option value="local">إعلان محلي (صورة خاصة)</option>
              <option value="none">تعطيل الإعلانات</option>
            </select>
          </div>
        </div>
      </section>

      {/* قسم الذكاء الاصطناعي والإشعارات */}
      <section className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <span className="bg-purple-100 p-2 rounded-lg mr-2">🤖</span> إشعارات ذكية (AI)
        </h2>
        <div className="space-y-4">
          <textarea 
            placeholder="اكتب فكرة الإشعار هنا..."
            className="w-full p-3 border rounded-lg h-24 bg-gray-50"
          ></textarea>
          <button className="bg-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-700 w-full transition">
            توليد وإرسال بالذكاء الاصطناعي
          </button>
        </div>
      </section>

      {/* قسم قاعدة بيانات Neon */}
      <section className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-lg font-semibold mb-4">بيانات Neon الأخيرة</h2>
        <div className="overflow-x-auto">
          {/* هنا يمكنك عرض جدول البيانات المستخرجة من Neon */}
          <div className="text-sm text-gray-400">يتم عرض آخر 10 سجلات من قاعدة البيانات...</div>
        </div>
      </section>
    </div>
  );
}
