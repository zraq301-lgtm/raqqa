import { NextResponse } from 'next/server';

export function middleware(request) {
  // 1. السماح للطلب بالمرور لجلب محتوى الصفحة الأصلي
  const response = NextResponse.next();

  // 2. إضافة عناوين منع التخزين المؤقت (Cache Control) على الاستجابة العائدة
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');

  return response;
}

export const config = {
  // تطبيق القاعدة على كل المسارات
  matcher: '/(.*)',
};
