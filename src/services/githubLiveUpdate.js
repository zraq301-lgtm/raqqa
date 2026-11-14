import { Capacitor, CapacitorHttp } from '@capacitor/core';
import { LiveUpdate } from '@capawesome/capacitor-live-update';

const MANIFEST_URLS = [
  'https://raqqa-ota.pages.dev/ota/raqqa-ota-manifest.json',
  'https://github.com/zraq301-lgtm/raqqa/releases/download/ota-main/raqqa-ota-manifest.json',
];
const NATIVE_COMPATIBILITY = '1';
let updateCheckStarted = false;

async function fetchManifest() {
  let lastError;
  for (const baseUrl of MANIFEST_URLS) {
    const url = `${baseUrl}?t=${Date.now()}`;
    try {
      if (Capacitor.isNativePlatform()) {
        const response = await CapacitorHttp.get({ url, headers: { Accept: 'application/json' } });
        if (response.status < 200 || response.status >= 300) throw new Error(`OTA manifest request failed: ${response.status}`);
        return typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
      }
      const response = await fetch(url, { cache: 'no-store', headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error(`OTA manifest request failed: ${response.status}`);
      return response.json();
    } catch (error) {
      lastError = error;
      console.warn(`[OTA] Source unavailable: ${baseUrl}`, error);
    }
  }
  throw lastError || new Error('No OTA manifest source is available');
}

async function checkAndApplyUpdate() {
  await LiveUpdate.ready();
  const [current, manifest] = await Promise.all([LiveUpdate.getCurrentBundle(), fetchManifest()]);
  const currentBundleId = current?.bundleId || null;
  if (!manifest?.bundleId || !manifest?.url || manifest.nativeCompatibility !== NATIVE_COMPATIBILITY) return false;
  if (currentBundleId === manifest.bundleId) return false;
  await LiveUpdate.downloadBundle({
    artifactType: 'zip',
    bundleId: manifest.bundleId,
    checksum: manifest.checksum,
    url: manifest.url,
  });
  await LiveUpdate.setNextBundle({ bundleId: manifest.bundleId });
  await LiveUpdate.reload();
  return true;
}

export async function initializeGithubLiveUpdate() {
  if (!Capacitor.isNativePlatform() || updateCheckStarted) return;
  updateCheckStarted = true;
  const run = async () => {
    try {
      await checkAndApplyUpdate();
    } catch (error) {
      console.warn('[GitHub OTA] Update skipped; retrying once:', error);
      setTimeout(async () => {
        try { await checkAndApplyUpdate(); }
        catch (retryError) { console.warn('[GitHub OTA] Retry skipped:', retryError); }
      }, 2500);
    }
  };
  // ننتظر تحميل WebView قليلًا حتى لا يتسابق OTA مع شاشة البداية.
  setTimeout(run, 1200);
}
