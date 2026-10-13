import { CapacitorHttp } from '@capacitor/core';

const API_BASE = import.meta.env.VITE_RAQQA_API_BASE_URL || 'https://raqqa-backend.raqqa-api.workers.dev';
const ADMIN_TOKEN = import.meta.env.VITE_ADMIN_API_TOKEN || '';
const authHeaders = {
  'Content-Type': 'application/json',
  ...(ADMIN_TOKEN ? { 'X-Admin-Token': ADMIN_TOKEN } : {}),
};

export const uploadVideo = async (file, pageName) => {
  if (!file) throw new Error('video_file_required');
  const form = new FormData();
  form.append('file', file, file.name || 'raqqa-video.mp4');
  form.append('page', pageName);
  const response = await fetch(`${API_BASE}/api/media/upload`, {
    method: 'POST',
    headers: ADMIN_TOKEN ? { 'X-Admin-Token': ADMIN_TOKEN } : {},
    body: form,
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || result?.success === false) {
    throw new Error(result?.error || `Cloudflare upload returned ${response.status}`);
  }
  return result;
};

export const savePageData = async (pageName, updatedContent) => {
  const cleanPageName = pageName.replace(/['"]/g, '').trim();
  const formattedContent = typeof updatedContent === 'object'
    ? JSON.stringify(updatedContent)
    : updatedContent;

  const response = await CapacitorHttp.post({
    url: `${API_BASE}/api/content`,
    headers: authHeaders,
    data: { page: cleanPageName, content: formattedContent },
  });
  const result = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
  if (response.status >= 400 || result?.success === false) {
    throw new Error(result?.error || `Cloudflare API returned ${response.status}`);
  }
  return result;
};

export const deletePageDataById = async (pageName, itemId) => {
  const cleanPageName = pageName.replace(/['"]/g, '').trim();
  const cleanItemId = String(itemId).trim();
  const response = await CapacitorHttp.delete({
    url: `${API_BASE}/api/content`,
    headers: authHeaders,
    data: { page: cleanPageName, id: cleanItemId },
  });
  const result = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
  if (response.status >= 400 || result?.success === false) {
    throw new Error(result?.error || `Cloudflare API returned ${response.status}`);
  }
  return result;
};
