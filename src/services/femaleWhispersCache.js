import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

const CACHE_VERSION = 'v1';
export const FEMALE_WHISPERS_CACHE_TTL_MS = 6 * 60 * 60 * 1000;

const keyFor = (uid) => `raqqa_${CACHE_VERSION}_female_whispers_${uid || 'guest'}`;

const readFallback = (key) => {
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
};

const writeFallback = (key, value) => {
  try { window.localStorage.setItem(key, JSON.stringify(value)); } catch { /* optional fallback */ }
};

export async function readFemaleWhispersCache(uid) {
  const key = keyFor(uid);
  try {
    const result = await Preferences.get({ key });
    if (result.value) return JSON.parse(result.value);
  } catch { /* use localStorage on web/older builds */ }
  return readFallback(key);
}

export async function writeFemaleWhispersCache(uid, entries) {
  const key = keyFor(uid);
  const value = { version: CACHE_VERSION, savedAt: Date.now(), entries: Array.isArray(entries) ? entries : [] };
  try {
    await Preferences.set({ key, value: JSON.stringify(value) });
  } catch {
    writeFallback(key, value);
  }
  return value;
}

export const isFemaleWhispersCacheFresh = (entry) => Boolean(
  entry?.savedAt && Date.now() - Number(entry.savedAt) < FEMALE_WHISPERS_CACHE_TTL_MS,
);

export const isAndroidCache = () => Capacitor.getPlatform() === 'android';
