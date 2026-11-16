import React, { useCallback, useEffect, useState } from 'react';
import { Eye, EyeOff, MessageSquare, Pencil, RefreshCw, Save, ShieldCheck, Trash2, X } from 'lucide-react';
import AdminTokenField from '../components/AdminTokenField';
import { deleteCommunityComment, deleteCommunityPost, listCommunityComments, listCommunityPosts, updateCommunityComment, updateCommunityPost } from '../services/adminService';

const timeLabel = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : new Intl.DateTimeFormat('ar', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
};
const hiddenItem = (item) => item?.status === 'hidden' || item?.status === 'deleted' || Boolean(item.is_hidden ?? item.hidden ?? item.isHidden);
const statusLabel = (item) => item?.status === 'deleted' ? 'محذوف' : hiddenItem(item) ? 'مخفي' : '';

export default function CommunityModeration() {
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState('');
  const [editing, setEditing] = useState(null);
  const [postDraft, setPostDraft] = useState({ content: '', media_url: '', media_type: '' });
  const [commentDraft, setCommentDraft] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true); setError(''); setMessage('');
    try {
      const [nextPosts, nextComments] = await Promise.all([listCommunityPosts(), listCommunityComments()]);
      setPosts(nextPosts); setComments(nextComments);
    } catch (err) { setError(err.message || 'تعذر جلب بيانات المجتمع. تحققي من رمز الإدارة.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { refresh(); }, [refresh]);
  useEffect(() => {
    const onTokenSaved = () => refresh();
    window.addEventListener('raqqa-admin-token-saved', onTokenSaved);
    return () => window.removeEventListener('raqqa-admin-token-saved', onTokenSaved);
  }, [refresh]);

  const beginPostEdit = (post) => {
    setEditing({ type: 'post', id: post.id });
    setPostDraft({ content: post.content || '', media_url: post.media_url || '', media_type: post.media_type || '' });
  };
  const beginCommentEdit = (comment) => { setEditing({ type: 'comment', id: comment.id }); setCommentDraft(comment.content || comment.body || ''); };
  const savePost = async (post) => {
    setBusy(`post-${post.id}`); setError('');
    try {
      await updateCommunityPost(post.id, { content: postDraft.content, media_url: postDraft.media_url, media_type: postDraft.media_type });
      setEditing(null); await refresh(); setMessage('تم تحديث المنشور.');
    } catch (err) { setError(err.message || 'تعذر تعديل المنشور.'); }
    finally { setBusy(''); }
  };
  const saveComment = async (comment) => {
    setBusy(`comment-${comment.id}`); setError('');
    try {
      await updateCommunityComment(comment.id, { content: commentDraft });
      setEditing(null); await refresh(); setMessage('تم تحديث التعليق.');
    } catch (err) { setError(err.message || 'تعذر تعديل التعليق.'); }
    finally { setBusy(''); }
  };
  const togglePostHidden = async (post) => {
    const nextHidden = !hiddenItem(post);
    setBusy(`post-${post.id}`); setError('');
    try {
      await updateCommunityPost(post.id, { status: nextHidden ? 'hidden' : 'published' });
      await refresh(); setMessage(nextHidden ? 'تم إخفاء المنشور عن المجتمع.' : 'أُعيد إظهار المنشور.');
    } catch (err) { setError(err.message || 'تعذر تغيير حالة إظهار المنشور.'); }
    finally { setBusy(''); }
  };
  const toggleCommentHidden = async (comment) => {
    const nextHidden = !hiddenItem(comment);
    setBusy(`comment-${comment.id}`); setError('');
    try {
      await updateCommunityComment(comment.id, { status: nextHidden ? 'hidden' : 'published' });
      await refresh(); setMessage(nextHidden ? 'تم إخفاء التعليق.' : 'أُعيد إظهار التعليق.');
    } catch (err) { setError(err.message || 'تعذر تغيير حالة إظهار التعليق.'); }
    finally { setBusy(''); }
  };
  const removePost = async (post) => {
    if (!window.confirm('هل أنتِ متأكدة من حذف هذا المنشور؟')) return;
    setBusy(`post-${post.id}`); setError('');
    try { await deleteCommunityPost(post.id); await refresh(); setMessage('تم حذف المنشور.'); }
    catch (err) { setError(err.message || 'تعذر حذف المنشور.'); }
    finally { setBusy(''); }
  };
  const removeComment = async (comment) => {
    if (!window.confirm('هل أنتِ متأكدة من حذف هذا التعليق؟')) return;
    setBusy(`comment-${comment.id}`); setError('');
    try { await deleteCommunityComment(comment.id); await refresh(); setMessage('تم حذف التعليق.'); }
    catch (err) { setError(err.message || 'تعذر حذف التعليق.'); }
    finally { setBusy(''); }
  };

  return <div className="admin-page community-moderation" dir="rtl">
    <style>{`.community-moderation .moderation-heading{display:flex;align-items:flex-start;gap:12px}.community-moderation .moderation-icon{display:grid;place-items:center;width:45px;height:45px;border-radius:15px;color:#bd3e69;background:#fff0f4;flex:none}.community-moderation .moderation-tools{display:flex;gap:9px;align-items:center;flex-wrap:wrap;margin:12px 0 16px}.community-moderation .moderation-count{font-size:12px;color:#887d82;background:#fff7fa;border-radius:99px;padding:6px 10px}.community-moderation .moderation-section{margin:18px 0 8px;display:flex;align-items:center;justify-content:space-between}.community-moderation .moderation-section h3{margin:0}.community-moderation .moderation-card{background:#fff;border:1px solid #f2dce4;border-radius:18px;padding:17px;margin:10px 0;box-shadow:0 8px 24px #742d4508}.community-moderation .moderation-card.is-hidden{opacity:.7;border-style:dashed}.community-moderation .moderation-card-head{display:flex;align-items:flex-start;gap:10px}.community-moderation .moderation-card-head>div:first-child{flex:1;min-width:0}.community-moderation .moderation-card-head strong{display:block;overflow-wrap:anywhere}.community-moderation .moderation-meta{display:flex;gap:8px;align-items:center;flex-wrap:wrap;color:#887d82;font-size:12px;margin:5px 0 10px}.community-moderation .hidden-chip{background:#fff0f0;color:#a73347;border-radius:99px;padding:3px 8px}.community-moderation .moderation-content{white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.7;margin:8px 0}.community-moderation .moderation-url{display:block;overflow-wrap:anywhere;font-size:12px;color:#a33d65;text-decoration:none;direction:ltr;text-align:right}.community-moderation .moderation-actions{display:flex;gap:7px;flex-wrap:wrap;margin-top:12px}.community-moderation .moderation-actions .secondary-button,.community-moderation .moderation-actions .danger-button{display:inline-flex;align-items:center;gap:6px;padding:9px 12px}.community-moderation .moderation-edit{display:grid;gap:10px;margin-top:12px}.community-moderation .moderation-edit .field{margin:0}.community-moderation .moderation-edit-actions{display:flex;gap:8px}.community-moderation .moderation-edit-actions button{display:inline-flex;align-items:center;gap:6px}.community-moderation .post-context{background:#fff8fa;border-right:3px solid #eaa4b9;padding:8px 10px;border-radius:9px;font-size:12px;color:#786771;margin:7px 0 0}.community-moderation .moderation-refresh{display:inline-flex;align-items:center;gap:7px}.community-moderation .moderation-empty{padding:18px;border-radius:14px;background:#fff8fa;color:#887d82;text-align:center}`}</style>
    <header className="admin-intro moderation-heading"><span className="moderation-icon"><ShieldCheck size={25} /></span><div><h2>الإشراف على المجتمع</h2><p>راجعي منشورات غرفة الأرجوحة وتعليقاتها، وعدّليها أو أخفيها أو احذفيها.</p></div></header>
    <AdminTokenField title="رمز صلاحية الإشراف" />
    <div className="moderation-tools"><button type="button" className="secondary-button moderation-refresh" onClick={refresh} disabled={loading}><RefreshCw size={16} />{loading ? 'جارٍ التحديث…' : 'تحديث البيانات'}</button><span className="moderation-count">{posts.length} منشور</span><span className="moderation-count">{comments.length} تعليق</span></div>
    {error && <div className="notice error" role="alert">{error}</div>}{message && <div className="notice success" role="status">{message}</div>}
    {loading ? <div className="moderation-empty">جارٍ تحميل المنشورات والتعليقات…</div> : <>
      <div className="moderation-section"><h3>المنشورات</h3><span className="moderation-count">{posts.length}</span></div>
      {posts.length === 0 ? <div className="moderation-empty">لا توجد منشورات لعرضها.</div> : posts.map((post) => <article className={`moderation-card ${hiddenItem(post) ? 'is-hidden' : ''}`} key={post.id}>
        <div className="moderation-card-head"><div><strong>{post.author_name || post.display_name || post.user_name || post.author?.name || 'عضوة في رِقّة'}</strong><div className="moderation-meta"><time>{timeLabel(post.created_at || post.createdAt)}</time>{hiddenItem(post) && <span className="hidden-chip">{statusLabel(post)}</span>}<span>#{post.id}</span></div></div></div>
        {editing?.type === 'post' && String(editing.id) === String(post.id) ? <div className="moderation-edit"><label className="field"><span>نص المنشور</span><textarea rows="4" value={postDraft.content} onChange={(event) => setPostDraft((value) => ({ ...value, content: event.target.value }))} /></label><label className="field"><span>رابط الوسيط</span><input type="url" dir="ltr" value={postDraft.media_url} onChange={(event) => setPostDraft((value) => ({ ...value, media_url: event.target.value }))} /></label><label className="field"><span>نوع الوسيط</span><select value={postDraft.media_type} onChange={(event) => setPostDraft((value) => ({ ...value, media_type: event.target.value }))}><option value="">تلقائي</option><option value="image">صورة</option><option value="video">فيديو</option><option value="link">رابط</option></select></label><div className="moderation-edit-actions"><button type="button" className="primary-button" disabled={busy === `post-${post.id}`} onClick={() => savePost(post)}><Save size={15} />حفظ التعديل</button><button type="button" className="secondary-button" onClick={() => setEditing(null)}><X size={15} />إلغاء</button></div></div> : <><p className="moderation-content">{post.content || '—'}</p>{post.media_url && <a className="moderation-url" href={post.media_url} target="_blank" rel="noreferrer">{post.media_url}</a>}</>}
        <div className="moderation-actions"><button type="button" className="secondary-button" onClick={() => beginPostEdit(post)}><Pencil size={15} />تعديل</button><button type="button" className="secondary-button" disabled={busy === `post-${post.id}`} onClick={() => togglePostHidden(post)}>{hiddenItem(post) ? <Eye size={15} /> : <EyeOff size={15} />}{hiddenItem(post) ? 'إظهار' : 'إخفاء'}</button><button type="button" className="danger-button" disabled={busy === `post-${post.id}`} onClick={() => removePost(post)}><Trash2 size={15} />حذف</button></div>
      </article>)}
      <div className="moderation-section"><h3><MessageSquare size={18} style={{ verticalAlign: 'middle', marginLeft: 6 }} />التعليقات</h3><span className="moderation-count">{comments.length}</span></div>
      {comments.length === 0 ? <div className="moderation-empty">لا توجد تعليقات لعرضها.</div> : comments.map((comment) => <article className={`moderation-card ${hiddenItem(comment) ? 'is-hidden' : ''}`} key={comment.id}>
        <div className="moderation-card-head"><div><strong>{comment.author_name || comment.display_name || comment.user_name || 'عضوة في رِقّة'}</strong><div className="moderation-meta"><time>{timeLabel(comment.created_at || comment.createdAt)}</time>{hiddenItem(comment) && <span className="hidden-chip">{statusLabel(comment)}</span>}<span>#{comment.id}</span></div></div></div>
        {comment.post_content && <div className="post-context">على المنشور: {comment.post_content}</div>}
        {editing?.type === 'comment' && String(editing.id) === String(comment.id) ? <div className="moderation-edit"><label className="field"><span>نص التعليق</span><textarea rows="3" value={commentDraft} onChange={(event) => setCommentDraft(event.target.value)} /></label><div className="moderation-edit-actions"><button type="button" className="primary-button" disabled={busy === `comment-${comment.id}`} onClick={() => saveComment(comment)}><Save size={15} />حفظ التعديل</button><button type="button" className="secondary-button" onClick={() => setEditing(null)}><X size={15} />إلغاء</button></div></div> : <p className="moderation-content">{comment.content || comment.body || '—'}</p>}
        <div className="moderation-actions"><button type="button" className="secondary-button" onClick={() => beginCommentEdit(comment)}><Pencil size={15} />تعديل</button><button type="button" className="secondary-button" disabled={busy === `comment-${comment.id}`} onClick={() => toggleCommentHidden(comment)}>{hiddenItem(comment) ? <Eye size={15} /> : <EyeOff size={15} />}{hiddenItem(comment) ? 'إظهار' : 'إخفاء'}</button><button type="button" className="danger-button" disabled={busy === `comment-${comment.id}`} onClick={() => removeComment(comment)}><Trash2 size={15} />حذف</button></div>
      </article>)}
    </>}
  </div>;
}
