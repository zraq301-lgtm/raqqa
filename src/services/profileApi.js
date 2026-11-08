import { apiUrl } from '../config/apiConfig';
import { getFirebaseIdToken } from './authService';

export const cloudflareRequest = async (path, options = {}) => {
  const token = await getFirebaseIdToken();
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && options.body !== undefined) headers.set('Content-Type', 'application/json');
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
export const updateProfile = (payload) => postApi('api/profile', payload, { method: 'PUT' });

export const uploadAvatar = async (base64, fileName = `avatar-${Date.now()}.jpg`, mimeType = 'image/jpeg') =>
  postApi('api/profile/avatar', { base64, fileName, mimeType });

export const fetchAi = (payload) => postApi('api/ai', payload);
