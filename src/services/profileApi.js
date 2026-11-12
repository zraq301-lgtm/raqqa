import { apiUrl } from '../config/apiConfig';
import { getFirebaseIdToken } from './authService';

export const cloudflareRequest = async (path, options = {}) => {
  const token = await getFirebaseIdToken();
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && options.body !== undefined && !(typeof FormData !== 'undefined' && options.body instanceof FormData)) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const response = await fetch(apiUrl(path), { ...options, headers });
  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(detail || `Cloudflare API request failed (${response.status})`);
  }
  const contentType = response.headers.get('content-type') || '';
  return contentType.includes('application/json') ? response.json() : response.text();
};

export const postApi = (path, data, options = {}) => cloudflareRequest(path, {
  ...options,
  method: 'POST',
  body: JSON.stringify(data),
});

export const bootstrapProfile = (payload) => postApi('api/auth/bootstrap', payload);
export const getProfile = () => cloudflareRequest('api/profile');
export const updateProfile = (payload) => cloudflareRequest('api/profile', {
  method: 'PATCH',
  body: JSON.stringify(payload),
  headers: { 'Content-Type': 'application/json' },
});

export const uploadAvatar = async (file) => {
  const form = new FormData();
  form.append('file', file, file.name || `avatar-${Date.now()}.jpg`);
  return cloudflareRequest('api/profile/avatar', { method: 'POST', body: form });
};

export const fetchAi = (payload) => postApi('api/ai', payload);

export const saveHealthRecord = (category, data, options = {}) => postApi('api/health/records', {
  id: options.id,
  category,
  data,
  recordedAt: options.recordedAt || new Date().toISOString(),
});

export const getHealthRecords = (category) =>
  cloudflareRequest(`api/health/records${category ? `?category=${encodeURIComponent(category)}` : ''}`);

export const deleteHealthRecord = (id) =>
  cloudflareRequest(`api/health/records?id=${encodeURIComponent(id)}`, { method: 'DELETE' });

export const saveScheduledNotification = (payload) => postApi('api/notifications', payload);
