const DEFAULT_ADS_API_BASE_URL = (import.meta.env.VITE_ADS_API_BASE_URL || '').replace(/\/$/, '');
const ADS_API_BASE_STORAGE_KEY = 'raqqa_ads_api_base_url';
const ADS_ADMIN_KEY_STORAGE_KEY = 'raqqa_ads_admin_key';

export const getAdsApiBaseUrl = () => {
  try {
    return (window.sessionStorage.getItem(ADS_API_BASE_STORAGE_KEY) || DEFAULT_ADS_API_BASE_URL).replace(/\/$/, '');
  } catch {
    return DEFAULT_ADS_API_BASE_URL;
  }
};

export const getAdsAdminKey = () => {
  try {
    return window.sessionStorage.getItem(ADS_ADMIN_KEY_STORAGE_KEY) || '';
  } catch {
    return '';
  }
};

export const saveAdsAdminConnection = ({ apiBaseUrl, adminKey }) => {
  try {
    const cleanBaseUrl = String(apiBaseUrl || '').trim().replace(/\/$/, '');
    const cleanAdminKey = String(adminKey || '').trim();
    if (cleanBaseUrl) window.sessionStorage.setItem(ADS_API_BASE_STORAGE_KEY, cleanBaseUrl);
    else window.sessionStorage.removeItem(ADS_API_BASE_STORAGE_KEY);
    if (cleanAdminKey) window.sessionStorage.setItem(ADS_ADMIN_KEY_STORAGE_KEY, cleanAdminKey);
    else window.sessionStorage.removeItem(ADS_ADMIN_KEY_STORAGE_KEY);
  } catch {
    throw new Error('تعذر حفظ إعدادات الاتصال في جلسة المتصفح.');
  }
};

export const requestAdsAdmin = async (apiBaseUrl, adminKey, path, { method = 'GET', body } = {}) => {
  const baseUrl = String(apiBaseUrl || '').trim().replace(/\/$/, '');
  const key = String(adminKey || '').trim();
  if (!baseUrl) throw new Error('أدخلي رابط خدمة الإعلانات أولًا.');
  if (!key) throw new Error('أدخلي مفتاح إدارة الإعلانات أولًا.');

  let response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: {
        Accept: 'application/json',
        'Cache-Control': 'no-store',
        'x-admin-key': key,
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
  } catch {
    throw new Error('تعذر الاتصال بالخدمة. تحققي من الرابط وإعداد CORS في Worker.');
  }

  const result = await response.json().catch(() => ({}));
  if (!response.ok || result?.error) {
    const messages = {
      invalid_admin_key: 'مفتاح إدارة الإعلانات غير صحيح.',
      admin_key_not_configured: 'لم يتم ضبط ADMIN_KEY في خدمة الإعلانات.',
      not_found: 'مسار API غير موجود في خدمة الإعلانات.',
    };
    throw new Error(messages[result?.error] || result?.error || `أعاد الخادم الحالة ${response.status}.`);
  }
  return result;
};
