import { Capacitor } from '@capacitor/core';
import { Directory, Filesystem } from '@capacitor/filesystem';

const YOUTUBE_HOSTS = ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be', 'www.youtu.be', 'youtube-nocookie.com'];

export function isYoutubeUrl(value = '') {
  try {
    const host = new URL(value).hostname.toLowerCase();
    return YOUTUBE_HOSTS.some((name) => host === name || host.endsWith(`.${name}`));
  } catch {
    return false;
  }
}

export function isDirectVideoUrl(value = '') {
  if (!value || isYoutubeUrl(value)) return false;
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== 'https:') return false;
    return /\.(mp4|m4v|webm|ogg|mov)(?:$|[?#])/i.test(parsed.pathname + parsed.search) || parsed.hostname.includes('cloudinary.com') || parsed.pathname.includes('/video/');
  } catch {
    return false;
  }
}

function safeFileName(title = 'raqqa-video') {
  const cleaned = String(title).trim().replace(/[^\p{L}\p{N}_-]+/gu, '-').replace(/^-+|-+$/g, '').slice(0, 70);
  return `${cleaned || 'raqqa-video'}.mp4`;
}

export async function downloadVideoToDevice(url, title = 'raqqa-video') {
  if (!isDirectVideoUrl(url)) {
    throw new Error(isYoutubeUrl(url) ? 'لا يمكن تنزيل فيديو يوتيوب من داخل التطبيق. استخدمي زر فتح الفيديو.' : 'هذا الرابط ليس ملف فيديو مباشرًا قابلًا للتنزيل.');
  }
  const filename = safeFileName(title);
  if (!Capacitor.isNativePlatform()) {
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.target = '_blank';
    anchor.rel = 'noreferrer';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    return { mode: 'browser', filename };
  }
  const result = await Filesystem.downloadFile({
    url,
    path: `Raqqa/Downloads/${filename}`,
    directory: Directory.Documents,
    recursive: true,
  });
  return { mode: 'device', filename, uri: result.path || result.uri || '' };
}
