export default function middleware(request) {
  const response = new Response();
  
  // إجبار السيرفر على إرسال أحدث نسخة وعدم التخزين نهائياً
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  
  return response;
}

export const config = {
  matcher: '/(.*)', // تطبيق هذه القاعدة على كل الصفحات والروابط
};
