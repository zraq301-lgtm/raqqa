import { CapacitorHttp } from '@capacitor/core';

const SAVE_URL = 'https://nawah-ai-db.vercel.app/api/engine';

export const savePageData = async (pageName, updatedContent) => {
  const options = {
    url: SAVE_URL,
    headers: { 'Content-Type': 'application/json' },
    data: {
      page: pageName,
      content: updatedContent
    },
  };

  try {
    const response = await CapacitorHttp.post(options);
    return response.data;
  } catch (error) {
    console.error(`[Admin Service] Error saving page ${pageName}:`, error);
    throw error;
  }
};
