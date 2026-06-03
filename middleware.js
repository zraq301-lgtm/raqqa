import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// تحديد المسارات العامة التي لا تحتاج لتسجيل دخول (من ضمنها رابط الـ Webhook لكي يستقبله Clerk)
const isPublicRoute = createRouteMatcher([
  '/', 
  '/api/webhooks/clerk'
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // تخطي ملفات الـ Next.js الداخلية والملفات الثابتة
    '/((?!_next|[^?]*\\.[^?]*$$).*)',
    // تشغيل الـ middleware دائماً لملفات الـ API
    '/(api|trpc)(.*)',
  ],
};
