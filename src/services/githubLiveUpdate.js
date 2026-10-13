import { Capacitor } from '@capacitor/core';
import { LiveUpdate } from '@capawesome/capacitor-live-update';

const MANIFEST_URL = 'https://github.com/zraq301-lgtm/raqqa/releases/download/ota-main/raqqa-ota-manifest.json';
const NATIVE_COMPATIBILITY = '1';

let updateCheckStarted = false;

async function fetchManifest() {
  const response = await fetch(`${MANIFEST_URL}?t=${Date.now()}`, {
    cache: 'no-store',
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`GitHub OTA manifest request failed: ${response.status}`);
  }

  return response.json();
}

export async function initializeGithubLiveUpdate() {
  if (!Capacitor.isNativePlatform() || updateCheckStarted) return;
  updateCheckStarted = true;

  try {
    // يجب تسجيل الجاهزية قبل أي فحص أو تنزيل حتى يعمل rollback بأمان.
    await LiveUpdate.ready();

    const current = await LiveUpdate.getCurrentBundle();
    const manifest = await fetchManifest();

    if (
      !manifest?.bundleId ||
      !manifest?.url ||
      manifest.nativeCompatibility !== NATIVE_COMPATIBILITY ||
      current.bundleId === manifest.bundleId
    ) {
      return;
    }

    await LiveUpdate.downloadBundle({
      artifactType: 'zip',
      bundleId: manifest.bundleId,
      checksum: manifest.checksum,
      url: manifest.url,
    });

    await LiveUpdate.setNextBundle({ bundleId: manifest.bundleId });
    await LiveUpdate.reload();
  } catch (error) {
    // فشل OTA لا يمنع تشغيل النسخة المحلية الحالية.
    console.warn('[GitHub OTA] Update skipped:', error);
  }
}
