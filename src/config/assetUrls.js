const ASSET_CDN_BASE = (import.meta.env.VITE_ASSET_CDN_URL || 'https://raqqa-ota.pages.dev/cdn/raqqa').replace(/\/$/, '');

export const remoteAsset = (name) => `${ASSET_CDN_BASE}/${name}`;

export const pageImages = {
  health: remoteAsset('health.webp'),
  insight: remoteAsset('insight.webp'),
  feelings: remoteAsset('feelings.webp'),
  intimacy: remoteAsset('intimacy.webp'),
  swing: remoteAsset('swing.webp'),
  videos: remoteAsset('videos.webp'),
  virtual: remoteAsset('virtual.webp'),
};

export const healthImages = {
  'female-whispers.png': remoteAsset('health/female-whispers.webp'),
  'menstrual.png': remoteAsset('health/menstrual.webp'),
  'advice.png': remoteAsset('health/advice.webp'),
  'pregnancy.png': remoteAsset('health/pregnancy.webp'),
  'motherhood.png': remoteAsset('health/motherhood.webp'),
  'doctor.png': remoteAsset('health/doctor.webp'),
  'fitness.png': remoteAsset('health/fitness.webp'),
  'lactation.png': remoteAsset('health/lactation.webp'),
};
