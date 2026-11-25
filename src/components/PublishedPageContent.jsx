import React, { useEffect, useState } from 'react';
import { fetchPageData } from '../services/adminService';
import { isCacheFresh, readPageCache, writePageCache } from '../services/contentCache';
import VideoPlayer from './VideoTools';

const getItems = (result) => {
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.items)) return result.items;
  return result && typeof result === 'object' ? [result] : [];
};

const getYoutubeId = (url = '') => {
  const match = String(url).match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:embed\/|shorts\/|watch\?v=))([\w-]{11})/i);
  return match?.[1] || '';
};

function ContentMedia({ item }) {
  const media = item.media || {};
  const embedded = item.article?.embeddedMedia || {};
  const imageUrl = media.imageUrl || (embedded.type === 'image' ? embedded.url : '');
  const videoUrl = media.videoUrl || (embedded.type === 'video' ? embedded.url : '');
  const youtubeId = getYoutubeId(videoUrl);

  if (imageUrl) return <img className="published-content-media" src={imageUrl} alt={item.article?.title || 'صورة المحتوى'} loading="lazy" />;
  if (youtubeId || videoUrl) return <VideoPlayer url={videoUrl} title={item.article?.title || 'فيديو من رقة'} className="published-content-video" />;
  return null;
}

export default function PublishedPageContent({ pageNames = [], title = 'منشورات هذه الصفحة' }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const applyItems = (results) => {
      const merged = results.flatMap(getItems).filter(Boolean);
      merged.sort((a, b) => new Date(b.lastUpdated || b.publishedAt || 0) - new Date(a.lastUpdated || a.publishedAt || 0));
      return merged;
    };
    const load = async () => {
      const cached = await Promise.all(pageNames.map((pageName) => readPageCache(pageName)));
      const cachedResults = cached.map((entry) => entry?.items || []);
      const hasCachedItems = cachedResults.some((entry) => entry.length > 0);
      if (active && hasCachedItems) {
        setItems(applyItems(cachedResults));
        setLoading(false);
      }
      if (cached.length === pageNames.length && cached.every((entry) => isCacheFresh(entry))) {
        if (active && !hasCachedItems) setLoading(false);
        return;
      }

      const results = await Promise.all(pageNames.map(async (pageName) => {
        try {
          const result = (await fetchPageData(pageName)) || [];
          await writePageCache(pageName, getItems(result));
          return result;
        } catch (error) {
          console.warn(`[PublishedPageContent] تعذر تحميل ${pageName}:`, error?.message || error);
          return [];
        }
      }));
      if (!active) return;
      setItems(applyItems(results));
      setLoading(false);
    };
    load();
    return () => { active = false; };
  }, [pageNames.join('|')]);

  if (loading) return <section className="published-content-section" aria-live="polite"><p className="published-content-status">جارٍ تحميل منشورات الصفحة…</p></section>;
  if (!items.length) return null;

  return (
    <section className="published-content-section" dir="rtl" aria-label={title}>
      <div className="published-content-heading"><span>محتوى محفوظ في هذا القسم</span><h2>{title}</h2></div>
      <div className="published-content-list">
        {items.map((item, index) => {
          const headline = item.article?.title?.trim() || 'محتوى من رقة';
          const body = item.article?.body?.trim() || '';
          return (
            <article className="published-content-card" key={`${item.pageName || pageNames[0]}-${item.id || index}`}>
              <ContentMedia item={item} />
              <div className="published-content-copy">
                {headline && <h3>{headline}</h3>}
                {body && <p>{body}</p>}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
