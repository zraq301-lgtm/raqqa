import { Preferences } from '@capacitor/preferences';

const CACHE_VERSION = 'v1';
export const CONTENT_CACHE_TTL_MS = 15 * 60 * 1000;

const keyFor = (kind, value = '') => `raqqa_${CACHE_VERSION}_content_${kind}_${encodeURIComponent(value)}`;

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

export const readPageCache = async (pageName) => {
  const entry = await readEntry(keyFor('page', pageName));
  if (!entry || !Array.isArray(entry.items)) return null;
  return { items: entry.items, savedAt: Number(entry.savedAt) || 0 };
};

export const writePageCache = (pageName, items) => writeEntry(keyFor('page', pageName), {
  items: Array.isArray(items) ? items : [],
  savedAt: Date.now(),
});

export const readRecentCache = async () => {
  const entry = await readEntry(keyFor('recent'));
  if (!entry || !Array.isArray(entry.items)) return null;
  return { items: entry.items, savedAt: Number(entry.savedAt) || 0 };
};

export const writeRecentCache = (items) => writeEntry(keyFor('recent'), {
  items: Array.isArray(items) ? items : [],
  savedAt: Date.now(),
});

export const isCacheFresh = (entry) => Boolean(entry?.savedAt && Date.now() - entry.savedAt < CONTENT_CACHE_TTL_MS);
