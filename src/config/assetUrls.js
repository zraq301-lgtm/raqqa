const ASSET_CDN_BASE = (import.meta.env.VITE_ASSET_CDN_URL || 'https://raqqa-ota.pages.dev/cdn/raqqa').replace(/\/$/, '');

export const remoteAsset = (name) => `${ASSET_CDN_BASE}/${name}`;

export const pageImages = {
  health: remoteAsset('health.jpg'),
  insight: remoteAsset('insight.jpg'),
  feelings: remoteAsset('feelings.jpg'),
  intimacy: remoteAsset('intimacy.jpg'),
  swing: remoteAsset('swing.jpg'),
  videos: remoteAsset('videos.jpg'),
  virtual: remoteAsset('virtual.jpg'),
};

export const healthImages = {
  'female-whispers.png': remoteAsset('health/female-whispers.png'),
  'menstrual.png': remoteAsset('health/menstrual.png'),
  'advice.png': remoteAsset('health/advice.png'),
  'pregnancy.png': remoteAsset('health/pregnancy.png'),
  'motherhood.png': remoteAsset('health/motherhood.png'),
  'doctor.png': remoteAsset('health/doctor.png'),
  'fitness.png': remoteAsset('health/fitness.png'),
  'lactation.png': remoteAsset('health/lactation.png'),
};
