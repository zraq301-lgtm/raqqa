import { Capacitor } from '@capacitor/core';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';

const INDEX_PATH = 'raqqa-offline/media-index-v1.json';
const MEDIA_DIR = 'raqqa-offline/media';
const MAX_CACHE_BYTES = 250 * 1024 * 1024;
const MAX_FILE_BYTES = 100 * 1024 * 1024;
const MAX_MEDIA_PER_PAGE = 60;
const DOWNLOAD_CONCURRENCY = 2;
const IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif']);
const VIDEO_EXTENSIONS = new Set(['mp4', 'm4v', 'webm', 'mov']);
const AUDIO_EXTENSIONS = new Set(['mp3', 'm4a', 'aac', 'ogg', 'wav']);
const inFlight = new Map();
let indexQueue = Promise.resolve();

const isAndroid = () => Capacitor.getPlatform() === 'android';

function emptyIndex() {
  return { version: 1, files: {} };
}

async function readIndex() {
  try {
    const result = await Filesystem.readFile({ path: INDEX_PATH, directory: Directory.Data, encoding: Encoding.UTF8 });
    const parsed = JSON.parse(typeof result.data === 'string' ? result.data : await result.data.text());
    return parsed && parsed.version === 1 && parsed.files && typeof parsed.files === 'object' ? parsed : emptyIndex();
  } catch {
    return emptyIndex();
  }
}

async function writeIndex(index) {
  await Filesystem.writeFile({
    path: INDEX_PATH,
    directory: Directory.Data,
    encoding: Encoding.UTF8,
    data: JSON.stringify(index),
    recursive: true,
  });
}

function updateIndex(mutator) {
  const operation = indexQueue.then(async () => {
    const index = await readIndex();
    await mutator(index);
    await writeIndex(index);
    return index;
  });
  indexQueue = operation.catch(() => undefined);
  return operation;
}

async function hashUrl(url) {
  const bytes = new TextEncoder().encode(url);
  if (globalThis.crypto?.subtle) {
    const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
    return [...new Uint8Array(digest)].map((value) => value.toString(16).padStart(2, '0')).join('').slice(0, 32);
  }
  let first = 2166136261;
  let second = 2246822519;
  for (const byte of bytes) {
    first = Math.imul(first ^ byte, 16777619);
    second = Math.imul(second ^ byte, 3266489917);
  }
  return `${(first >>> 0).toString(16)}${(second >>> 0).toString(16)}`;
}

function fileExtension(url, kind) {
  try {
    const match = new URL(url).pathname.match(/\.([a-z0-9]{2,5})$/i);
    const ext = match?.[1]?.toLowerCase();
    if (ext && [...IMAGE_EXTENSIONS, ...VIDEO_EXTENSIONS, ...AUDIO_EXTENSIONS].includes(ext)) return ext;
  } catch { /* use kind fallback */ }
  return kind === 'video' ? 'mp4' : kind === 'audio' ? 'mp3' : 'jpg';
}

function isDownloadable(url, kind) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' || parsed.username || parsed.password) return false;
    const host = parsed.hostname.toLowerCase();
    if (host === 'youtube.com' || host.endsWith('.youtube.com') || host === 'youtu.be' || host.endsWith('.youtu.be') || host.endsWith('youtube-nocookie.com')) return false;
    const ext = parsed.pathname.match(/\.([a-z0-9]{2,5})$/i)?.[1]?.toLowerCase() || '';
    if (kind === 'image') return IMAGE_EXTENSIONS.has(ext) || (host === 'res.cloudinary.com' && parsed.pathname.includes('/image/upload/'));
    if (kind === 'video') return VIDEO_EXTENSIONS.has(ext) || (host === 'res.cloudinary.com' && parsed.pathname.includes('/video/upload/'));
    if (kind === 'audio') return AUDIO_EXTENSIONS.has(ext) || (host === 'res.cloudinary.com' && parsed.pathname.includes('/video/upload/'));
    return false;
  } catch {
    return false;
  }
}

function collectMedia(items) {
  const byUrl = new Map();
  const add = (url, kind) => {
    if (typeof url === 'string' && url && isDownloadable(url, kind) && !byUrl.has(url)) byUrl.set(url, { url, kind });
  };
  for (const item of Array.isArray(items) ? items : []) {
    add(item?.media?.imageUrl, 'image');
    add(item?.media?.videoUrl, 'video');
    add(item?.media?.audioUrl, 'audio');
    const embedded = item?.article?.embeddedMedia;
    if (embedded?.type === 'image' || embedded?.type === 'video' || embedded?.type === 'audio') add(embedded.url, embedded.type);
  }
  return [...byUrl.values()].slice(0, MAX_MEDIA_PER_PAGE);
}

async function localUri(url, index) {
  const key = await hashUrl(url);
  const entry = index.files[key];
  if (!entry?.path) return null;
  try {
    const stat = await Filesystem.stat({ path: entry.path, directory: Directory.Data });
    if (!stat.size) return null;
    const result = await Filesystem.getUri({ path: entry.path, directory: Directory.Data });
    return Capacitor.convertFileSrc(result.uri);
  } catch {
    return null;
  }
}

function replaceUrl(item, url, local) {
  if (item?.media && ['imageUrl', 'videoUrl', 'audioUrl'].some((key) => item.media[key] === url)) {
    const media = { ...item.media };
    if (media.imageUrl === url) media.imageUrl = local;
    if (media.videoUrl === url) media.videoUrl = local;
    if (media.audioUrl === url) media.audioUrl = local;
    item.media = media;
  }
  const embedded = item?.article?.embeddedMedia;
  if (embedded?.url === url) item.article = { ...item.article, embeddedMedia: { ...embedded, url: local } };
}

export async function hydrateOfflineMedia(items) {
  if (!isAndroid() || !Array.isArray(items) || !items.length) return items;
  const index = await readIndex();
  const hydrated = [];
  const touched = [];
  for (const original of items) {
    const item = JSON.parse(JSON.stringify(original));
    const urls = [item?.media?.imageUrl, item?.media?.videoUrl, item?.media?.audioUrl, item?.article?.embeddedMedia?.url].filter((url) => typeof url === 'string' && url);
    for (const url of new Set(urls)) {
      const local = await localUri(url, index);
      if (local) {
        replaceUrl(item, url, local);
        touched.push(await hashUrl(url));
      }
    }
    hydrated.push(item);
  }
  if (touched.length) {
    const lastUsed = Date.now();
    await updateIndex(async (current) => {
      for (const key of touched) if (current.files[key]) current.files[key].lastUsed = lastUsed;
    }).catch(() => undefined);
  }
  return hydrated;
}

async function deleteIndexedFile(entry) {
  if (!entry?.path) return;
  try { await Filesystem.deleteFile({ path: entry.path, directory: Directory.Data }); } catch { /* already removed */ }
}

async function pruneIndex(index) {
  let total = Object.values(index.files).reduce((sum, file) => sum + (Number(file.size) || 0), 0);
  if (total <= MAX_CACHE_BYTES) return;
  const oldestFirst = Object.entries(index.files).sort((a, b) => (Number(a[1].lastUsed || a[1].savedAt) || 0) - (Number(b[1].lastUsed || b[1].savedAt) || 0));
  for (const [key, entry] of oldestFirst) {
    if (total <= MAX_CACHE_BYTES) break;
    await deleteIndexedFile(entry);
    total -= Number(entry.size) || 0;
    delete index.files[key];
  }
}

async function downloadOne({ url, kind }) {
  if (inFlight.has(url)) return inFlight.get(url);
  const task = (async () => {
    const key = await hashUrl(url);
    const current = await readIndex();
    const found = current.files[key];
    if (found?.path) {
      try {
        const stat = await Filesystem.stat({ path: found.path, directory: Directory.Data });
        if (stat.size > 0) return;
      } catch { /* retry a missing/removed file */ }
    }
    const ext = fileExtension(url, kind);
    const path = `${MEDIA_DIR}/${key}.${ext}`;
    try {
      await Filesystem.mkdir({ path: MEDIA_DIR, directory: Directory.Data, recursive: true });
      await Filesystem.downloadFile({ url, path, directory: Directory.Data, recursive: true });
      const stat = await Filesystem.stat({ path, directory: Directory.Data });
      if (!stat.size || stat.size > MAX_FILE_BYTES) {
        await deleteIndexedFile({ path });
        return;
      }
      await updateIndex(async (index) => {
        index.files[key] = { path, size: stat.size, savedAt: Date.now(), lastUsed: Date.now(), kind };
        await pruneIndex(index);
      });
    } catch (error) {
      console.warn('[OfflineMediaCache] لم يكتمل تنزيل الوسيط:', error?.message || error);
      await deleteIndexedFile({ path });
    }
  })();
  inFlight.set(url, task);
  try { await task; } finally { inFlight.delete(url); }
}

export async function cacheOfflineMedia(pageName, items) {
  if (!isAndroid()) return;
  const candidates = collectMedia(items);
  for (let index = 0; index < candidates.length; index += DOWNLOAD_CONCURRENCY) {
    await Promise.all(candidates.slice(index, index + DOWNLOAD_CONCURRENCY).map(downloadOne));
  }
  console.info(`[OfflineMediaCache] تمت مزامنة وسائط ${pageName}: ${candidates.length} ملفًا مرشحًا.`);
}
