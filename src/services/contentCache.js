import { Capacitor } from '@capacitor/core';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';
import { hydrateOfflineMedia } from './offlineMediaCache';

const CACHE_VERSION = 'v3';
const RECENT_CACHE_VERSION = 'v3';
export const CONTENT_CACHE_TTL_MS = 15 * 60 * 1000;

const keyFor = (kind, value = '') => `raqqa_${CACHE_VERSION}_content_${kind}_${encodeURIComponent(value)}`;
const recentKey = () => `raqqa_${RECENT_CACHE_VERSION}_content_recent_`;

const readStorageFallback = (key) => {
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
};

const writeStorageFallback = (key, value) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // التخزين المحلي اختياري؛ لا نوقف عرض المحتوى إذا امتلأت المساحة.
  }
};

const readEntry = async (key) => {
  try {
    const result = await Preferences.get({ key });
    if (result.value) return JSON.parse(result.value);
  } catch {
    // استخدم localStorage كخطة بديلة للويب أو الإصدارات القديمة.
  }
  return readStorageFallback(key);
};

const writeEntry = async (key, value) => {
  const serialized = JSON.stringify(value);
  try {
    await Preferences.set({ key, value: serialized });
  } catch {
    writeStorageFallback(key, value);
  }
};

const isAndroid = () => Capacitor.getPlatform() === 'android';
const persistentFilePath = (kind, value = '', version = '') => `raqqa-offline/content/${version ? `${version}-` : ''}${kind}-${encodeURIComponent(value || 'recent')}.json`;

const readPersistentEntry = async (kind, value = '', version = '') => {
  if (!isAndroid()) return null;
  try {
    const result = await Filesystem.readFile({ path: persistentFilePath(kind, value, version), directory: Directory.Data, encoding: Encoding.UTF8 });
    const serialized = typeof result.data === 'string' ? result.data : await result.data.text();
    return JSON.parse(serialized);
  } catch {
    return null;
  }
};

const writePersistentEntry = async (kind, value, entry, version = '') => {
  if (!isAndroid()) return false;
  try {
    await Filesystem.writeFile({
      path: persistentFilePath(kind, value, version),
      directory: Directory.Data,
      encoding: Encoding.UTF8,
      data: JSON.stringify(entry),
      recursive: true,
    });
    return true;
  } catch {
    return false;
  }
};

export const readPageCache = async (pageName) => {
  const entry = await readPersistentEntry('page', pageName) || await readEntry(keyFor('page', pageName));
  if (!entry || !Array.isArray(entry.items)) return null;
  return { items: await hydrateOfflineMedia(entry.items), savedAt: Number(entry.savedAt) || 0 };
};

export const writePageCache = async (pageName, items) => {
  const entry = { items: Array.isArray(items) ? items : [], savedAt: Date.now() };
  if (await writePersistentEntry('page', pageName, entry)) return;
  await writeEntry(keyFor('page', pageName), entry);
};

export const readRecentCache = async () => {
  const entry = await readPersistentEntry('recent', '', RECENT_CACHE_VERSION) || await readEntry(recentKey());
  if (!entry || !Array.isArray(entry.items)) return null;
  return { items: await hydrateOfflineMedia(entry.items), savedAt: Number(entry.savedAt) || 0 };
};

export const writeRecentCache = async (items) => {
  const entry = { items: Array.isArray(items) ? items : [], savedAt: Date.now() };
  if (await writePersistentEntry('recent', '', entry, RECENT_CACHE_VERSION)) return;
  await writeEntry(recentKey(), entry);
};

export const isCacheFresh = (entry) => Boolean(entry?.savedAt && Date.now() - entry.savedAt < CONTENT_CACHE_TTL_MS);
