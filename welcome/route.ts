import { Redis } from '@upstash/redis'
import { NextResponse } from 'next/server'

// الاتصال التلقائي باستخدام المفاتيح التي تظهر في الصورة (UPSTASH_REDIS_REST_URL)
const redis = Redis.fromEnv()

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
        return NextResponse.json({ error: "معرف المستخدم مطلوب" }, { status: 400 })
    }

    try {
        // جلب الإشعارات المخزنة في Upstash لهذا المستخدم
        // نستخدم lrange لجلب الرسائل من القائمة (List)
        const notifications = await redis.lrange(`notifs:${userId}`, 0, -1)

        return NextResponse.json(notifications)
    } catch (error) {
        console.error("Redis Error:", error)
        return NextResponse.json({ error: "فشل الاتصال بقاعدة البيانات" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const { userId, message } = await request.json()

        // تخزين إشعار الترحيب في Upstash
        await redis.lpush(`notifs:${userId}`, {
            text: message || "مرحباً بكِ في رقة ✨",
            date: new Date().toISOString(),
            type: "welcome"
        })

        return NextResponse.json({ success: true, message: "تم إرسال إشعار الترحيب" })
    } catch (error) {
        return NextResponse.json({ error: "فشل إرسال الإشعار" }, { status: 500 })
    }
}
