const env = import.meta.env || {};

export const API_BASE = (env.VITE_API_BASE_URL || env.VITE_CLOUDFLARE_API_BASE_URL || 'https://raqqa-backend.raqqa-api.workers.dev').replace(/\/$/, '');
export const apiUrl = (path = '') => `${API_BASE}/${String(path).replace(/^\//, '')}`;
export const AI_API_URL = apiUrl('api/ai');
export const aiApiUrl = (path = '') => apiUrl(`api/ai${path ? `/${String(path).replace(/^\//, '')}` : ''}`);
