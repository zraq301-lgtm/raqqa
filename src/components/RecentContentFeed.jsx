import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchRecentContentFeed } from '../services/adminService';

const SWING_TABS = {
  'أيقونة الأناقة': 'EleganceIcon',
  'شغف وحرف': 'PassionsCrafts',
  'ملاذ الأمومة': 'MotherhoodHaven',
  'واحة العافية': 'WellnessOasis',
  'دروب التمكين': 'EmpowermentPaths',
  'رواق الأرواح': 'SoulsLounge',
  'أكاديمية الصغار': 'LittleOnesAcademy',
  'الأرجوحة': 'Home',
  'bouh-display-1': 'Home',
  'bouh-display': 'Home',
};

const getTargetPath = (item) => {
  if (item.pageName === 'مكتبة رقة') return '/videos';
  if (item.pageName === 'مملكة الاسترخاء') return '/virtual-world';
  const tab = SWING_TABS[item.pageName];
  if (tab) return `/swing-forum?section=${encodeURIComponent(tab)}`;
  return '/health';
};

const getYoutubeId = (url = '') => {
  const match = String(url).match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:embed\/|shorts\/|watch\?v=))([\w-]{11})/i);
  return match?.[1] || '';
};

const getCardMedia = (item) => {
  const media = item.media || {};
  const embedded = item.article?.embeddedMedia || {};
  const image = media.imageUrl || (embedded.type === 'image' ? embedded.url : '');
  if (image) return { kind: 'image', url: image };
  const video = media.videoUrl || (embedded.type === 'video' ? embedded.url : '');
  const youtubeId = getYoutubeId(video);
  if (youtubeId) return { kind: 'image', url: `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`, video: true };
  return video ? { kind: 'video' } : { kind: 'article' };
};

const formatRemaining = (expiresAt, now) => {
  const remainingHours = Math.max(1, Math.ceil((new Date(expiresAt).getTime() - now) / 3600000));
  if (remainingHours >= 24) return `متبقي ${Math.ceil(remainingHours / 24)} يوم`;
  return `متبقي ${remainingHours} ساعة`;
};

export default function RecentContentFeed() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const recentItems = await fetchRecentContentFeed();
        if (active) setItems(Array.isArray(recentItems) ? recentItems : []);
      } catch (error) {
        console.warn('[RecentContentFeed] تعذر جلب المحتوى الحديث:', error?.message || error);
      }
    };
    load();
    const refreshTimer = window.setInterval(load, 60000);
    const clockTimer = window.setInterval(() => setNow(Date.now()), 60000);
    return () => {
      active = false;
      window.clearInterval(refreshTimer);
      window.clearInterval(clockTimer);
    };
  }, []);

  const visibleItems = items.filter((item) => new Date(item.expiresAt).getTime() > now);

  useEffect(() => {
    if (!visibleItems.length) return undefined;
    const nextExpiry = Math.min(...visibleItems.map((item) => new Date(item.expiresAt).getTime()));
    const timer = window.setTimeout(() => setNow(Date.now()), Math.max(0, nextExpiry - Date.now() + 10));
    return () => window.clearTimeout(timer);
  }, [items, now]);

  if (!visibleItems.length) return null;

  return (
    <section dir="rtl" aria-label="أحدث المنشورات" style={styles.section}>
      <div style={styles.heading}>
        <div>
          <span style={styles.eyebrow}>جديد رقة</span>
          <h2 style={styles.title}>أحدث المنشورات</h2>
        </div>
        <span style={styles.count}>{visibleItems.length} منشور</span>
      </div>
      <div style={styles.grid}>
        {visibleItems.map((item) => {
          const title = item.article?.title?.trim() || 'محتوى جديد';
          const body = item.article?.body?.trim() || '';
          const media = getCardMedia(item);
          const mediaType = media.video ? 'فيديو' : media.kind === 'image' ? 'صورة' : media.kind === 'video' ? 'فيديو' : 'مقال';
          return (
            <button
              type="button"
              key={`${item.pageName}-${item.id}`}
              style={styles.card}
              onClick={() => navigate(getTargetPath(item))}
              aria-label={`فتح ${title} في صفحة ${item.pageName}`}
            >
              <span style={styles.cover}>
                {media.kind === 'image' && <img src={media.url} alt="" loading="lazy" style={styles.coverImage} />}
                {media.kind !== 'image' && (
                  <span style={styles.placeholder} aria-hidden="true">
                    <span style={styles.placeholderIcon}>{media.kind === 'video' ? '▶' : '▤'}</span>
                    <span>{mediaType}</span>
                  </span>
                )}
                <span style={styles.typeBadge}>{mediaType}</span>
              </span>
              <span style={styles.content}>
                <span style={styles.sectionLabel}>{item.pageName}</span>
                <strong style={styles.cardTitle}>{title}</strong>
                {body && <span style={styles.body}>{body}</span>}
                <span style={styles.cardFooter}>
                  <span>فتح الصفحة ←</span>
                  <span style={styles.expiry}>{formatRemaining(item.expiresAt, now)}</span>
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

const styles = {
  section: { margin: '20px 16px 28px', fontFamily: 'Tajawal, sans-serif' },
  heading: { display: 'flex', alignItems: 'end', justifyContent: 'space-between', gap: 8, marginBottom: 12 },
  eyebrow: { color: '#b12a68', fontSize: 11, fontWeight: 800 },
  title: { color: '#442235', fontSize: 19, fontWeight: 900, margin: '2px 0 0' },
  count: { color: '#8f6178', background: '#fceaf2', borderRadius: 999, padding: '5px 9px', fontSize: 10, whiteSpace: 'nowrap' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10, alignItems: 'stretch' },
  card: { display: 'flex', flexDirection: 'column', minWidth: 0, padding: 0, textAlign: 'right', color: 'inherit', background: '#fff', border: '1px solid #f3dce7', borderRadius: 16, boxShadow: '0 5px 16px rgba(123,49,87,.08)', overflow: 'hidden', cursor: 'pointer', font: 'inherit', transition: 'transform .18s ease, box-shadow .18s ease' },
  cover: { display: 'block', position: 'relative', width: '100%', aspectRatio: '16 / 10', background: 'linear-gradient(135deg,#f8e7ef,#f4d6e4)' },
  coverImage: { display: 'block', width: '100%', height: '100%', objectFit: 'cover' },
  placeholder: { height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5, color: '#a04370', fontSize: 11, fontWeight: 700 },
  placeholderIcon: { display: 'grid', placeItems: 'center', width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,.75)', fontSize: 18 },
  typeBadge: { position: 'absolute', top: 7, right: 7, padding: '3px 7px', color: '#fff', background: 'rgba(70,30,52,.72)', borderRadius: 999, fontSize: 9, fontWeight: 700 },
  content: { display: 'flex', flexDirection: 'column', gap: 5, padding: '9px 9px 10px', minHeight: 112 },
  sectionLabel: { color: '#b12a68', fontSize: 9, fontWeight: 800, lineHeight: 1.4 },
  cardTitle: { color: '#3e2635', fontSize: 12, lineHeight: 1.45, fontWeight: 800, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
  body: { color: '#76616d', fontSize: 10, lineHeight: 1.45, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 4, marginTop: 'auto', color: '#9c3268', fontSize: 9, fontWeight: 800 },
  expiry: { color: '#8b7580', fontSize: 8, fontWeight: 600, whiteSpace: 'nowrap' },
};
