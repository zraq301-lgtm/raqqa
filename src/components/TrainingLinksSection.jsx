import React, { useEffect, useState } from 'react';
import { ExternalLink, GraduationCap } from 'lucide-react';
import { fetchTrainings } from '../services/adminService';

export default function TrainingLinksSection({ section }) {
  const [items, setItems] = useState([]);
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    let mounted = true;
    fetchTrainings(section).then((result) => mounted && setItems(result)).catch((error) => console.warn('[TrainingLinks] تعذر تحميل التدريبات:', error?.message || error));
    return () => { mounted = false; };
  }, [section]);

  if (!items.length) return null;
  return <section className="training-links-section" dir="rtl" aria-label={`المساحة التدريبية في ${section}`}>
    <div className="training-links-heading"><div className="training-links-icon"><GraduationCap size={23} /></div><div><span>مساحة تدريبية</span><h2>تعلّمي بخطوات عملية</h2></div></div>
    <div className="training-links-list">
      {items.map((training) => <article className="training-link-card" key={training.id}>
        {training.thumbnailUrl && <img src={training.thumbnailUrl} alt="" loading="lazy" />}
        <div className="training-link-copy"><h3>{training.title}</h3>{training.description && <p>{training.description}</p>}
          <div className="training-link-actions"><button type="button" onClick={() => setOpenId((current) => current === training.id ? null : training.id)}>{openId === training.id ? 'إغلاق التدريب' : 'ابدئي التدريب'}</button><a href={training.url} target="_blank" rel="noopener noreferrer"><ExternalLink size={15} /> فتح خارجي</a></div>
        </div>
        {openId === training.id && <div className="training-link-frame-wrap"><iframe src={training.url} title={training.title} loading="lazy" allow="fullscreen; autoplay" /></div>}
      </article>)}
    </div>
    <style>{`.training-links-section{width:min(100%,620px);margin:8px auto 28px;padding:18px;border:1px solid #efd6e2;border-radius:24px;background:linear-gradient(145deg,#fff,#fff7fb);box-shadow:0 10px 26px rgba(123,49,87,.09);font-family:'Tajawal',sans-serif}.training-links-heading{display:flex;align-items:center;gap:11px;margin-bottom:14px}.training-links-icon{display:grid;place-items:center;width:44px;height:44px;border-radius:15px;background:#fceaf2;color:#b12a68}.training-links-heading span{color:#b12a68;font-size:11px;font-weight:900}.training-links-heading h2{margin:2px 0 0;color:#442235;font-size:19px}.training-links-list{display:grid;gap:12px}.training-link-card{overflow:hidden;border:1px solid #f0dde5;border-radius:17px;background:#fff}.training-link-card>img{width:100%;max-height:180px;object-fit:cover;display:block}.training-link-copy{padding:13px}.training-link-copy h3{margin:0 0 5px;color:#54283f;font-size:16px}.training-link-copy p{margin:0;color:#76616d;font-size:12px;line-height:1.8;white-space:pre-line}.training-link-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:11px}.training-link-actions button,.training-link-actions a{display:inline-flex;align-items:center;gap:6px;border:0;border-radius:11px;padding:9px 12px;background:#b12a68;color:#fff;font:inherit;font-size:12px;font-weight:800;text-decoration:none;cursor:pointer}.training-link-actions a{background:#fceaf2;color:#9f245d}.training-link-frame-wrap{padding:0 12px 12px}.training-link-frame-wrap iframe{width:100%;height:min(65vh,620px);min-height:420px;border:1px solid #edd6e2;border-radius:13px;background:#fff}`}</style>
  </section>;
}
