import { CapacitorHttp } from '@capacitor/core';

const SAVE_URL = 'https://nawah-ai-db.vercel.app/api/engine';
const FETCH_URL = 'https://nawah-ai-db.vercel.app/api/get-engine-data';

// دالة موحدة لجلب البيانات
export const fetchPageData = async (pageName) => {
  const options = {
    url: `${FETCH_URL}?page=${encodeURIComponent(pageName)}`,
    headers: { 'Content-Type': 'application/json' },
  };

  try {
    const response = await CapacitorHttp.get(options);
    return response.data; // البيانات المستلمة من GitHub
  } catch (error) {
    console.error(`خطأ في جلب بيانات صفحة ${pageName}:`, error);
    throw error;
  }
};

// دالة موحدة لحفظ البيانات
export const savePageData = async (pageName, content) => {
  const options = {
    url: SAVE_URL,
    headers: { 'Content-Type': 'application/json' },
    data: {
      page: pageName,
      content: content
    },
  };

  try {
    const response = await CapacitorHttp.post(options);
    return response.data;
  } catch (error) {
    console.error(`خطأ في حفظ بيانات صفحة ${pageName}:`, error);
    throw error;
  }
};
