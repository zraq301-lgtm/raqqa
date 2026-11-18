import { cloudflareRequest } from './profileApi';

export const listFemaleWhispers = () => cloudflareRequest('api/health/whispers');

export const saveFemaleWhisper = (payload) => cloudflareRequest('api/health/whispers', {
  method: 'POST',
  body: JSON.stringify(payload),
  headers: { 'Content-Type': 'application/json' },
});

export const deleteFemaleWhisper = (id) => cloudflareRequest(`api/health/whispers?id=${encodeURIComponent(id)}`, { method: 'DELETE' });

export const uploadFemaleWhisperMedia = (file) => {
  const form = new FormData();
  form.append('file', file, file.name || `whisper-${Date.now()}`);
  return cloudflareRequest('api/health/whispers/media', { method: 'POST', body: form });
};
