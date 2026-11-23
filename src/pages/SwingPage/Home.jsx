import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Send, Share2, ImagePlus, RefreshCw, Heart, Star, Link2, X } from 'lucide-react';
import { getFirebaseIdToken } from '../../services/authService';
import PublishedPageContent from '../../components/PublishedPageContent';
import PrivateAssistantWidget from '../../components/PrivateAssistantWidget';

const API_BASE = (import.meta.env.VITE_RAQQA_API_BASE_URL || 'https://raqqa-backend.raqqa-api.workers.dev').replace(/\/$/, '');
const SECTION = 'bouh-display-1';
const api = (path) => `${API_BASE}${path}`;

const getMediaType = (url = '', explicit = '') => {
  if (explicit) return explicit;
  const normalized = String(url).toLowerCase().split('?')[0];
  if (/youtube\.com|youtu\.be/.test(url)) return 'video';
  if (/\.(mp4|webm|ogg|mov|m4v)$/.test(normalized)) return 'video';
  if (/\.(png|jpe?g|gif|webp|bmp|avif)$/.test(normalized)) return 'image';
  return url ? 'link' : '';
};

const getMediaUrl = (post) => post?.media_url || post?.external_link || post?.media?.url || '';
const getAuthor = (post) => post?.author_name || post?.display_name || post?.user_name || post?.author?.display_name || post?.author?.name || 'عضوة في رِقّة';
const getTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : new Intl.DateTimeFormat('ar', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
};
const responseJson = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data?.success === false) throw new Error('تعذر إكمال الطلب. حاولي مرة أخرى.');
  return data;
};

function MediaView({ url, type }) {
  if (!url) return null;
  const mediaType = getMediaType(url, type);
  let youtubeId = '';
  if (mediaType === 'video' && /youtube\.com|youtu\.be/.test(url)) {
    try {
      const parsed = new URL(url);
      youtubeId = parsed.hostname.includes('youtu.be') ? parsed.pathname.slice(1) : (parsed.searchParams.get('v') || parsed.pathname.split('/').filter(Boolean).pop() || '');
    } catch { youtubeId = ''; }
  }
  if (youtubeId) return <div className="swing-media-frame"><iframe src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(youtubeId)}`} title="فيديو من يوتيوب" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /></div>;
  if (mediaType === 'image') return <img className="swing-post-image" src={url} alt="مرفق المنشور" loading="lazy" />;
  if (mediaType === 'video') return <video className="swing-post-video" src={url} controls playsInline preload="metadata" />;
  return <a className="swing-link-card" href={url} target="_blank" rel="noreferrer"><Link2 size={18} /><span>فتح المرفق</span></a>;
}

export default function Home({ user }) {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState('');
  const [uploading, setUploading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState({});
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [commentsByPost, setCommentsByPost] = useState({});
  const [expandedComments, setExpandedComments] = useState({});
  const [commentDrafts, setCommentDrafts] = useState({});
  const fileRef = useRef(null);
  const userName = useMemo(() => user?.display_name || user?.displayName || user?.firebaseUser?.displayName || user?.name || user?.email?.split('@')[0] || 'عضوة', [user]);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await responseJson(await fetch(api(`/api/posts?section=${encodeURIComponent(SECTION)}`), { cache: 'no-store' }));
      setPosts(Array.isArray(data.posts) ? data.posts : []);
    } catch (err) {
      setError('تعذر تحميل المنشورات. حاولي مرة أخرى.');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadPosts(); }, [loadPosts]);
  useEffect(() => {
    const postId = new URLSearchParams(window.location.search).get('communityPost');
    if (!postId || !posts.some((post) => String(post.id) === postId)) return;
    requestAnimationFrame(() => document.getElementById(`post-${postId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
  }, [posts]);

  const authenticatedRequest = async (path, options = {}) => {
    const token = await getFirebaseIdToken();
    if (!token) throw new Error('يلزم تسجيل الدخول أولًا للمتابعة.');
    const headers = { ...(options.headers || {}), Authorization: `Bearer ${token}` };
    if (options.body && !(options.body instanceof FormData)) headers['Content-Type'] = 'application/json';
    return responseJson(await fetch(api(path), { ...options, headers }));
  };

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setError(''); setNotice('');
    if (!user) { setError('سجّلي الدخول لرفع الصور أو الفيديوهات.'); return; }
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) { setError('يمكن رفع صورة أو فيديو فقط.'); return; }
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file, file.name);
      const result = await authenticatedRequest('/api/community/media', { method: 'POST', body: form });
      const url = result.url || result.media_url || result.public_url || result.publicUrl || result.data?.url || result.media?.url;
      if (!url || !/^https:\/\//i.test(url)) throw new Error('تعذر تجهيز المرفق. حاولي رفعه مرة أخرى.');
      setMediaUrl(url);
      setMediaType(file.type.startsWith('video/') ? 'video' : 'image');
      setNotice('تم رفع الملف بنجاح.');
    } catch (err) {
      setError('تعذر رفع الملف. تحققي من اتصالك ثم حاولي مرة أخرى.');
    } finally { setUploading(false); }
  };

  const publish = async (event) => {
    event.preventDefault();
    setError(''); setNotice('');
    if (!user) { setError('سجّلي الدخول لنشر مشاركة في غرفة الأرجوحة.'); return; }
    if (!content.trim() && !mediaUrl.trim()) { setError('اكتبي شيئًا أو أضيفي رابطًا قبل النشر.'); return; }
    if (mediaUrl.trim() && !/^https:\/\//i.test(mediaUrl.trim())) { setError('أضيفي رابطًا صالحًا للمشاركة.'); return; }
    setPublishing(true);
    try {
      await authenticatedRequest('/api/posts', { method: 'POST', body: JSON.stringify({ content: content.trim(), media_url: mediaUrl.trim(), media_type: mediaUrl ? getMediaType(mediaUrl, mediaType) : '', section: SECTION }) });
      setContent(''); setMediaUrl(''); setMediaType('');
      setNotice('نُشرت مشاركتك في الغرفة.');
      await loadPosts();
    } catch (err) { setError('تعذر نشر المشاركة. حاولي مرة أخرى.'); }
    finally { setPublishing(false); }
  };

  const updateReaction = async (postId, type) => {
    if (!user) { setError('سجّلي الدخول لإضافة تفاعل.'); return; }
    const key = `post-${postId}-${type}`;
    setBusy((value) => ({ ...value, [key]: true })); setError('');
    try {
      await authenticatedRequest(`/api/posts/${encodeURIComponent(postId)}/reactions`, { method: 'POST', body: JSON.stringify({ reaction_type: type }) });
      await loadPosts();
    } catch (err) { setError('تعذر تسجيل التفاعل. حاولي مرة أخرى.'); }
    finally { setBusy((value) => ({ ...value, [key]: false })); }
  };

  const loadComments = async (postId) => {
    try {
      const data = await responseJson(await fetch(api(`/api/posts/${encodeURIComponent(postId)}/comments`), { cache: 'no-store' }));
      setCommentsByPost((current) => ({ ...current, [postId]: Array.isArray(data.comments) ? data.comments : [] }));
    } catch (err) { setError('تعذر تحميل التعليقات. حاولي مرة أخرى.'); }
  };
  const toggleComments = async (postId) => {
    const opening = !expandedComments[postId];
    setExpandedComments((current) => ({ ...current, [postId]: opening }));
    if (opening && !Object.prototype.hasOwnProperty.call(commentsByPost, postId)) await loadComments(postId);
  };
  const addComment = async (event, postId) => {
    event.preventDefault();
    if (!user) { setError('سجّلي الدخول لإضافة تعليق.'); return; }
    const body = (commentDrafts[postId] || '').trim();
    if (!body) return;
    const key = `comment-${postId}`;
    setBusy((value) => ({ ...value, [key]: true })); setError('');
    try {
      await authenticatedRequest(`/api/posts/${encodeURIComponent(postId)}/comments`, { method: 'POST', body: JSON.stringify({ body }) });
      setCommentDrafts((current) => ({ ...current, [postId]: '' }));
      await Promise.all([loadComments(postId), loadPosts()]);
    } catch (err) { setError('تعذر نشر التعليق. حاولي مرة أخرى.'); }
    finally { setBusy((value) => ({ ...value, [key]: false })); }
  };
  const reactToComment = async (commentId) => {
    if (!user) { setError('سجّلي الدخول لإضافة تفاعل.'); return; }
    try {
      await authenticatedRequest(`/api/comments/${encodeURIComponent(commentId)}/reactions`, { method: 'POST', body: JSON.stringify({ reaction_type: 'heart' }) });
      const parent = Object.entries(commentsByPost).find(([, list]) => list.some((comment) => String(comment.id) === String(commentId)))?.[0];
      if (parent) await loadComments(parent);
    } catch (err) { setError('تعذر تسجيل تفاعل التعليق. حاولي مرة أخرى.'); }
  };
  const sharePost = async (post) => {
    const url = `${window.location.origin}/swing-forum?section=Home&communityPost=${encodeURIComponent(post.id)}#post-${encodeURIComponent(post.id)}`;
    try {
      if (Capacitor.isNativePlatform()) await Share.share({ title: 'مشاركة من غرفة الأرجوحة', text: post.content || 'مشاركة من رِقّة', url });
      else if (navigator.share) await navigator.share({ title: 'مشاركة من غرفة الأرجوحة', text: post.content || '', url });
      else if (navigator.clipboard) { await navigator.clipboard.writeText(url); setNotice('نُسخ رابط المشاركة.'); }
      else { window.prompt('انسخي رابط المشاركة:', url); }
    } catch (err) { if (err?.name !== 'AbortError') setError('تعذرت المشاركة؛ حاولي نسخ الرابط يدويًا.'); }
  };

  return (
    <div className="community-room" dir="rtl">
      <style>{`
        .community-room{--room-pink:#d94f7b;--room-deep:#9c3d61;--room-ink:#3e3037;max-width:850px;margin:0 auto;padding:6px 0 38px;color:var(--room-ink);font-family:'Tajawal',sans-serif}
        .swing-welcome-heading{display:flex;align-items:end;justify-content:space-between;gap:10px;margin:0 2px 10px}.swing-welcome-heading strong{color:#553f49;font-size:18px}.swing-welcome-heading span{color:#9b8b92;font-size:11px}
        .swing-welcome-cards{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-bottom:18px}
        .swing-welcome-card{position:relative;display:block;overflow:hidden;min-width:0;padding:0;border:0;border-radius:21px;background:#fff;cursor:pointer;box-shadow:0 10px 22px rgba(96,43,72,.16);font:inherit;transition:transform .18s ease,box-shadow .18s ease}.swing-welcome-card:hover{transform:translateY(-3px);box-shadow:0 14px 28px rgba(96,43,72,.22)}.swing-welcome-card:focus-visible{outline:3px solid #d94f7b;outline-offset:3px}
        .swing-welcome-card img{display:block;width:100%;height:auto;aspect-ratio:4/5;object-fit:cover}.swing-welcome-card-label{position:absolute;inset:auto 9px 9px;background:#2d1f27b8;color:#fff;border-radius:10px;padding:6px 8px;font-size:10px;font-weight:800;line-height:1.5}
        .composer,.post-card{background:#fff;border:1px solid #f1dfe6;border-radius:20px;box-shadow:0 7px 24px #7f394b0d;margin-bottom:14px}.composer{padding:17px}.composer-head{display:flex;align-items:center;gap:11px;margin-bottom:12px}.room-avatar{width:42px;height:42px;border-radius:15px;background:#fae5ed;color:#b13e68;display:grid;place-items:center;font-weight:800;font-size:19px;flex:none}.composer-head strong{display:block}.composer-head small{color:#998891}.composer textarea{display:block;width:100%;min-height:82px;resize:vertical;border:0;border-radius:12px;background:#fffafd;padding:12px;outline:none;line-height:1.7;color:var(--room-ink)}.composer textarea:focus,.room-link-input:focus{box-shadow:0 0 0 2px #ed9eb7}.room-link-input{width:100%;margin-top:9px;border:1px solid #f0e1e7;border-radius:11px;padding:11px;background:#fff}.composer-tools{display:flex;align-items:center;gap:9px;flex-wrap:wrap;margin-top:12px}.upload-label,.room-action,.publish-button,.refresh-button{display:inline-flex;align-items:center;justify-content:center;gap:7px;border:0;border-radius:12px;font-weight:700;padding:10px 13px;cursor:pointer}.upload-label{background:#fff0f5;color:#a83e65}.publish-button{margin-right:auto;background:linear-gradient(135deg,#e66d91,#c8426e);color:#fff;min-width:108px}.publish-button:disabled,.upload-label:has(input:disabled){opacity:.55;cursor:wait}.room-action{background:#fff8fa;color:#786771;padding:8px 11px;font-size:13px}.refresh-button{background:#fff;color:#a83e65;border:1px solid #f0dce4;padding:8px 11px}.room-message{padding:10px 13px;border-radius:12px;margin:10px 0;font-size:14px}.room-message.error{background:#fff0f0;color:#a73347}.room-message.success{background:#eef9f2;color:#28744a}.media-preview{position:relative;margin-top:10px;padding:8px;border:1px solid #f0e0e7;border-radius:14px}.media-remove{position:absolute;z-index:2;left:12px;top:12px;border:0;border-radius:50%;background:#fff;color:#80324c;width:30px;height:30px;display:grid;place-items:center;box-shadow:0 2px 8px #0002}.post-card{overflow:hidden}.post-header{padding:15px 17px 7px;display:flex;align-items:center;gap:10px}.post-avatar{width:41px;height:41px;border-radius:50%;object-fit:cover;background:#fae5ed;display:grid;place-items:center;color:#af4266;font-weight:800}.post-author{flex:1;min-width:0}.post-author strong{display:block;font-size:15px}.post-author time{font-size:12px;color:#9c8c93}.post-content{white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.8;margin:7px 17px 12px;font-size:15px}.post-media{margin:0 12px 12px}.swing-post-image,.swing-post-video{display:block;width:100%;max-height:540px;object-fit:contain;border-radius:14px;background:#171316}.swing-media-frame{width:100%;aspect-ratio:16/9;border-radius:14px;overflow:hidden;background:#171316}.swing-media-frame iframe{width:100%;height:100%;border:0}.swing-link-card{display:flex;align-items:center;gap:9px;background:#fff6f9;padding:13px;border-radius:12px;color:#9d3a61;text-decoration:none;overflow-wrap:anywhere}.post-actions{border-top:1px solid #f6edf0;padding:9px 13px;display:flex;gap:7px;flex-wrap:wrap}.post-actions .room-action{flex:1}.reaction-heart{color:#c53a5c}.reaction-star{color:#a46d10}.comment-area{border-top:1px solid #f6edf0;background:#fffafb;padding:12px 14px}.comment-item{display:flex;align-items:flex-start;gap:9px;padding:8px 0}.comment-bubble{flex:1;background:#fff;border-radius:12px;padding:9px 11px;font-size:13px}.comment-bubble strong{display:block;color:#765363;margin-bottom:3px}.comment-bubble p{margin:0;white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.6}.comment-meta{display:flex;justify-content:space-between;align-items:center;color:#9b8b92;font-size:11px;margin-top:5px}.comment-form{display:flex;gap:8px;margin-top:9px}.comment-form input{flex:1;min-width:0;border:1px solid #f0e1e7;border-radius:12px;padding:10px;background:#fff}.comment-form button{border:0;border-radius:12px;background:#d9537d;color:#fff;width:42px;display:grid;place-items:center}.room-empty{text-align:center;padding:26px 14px;color:#907f87;background:#fff;border:1px dashed #ecd4dd;border-radius:18px}.feed-title{display:flex;align-items:center;justify-content:space-between;margin:19px 2px 12px}.feed-title h2{font-size:17px;margin:0;color:#553f49}.feed-title span{font-size:12px;color:#9b8b92}@media(max-width:520px){.room-banner{padding:18px}.room-banner h1{font-size:23px}.composer{padding:14px}.post-header{padding:13px 13px 7px}.post-content{margin-right:14px;margin-left:14px}.post-actions .room-action{font-size:12px;padding:8px 5px}}
        @media(max-width:620px){.swing-welcome-cards{grid-template-columns:1fr 1fr;gap:9px}.swing-welcome-card-label{font-size:9px;padding:5px 6px}}
        `}</style>
      <div className="swing-welcome-heading"><strong>مساحاتكِ الجديدة</strong><span>ابدئي من هنا</span></div>
      <div className="swing-welcome-cards" aria-label="كروت ترحيب الأرجوحة">
        <button type="button" className="swing-welcome-card" onClick={() => navigate('/swing-forum?section=PassionsCrafts')} aria-label="فتح حملة ترحيب في تدريب شغف وحرف">
          <img src="/swing-welcome-passions.png" alt="حملة ترحيب في تدريب شغف وحرف" loading="eager" /><span className="swing-welcome-card-label">شغف وحرف ←</span>
        </button>
        <button type="button" className="swing-welcome-card" onClick={() => navigate('/swing-forum?section=EmpowermentPaths')} aria-label="فتح نفس الأحلام — دروب التمكين">
          <img src="/swing-welcome-empowerment.png" alt="نفس الأحلام — دروب التمكين" loading="eager" /><span className="swing-welcome-card-label">دروب التمكين ←</span>
        </button>
        <button type="button" className="swing-welcome-card" onClick={() => navigate('/swing-forum?section=LittleOnesAcademy')} aria-label="فتح أكاديمية الصغار">
          <img src="/swing-welcome-little-ones.png" alt="أكاديمية الصغار" loading="eager" /><span className="swing-welcome-card-label">أكاديمية الصغار ←</span>
        </button>
      </div>
      <PrivateAssistantWidget topic="community" title="استشيري مساعد رِقّة" />
      <PublishedPageContent pageNames={['الأرجوحة', 'bouh-display-1', 'bouh-display']} title="منشورات الأرجوحة من الإدارة" />
      <form className="composer" onSubmit={publish}>
        <div className="composer-head"><span className="room-avatar">{userName.slice(0, 1)}</span><div><strong>{user ? userName : 'زائرة رِقّة'}</strong><small>{user ? 'اكتبي ما تحبين مشاركته' : 'التصفح متاح للجميع، والنشر والتفاعل يتطلبان تسجيل الدخول'}</small></div></div>
        <textarea value={content} onChange={(event) => setContent(event.target.value)} placeholder="ماذا يدور في خاطركِ؟" maxLength={5000} />
        <input className="room-link-input" type="url" inputMode="url" dir="ltr" placeholder="رابط صورة أو فيديو أو YouTube (اختياري)" value={mediaUrl} onChange={(event) => { setMediaUrl(event.target.value); setMediaType(''); }} />
        {mediaUrl && <div className="media-preview"><button className="media-remove" type="button" onClick={() => { setMediaUrl(''); setMediaType(''); }} aria-label="إزالة المرفق"><X size={17} /></button><MediaView url={mediaUrl} type={getMediaType(mediaUrl, mediaType)} /></div>}
        <div className="composer-tools"><label className="upload-label"><ImagePlus size={17} />{uploading ? 'جارٍ رفع الملف…' : 'رفع صورة أو فيديو'}<input ref={fileRef} type="file" accept="image/*,video/*" onChange={handleUpload} disabled={uploading} hidden /></label><button className="publish-button" type="submit" disabled={publishing || uploading}>{publishing ? 'جارٍ النشر…' : 'نشر المشاركة'}</button></div>
        {!user && <div className="room-message error" role="status">سجّلي الدخول للنشر، أو للتفاعل وإضافة التعليقات.</div>}
      </form>
      {error && <div className="room-message error" role="alert">{error}</div>}{notice && <div className="room-message success" role="status">{notice}</div>}
      <div className="feed-title"><h2>حديث المجتمع</h2><button className="refresh-button" type="button" onClick={loadPosts}><RefreshCw size={15} /> تحديث</button></div>
      {loading ? <div className="room-empty">جارٍ تحميل المشاركات…</div> : posts.length === 0 ? <div className="room-empty">لا توجد مشاركات بعد. كوني أول من يبدأ الحديث.</div> : posts.map((post) => {
        const media = getMediaUrl(post);
        const reactions = post.reactions || {};
        const heartCount = post.heart_count ?? post.hearts_count ?? reactions.heart ?? (Array.isArray(post.reactions) ? post.reactions.filter((item) => item.reaction_type === 'heart').length : 0);
        const starCount = post.star_count ?? post.stars_count ?? reactions.star ?? (Array.isArray(post.reactions) ? post.reactions.filter((item) => item.reaction_type === 'star').length : 0);
        const comments = commentsByPost[post.id] || [];
        return <article className="post-card" id={`post-${post.id}`} key={post.id}>
          <div className="post-header"><span className="post-avatar">{post.author_photo_url || post.photo_url ? <img className="post-avatar" src={post.author_photo_url || post.photo_url} alt="" /> : getAuthor(post).slice(0, 1)}</span><div className="post-author"><strong>{getAuthor(post)}</strong><time>{getTime(post.created_at || post.createdAt || post.published_at)}</time></div></div>
          {post.content && <p className="post-content">{post.content}</p>}
          {media && <div className="post-media"><MediaView url={media} type={post.media_type} /></div>}
          <div className="post-actions"><button type="button" className="room-action reaction-heart" onClick={() => updateReaction(post.id, 'heart')} disabled={busy[`post-${post.id}-heart`]}><Heart size={17} /> أحببت {heartCount ? `(${heartCount})` : ''}</button><button type="button" className="room-action reaction-star" onClick={() => updateReaction(post.id, 'star')} disabled={busy[`post-${post.id}-star`]}><Star size={17} /> مميزة {starCount ? `(${starCount})` : ''}</button><button type="button" className="room-action" onClick={() => toggleComments(post.id)}><MessageCircle size={17} /> التعليقات {post.comment_count ? `(${post.comment_count})` : ''}</button><button type="button" className="room-action" onClick={() => sharePost(post)}><Share2 size={17} /> مشاركة</button></div>
          {expandedComments[post.id] && <section className="comment-area" aria-label="تعليقات المنشور">{comments.length ? comments.map((comment) => <div className="comment-item" key={comment.id}><span className="room-avatar" style={{ width: 32, height: 32, borderRadius: 11, fontSize: 14 }}>{(comment.author_name || comment.display_name || comment.user_name || 'ر').slice(0, 1)}</span><div className="comment-bubble"><strong>{comment.author_name || comment.display_name || comment.user_name || 'عضوة في رِقّة'}</strong><p>{comment.content || comment.body}</p><div className="comment-meta"><time>{getTime(comment.created_at || comment.createdAt)}</time><button type="button" className="room-action reaction-heart" onClick={() => reactToComment(comment.id)}><Heart size={14} /> {comment.heart_count || comment.reactions_count || ''}</button></div></div></div>) : <div className="subtle">لا توجد تعليقات بعد.</div>}
            <form className="comment-form" onSubmit={(event) => addComment(event, post.id)}><input value={commentDrafts[post.id] || ''} onChange={(event) => setCommentDrafts((current) => ({ ...current, [post.id]: event.target.value }))} placeholder={user ? 'أضيفي تعليقًا لطيفًا…' : 'سجّلي الدخول لإضافة تعليق'} maxLength={2000} /><button type="submit" aria-label="إرسال التعليق" disabled={busy[`comment-${post.id}`]}><Send size={16} /></button></form>
          </section>}
        </article>;
      })}
    </div>
  );
}
