import { existsSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

const distRoot = resolve('dist_web');
const legacyAssets = [
  'swing-welcome-passions.png',
  'swing-welcome-empowerment.png',
  'swing-welcome-little-ones.png',
  'cdn/raqqa/health/female-whispers.png',
  'cdn/raqqa/health/menstrual.png',
  'cdn/raqqa/health/advice.png',
  'cdn/raqqa/health/pregnancy.png',
  'cdn/raqqa/health/motherhood.png',
  'cdn/raqqa/health/doctor.png',
  'cdn/raqqa/health/fitness.png',
  'cdn/raqqa/health/lactation.png',
  'cdn/raqqa/health.jpg',
  'cdn/raqqa/feelings.jpg',
  'cdn/raqqa/intimacy.jpg',
  'cdn/raqqa/swing.jpg',
  'cdn/raqqa/insight.jpg',
  'cdn/raqqa/videos.jpg',
  'cdn/raqqa/virtual.jpg',
];

let removed = 0;
for (const relativePath of legacyAssets) {
  const file = resolve(distRoot, relativePath);
  if (existsSync(file)) {
    rmSync(file);
    removed += 1;
  }
}
console.log(`[asset-compression] removed ${removed} legacy copies from dist_web only; source originals were preserved.`);
