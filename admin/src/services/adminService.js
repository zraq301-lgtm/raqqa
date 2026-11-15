import { CapacitorHttp } from '@capacitor/core';

const API_BASE = import.meta.env.VITE_RAQQA_API_BASE_URL || 'https://raqqa-backend.raqqa-api.workers.dev';

export const listRecentContentFeed = async () => {
  const response = await fetch(`${API_BASE}/api/content/feed`, {
    headers: { 'Cache-Control': 'no-store' },
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || result?.success === false) {
    throw new Error(result?.error || `Cloudflare API returned ${response.status}`);
  }
  return Array.isArray(result?.items) ? result.items : [];
};

const getRequestHeaders = (includeContentType = true) => (
  includeContentType ? { 'Content-Type': 'application/json' } : {}
);

const parseResponse = async (response) => {
  const result = await response.json().catch(() => ({}));
  if (!response.ok || result?.success === false) {
    throw new Error(result?.error || `Cloudflare API returned ${response.status}`);
  }
  return result;
};

const uploadMedia = async (file, pageName, endpoint) => {
  if (!file) throw new Error('media_file_required');
  const form = new FormData();
  form.append('file', file, file.name || 'raqqa-media');
  form.append('page', pageName);
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    body: form,
  });
  return parseResponse(response);
};

export const uploadVideo = (file, pageName) => uploadMedia(file, pageName, '/api/media/upload');
export const uploadImage = (file, pageName) => uploadMedia(file, pageName, '/api/media/public');

export const savePageData = async (pageName, updatedContent) => {
  const cleanPageName = pageName.replace(/[\'\"]/g, '').trim();
  const formattedContent = typeof updatedContent === 'object'
    ? JSON.stringify(updatedContent)
    : updatedContent;
  const response = await CapacitorHttp.post({
    url: `${API_BASE}/api/content`,
    headers: getRequestHeaders(),
    data: { page: cleanPageName, content: formattedContent },
  });
  return parseResponse({ ok: response.status < 400, status: response.status, json: async () => (
    typeof response.data === 'string' ? JSON.parse(response.data) : response.data
  ) });
};

export const deletePageDataById = async (pageName, itemId) => {
  const cleanPageName = pageName.replace(/[\'\"]/g, '').trim();
  const cleanItemId = String(itemId).trim();
  const response = await CapacitorHttp.delete({
    url: `${API_BASE}/api/content`,
    headers: getRequestHeaders(),
    data: { page: cleanPageName, id: cleanItemId },
  });
  return parseResponse({ ok: response.status < 400, status: response.status, json: async () => (
    typeof response.data === 'string' ? JSON.parse(response.data) : response.data
  ) });
};
