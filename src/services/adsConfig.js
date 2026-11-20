const ADS_API_BASE = (import.meta.env.VITE_ADS_API_BASE_URL || '').replace(/\/$/, '');
const CACHE_KEY = 'raqqa_ads_config_v1';
let memoryCache = null;
let memoryExpiresAt = 0;

function readCached() {
  try {
    const item = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
    if (item?.config && Number(item.expiresAt) > Date.now()) return item;
  } catch {}
  return null;
}

function writeCached(config) {
  const ttl = Math.max(5, Number(config.cache_ttl_seconds || 60));
  const item = { config, expiresAt: Date.now() + ttl * 1000 };
  memoryCache = config;
  memoryExpiresAt = item.expiresAt;
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(item)); } catch {}
}

export async function fetchAdsConfig({ platform, appVersion, userState } = {}) {
  if (!ADS_API_BASE) return null;
  const now = Date.now();
  if (memoryCache && memoryExpiresAt > now) return memoryCache;
  const cached = readCached();
  if (cached) {
    memoryCache = cached.config;
    memoryExpiresAt = cached.expiresAt;
    return cached.config;
  }

  const params = new URLSearchParams({
    ...(platform ? { platform } : {}),
    ...(appVersion ? { app_version: appVersion } : {}),
    ...(userState ? { user_state: userState } : {})
  });
  const response = await fetch(`${ADS_API_BASE}/api/v1/ads/config?${params}`, {
    headers: { Accept: 'application/json' }
  });
  if (!response.ok) throw new Error(`Ads config request failed: ${response.status}`);
  const config = await response.json();
  writeCached(config);
  return config;
}

export function isPlacementEnabled(config, placement) {
  return Boolean(config?.ads_enabled && config?.placements?.[placement]?.enabled);
}

export function getAdsProviderUnit(config, placement) {
  if (!isPlacementEnabled(config, placement)) return '';
  return config.placements[placement].ad_unit_id || '';
}
