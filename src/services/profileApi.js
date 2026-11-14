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

// Strict APIs: callers that require a signed-in user's cloud data should keep errors.
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

// Optional persistence for AI flows. AI/local Android notifications must not fail
// just because the user is signed out or the cloud is temporarily unavailable.
const reportOptionalPersistence = (operation, error) => {
  console.warn(`[Raqqa] ${operation} skipped; AI result remains available locally.`, error);
  return null;
};

export const persistAiHealthRecord = async (category, data, options = {}) => {
  if (!(await getFirebaseIdToken())) return null;
  try {
    return await saveHealthRecord(category, data, options);
  } catch (error) {
    return reportOptionalPersistence('health record persistence', error);
  }
};

export const persistAiScheduledNotification = async (payload) => {
  if (!(await getFirebaseIdToken())) return null;
  try {
    return await saveScheduledNotification(payload);
  } catch (error) {
    return reportOptionalPersistence('scheduled notification persistence', error);
  }
};
