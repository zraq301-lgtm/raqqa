import { 
  Heart, 
  Sparkles, 
  Video, 
  Activity, 
  Moon, 
  MessageCircle, 
  Settings, 
  User,
  Flower2,
  Gem,
  LayoutDashboard,
  Bell
} from 'lucide-react';

/**
 * iconMap - المرجع الرئيسي لأيقونات أقسام تطبيق رؤاقة
 * تم اختيار هذه الأيقونات بعناية لتعبر عن الهدوء والاحترافية
 */
export const iconMap = {
  // أقسام الواجهة الرئيسية
  feelings: Heart,       // للمشاعر والقلب
  health: Activity,      // للصحة والمؤشرات الحيوية
  insight: Sparkles,     // للأفكار والتبصر
  intimacy: Flower2,     // للخصوصية والعلاقات (بديل راقٍ لـ Pray)
  videos: Video,         // لقسم المرئيات
  virtualWorld: Gem,     // للعالم الافتراضي أو التميز
  
  // أيقونات التنقل والنظام
  home: LayoutDashboard,
  notifications: Bell,
  settings: Settings,
  profile: User,
  chat: MessageCircle,
  nightMode: Moon,
  
  // أيقونات إضافية للجمالية
  beauty: Flower2,
  premium: Gem
};

/**
 * وظيفة مساعدة للحصول على الأيقونة مع دعم "أيقونة افتراضية" 
 * لتجنب توقف التطبيق في حال نسيان تعريف أيقونة
 */
export const getIcon = (name) => {
  return iconMap[name] || Sparkles; 
};
