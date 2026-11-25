import React, { useState } from 'react';
import { ExternalLink, Film, ChevronRight, ChevronLeft, Download } from 'lucide-react';
import { downloadVideoToDevice, isDirectVideoUrl, isYoutubeUrl } from '../services/videoDownload';
import AdBanner from './AdBanner';

function youtubeEmbedUrl(url) {
  if (String(url).includes('/embed/')) return url;
  try {
    const parsed = new URL(url);
    const id = parsed.hostname.includes('youtu.be') ? parsed.pathname.slice(1).split('/')[0] : (parsed.searchParams.get('v') || parsed.pathname.split('/').filter(Boolean).pop());
    return id ? `https://www.youtube-nocookie.com/embed/${id}` : url;
  } catch { return url; }
}

export function VideoAdSlot() {
  return <div className="video-ad-slot" role="complementary" aria-label="إعلان"><AdBanner placement="banner" /></div>;
}

export function VideoActions({ url, title = 'فيديو من رقة', previousUrl, nextUrl, onPrevious, onNext, showAd = true }) {
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const youtube = isYoutubeUrl(url);
  const downloadable = isDirectVideoUrl(url);
  const download = async () => {
    if (busy) return;
    setBusy(true); setStatus('جاري تجهيز التنزيل…');
    try {
      const result = await downloadVideoToDevice(url, title);
      setStatus(result.mode === 'device' ? `تم الحفظ في ملفات الجهاز: ${result.filename}` : 'بدأ تنزيل الفيديو في المتصفح.');
    } catch (error) { setStatus(error.message || 'تعذر تنزيل الفيديو.'); }
    finally { setBusy(false); }
  };
  return <>
    <div className="video-actions" dir="rtl">
      {downloadable && <button type="button" onClick={download} disabled={busy} className="video-action-button video-download-button"><Download size={16} />{busy ? 'جاري التنزيل…' : 'تحميل الفيديو'}</button>}
      {youtube && <a className="video-action-button video-open-button" href={url} target="_blank" rel="noreferrer"><ExternalLink size={16} />فتح الفيديو</a>}
      {(previousUrl || nextUrl) && <div className="video-navigation" aria-label="التنقل بين الفيديوهات">
        <button type="button" onClick={onPrevious} disabled={!previousUrl || !onPrevious}><ChevronRight size={17} />السابق</button>
        <span><Film size={14} /> التنقل بين الفيديوهات</span>
        <button type="button" onClick={onNext} disabled={!nextUrl || !onNext}>التالي<ChevronLeft size={17} /></button>
      </div>}
    </div>
    {status && <p className="video-action-status" role="status">{status}</p>}
    {showAd && <VideoAdSlot />}
    <style>{`.video-actions{display:flex;align-items:center;flex-wrap:wrap;gap:8px;margin:10px 0 5px}.video-action-button,.video-navigation button{display:inline-flex;align-items:center;justify-content:center;gap:6px;border:0;border-radius:12px;padding:9px 11px;font:inherit;font-size:12px;font-weight:800;text-decoration:none;cursor:pointer}.video-download-button{background:#b12a68;color:#fff}.video-open-button{background:#fceaf2;color:#9f245d}.video-action-button:disabled,.video-navigation button:disabled{opacity:.4;cursor:not-allowed}.video-navigation{display:flex;align-items:center;gap:5px;width:100%;justify-content:space-between;margin-top:3px}.video-navigation button{background:#fff;border:1px solid #edd6e2;color:#9f245d}.video-navigation span{display:inline-flex;align-items:center;gap:4px;color:#8f6178;font-size:10px;font-weight:700}.video-action-status{margin:5px 0;color:#6c5361;font-size:11px;line-height:1.6}.video-ad-slot{display:flex;justify-content:center;min-height:0;margin:10px 0}`}</style>
  </>;
}

export default function VideoPlayer({ url, title = 'فيديو من رقة', className = '', showAd = true, previousUrl, nextUrl, onPrevious, onNext }) {
  if (!url) return null;
  if (isYoutubeUrl(url)) return <div className={className}>
    <div className="video-player-frame"><iframe src={youtubeEmbedUrl(url)} title={title} allowFullScreen /></div>
    <VideoActions url={url} title={title} showAd={showAd} previousUrl={previousUrl} nextUrl={nextUrl} onPrevious={onPrevious} onNext={onNext} />
    <style>{`.video-player-frame{position:relative;width:100%;aspect-ratio:16/9;border-radius:13px;overflow:hidden;background:#241a20}.video-player-frame iframe{position:absolute;inset:0;width:100%;height:100%;border:0}`}</style>
  </div>;
  return <div className={className}>
    <video src={url} controls playsInline preload="metadata" style={{ width: '100%', display: 'block', borderRadius: 13 }} />
    <VideoActions url={url} title={title} showAd={showAd} previousUrl={previousUrl} nextUrl={nextUrl} onPrevious={onPrevious} onNext={onNext} />
  </div>;
}
