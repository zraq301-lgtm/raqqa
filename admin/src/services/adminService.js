import { CapacitorHttp } from '@capacitor/core';

const API_BASE = import.meta.env.VITE_RAQQA_API_BASE_URL || 'https://raqqa-backend.raqqa-api.workers.dev';

export const getAdminApiToken = () => {
  try { return window.sessionStorage.getItem('raqqa_admin_api_token') || ''; } catch { return ''; }
};

export const setAdminApiToken = (value) => {
  try {
    const token = String(value || '').trim();
    if (token) window.sessionStorage.setItem('raqqa_admin_api_token', token);
    else window.sessionStorage.removeItem('raqqa_admin_api_token');
  } catch { /* Session storage may be unavailable in restricted webviews. */ }
};

export const listRecentContentFeed = async () => {
  const response = await fetch(`${API_BASE}/api/content/feed`, {
    headers: { 'Cache-Control': 'no-store' },
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || result?.success === false) {
    const message = [result?.error, result?.detail].filter(Boolean).join(': ')
      || `Cloudflare API returned ${response.status}`;
    throw new Error(message);
  }
  return Array.isArray(result?.items) ? result.items : [];
};

export const listAllAdminContent = async () => {
  const response = await fetch(`${API_BASE}/api/admin/content`, {
    headers: { 'Cache-Control': 'no-store', ...getAdminTokenHeaders() },
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || result?.success === false) throw new Error(result?.error || `Cloudflare API returned ${response.status}`);
  return {
    items: Array.isArray(result?.items) ? result.items : [],
    partialStores: Array.isArray(result?.partialStores) ? result.partialStores : [],
  };
};

const getRequestHeaders = (includeContentType = true) => (
  includeContentType ? { 'Content-Type': 'application/json' } : {}
);

export const getAdminTokenHeaders = () => {
  const token = getAdminApiToken();
  return token ? { 'X-Admin-Token': token } : {};
};

const parseResponse = async (response) => {
  const result = await response.json().catch(() => ({}));
  if (!response.ok || result?.success === false) {
    const message = [result?.error, result?.detail].filter(Boolean).join(': ')
      || `Cloudflare API returned ${response.status}`;
    throw new Error(message);
  }
  return result;
};

const communityRequest = async (path, { method = 'GET', body } = {}) => {
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { ...(body !== undefined ? getRequestHeaders() : {}), ...getAdminTokenHeaders(), 'Cache-Control': 'no-store' },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  return parseResponse(response);
};

export const listCommunityPosts = async () => {
  const result = await communityRequest('/api/admin/community/posts');
  return Array.isArray(result.posts) ? result.posts : [];
};
export const listCommunityComments = async () => {
  const result = await communityRequest('/api/admin/community/comments');
  return Array.isArray(result.comments) ? result.comments : [];
};
export const updateCommunityPost = (id, changes) => communityRequest(`/api/admin/community/posts/${encodeURIComponent(id)}`, { method: 'PATCH', body: changes });
export const deleteCommunityPost = (id) => communityRequest(`/api/admin/community/posts/${encodeURIComponent(id)}`, { method: 'DELETE' });
export const updateCommunityComment = (id, changes) => communityRequest(`/api/admin/community/comments/${encodeURIComponent(id)}`, { method: 'PATCH', body: changes });
export const deleteCommunityComment = (id) => communityRequest(`/api/admin/community/comments/${encodeURIComponent(id)}`, { method: 'DELETE' });

const uploadMedia = async (file, pageName, endpoint) => {
  if (!file) throw new Error('media_file_required');
  const form = new FormData();
  form.append('file', file, file.name || 'raqqa-media');
  if (endpoint === '/api/media/public') {
    form.append('kind', file.type.startsWith('image/') ? 'image' : 'link');
    form.append('section', pageName);
  } else {
    form.append('page', pageName);
  }
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: getAdminTokenHeaders(),
    body: form,
  });
  const result = await parseResponse(response);
  return { ...result, url: result.url || result.publicUrl || result.data?.url || result.media?.url || '' };
};

export const uploadVideo = (file, pageName) => uploadMedia(file, pageName, '/api/media/upload');
export const uploadImage = (file, pageName) => uploadMedia(file, pageName, '/api/media/public');

export const broadcastNotification = async ({ title, body, imageUrl = '', imageFile = null }) => {
  const hasFile = imageFile && typeof imageFile.stream === 'function';
  const form = hasFile ? new FormData() : null;
  if (form) {
    form.append('title', title);
    form.append('body', body);
    form.append('file', imageFile, imageFile.name || 'notification-image');
  }
  const response = await fetch(`${API_BASE}/api/notifications/broadcast`, {
    method: 'POST',
    headers: { ...(hasFile ? {} : getRequestHeaders()), ...getAdminTokenHeaders() },
    body: form || JSON.stringify({ title, body, imageUrl }),
  });
  return parseResponse(response);
};

export const savePageData = async (pageName, updatedContent) => {
  const cleanPageName = pageName.replace(/[\'\"]/g, '').trim();
  const formattedContent = typeof updatedContent === 'object'
    ? JSON.stringify(updatedContent)
    : updatedContent;
  const response = await CapacitorHttp.post({
    url: `${API_BASE}/api/content`,
    headers: { ...getRequestHeaders(), ...getAdminTokenHeaders() },
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
    headers: { ...getRequestHeaders(), ...getAdminTokenHeaders() },
    data: { page: cleanPageName, id: cleanItemId },
  });
  return parseResponse({ ok: response.status < 400, status: response.status, json: async () => (
    typeof response.data === 'string' ? JSON.parse(response.data) : response.data
  ) });
};

export const getAppTheme = async () => {
  const response = await fetch(`${API_BASE}/api/settings/theme`, { cache: 'no-store' });
  const result = await parseResponse(response);
  return result.settings || {};
};

export const saveAppTheme = async (settings) => {
  const response = await fetch(`${API_BASE}/api/settings/theme`, {
    method: 'POST',
    headers: { ...getRequestHeaders(), ...getAdminTokenHeaders() },
    body: JSON.stringify({ settings }),
  });
  const result = await parseResponse(response);
  return result.settings || settings;
};
