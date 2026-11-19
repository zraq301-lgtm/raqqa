import { apiUrl } from '../config/apiConfig';
import { getFirebaseIdToken } from './authService';
import { askPrivateAssistant } from './privateAssistant';

export const cloudflarePost = async (optionsOrPath, data) => {
  const options = typeof optionsOrPath === 'string' ? { url: apiUrl(optionsOrPath), data } : optionsOrPath;
  const token = options.skipAuth ? null : await getFirebaseIdToken();
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const response = await fetch(options.url, { method: 'POST', headers, body: JSON.stringify(options.data ?? {}) });
  let responseData = null;
  try { responseData = await response.json(); } catch { responseData = {}; }
  if (!response.ok) throw new Error(responseData?.error || `Cloudflare API request failed (${response.status})`);
  return { status: response.status, data: responseData };
};

// Public calls are for demo-only content and must never receive private health data.
export const publicAiPost = (optionsOrPath, data) => {
  const options = typeof optionsOrPath === 'string'
    ? { url: apiUrl(optionsOrPath), data }
    : optionsOrPath;
  return cloudflarePost({ ...options, skipAuth: true });
};

export const privateAiPost = (optionsOrPath, data) => {
  const options = typeof optionsOrPath === 'string' ? { url: apiUrl(optionsOrPath), data } : optionsOrPath;
  const topic = options?.specialtyTopic || options?.data?.topic;
  const question = options?.data?.prompt || options?.data?.text || options?.data?.input || '';
  const image = options?.data?.image || options?.data?.imageUrl || undefined;
  return askPrivateAssistant({ topic, question, image });
};
