import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

const Swing = () => {
    const [posts, setPosts] = useState([]);
    const [postContent, setPostContent] = useState('');
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState([]);
    const [aiInput, setAiInput] = useState('');

    const loadPosts = async () => {
        try {
            const res = await fetch('/api/get-posts');
            const data = await res.json();
            setPosts(data.posts || []);
        } catch (e) { console.error(e); }
    };

    const handlePost = async () => {
        if (!postContent) return Swal.fire('تنبيه', 'اكتبي شيئاً أولاً', 'warning');
        Swal.showLoading();
        try {
            const res = await fetch('/api/save-post', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ content: postContent, section: 'منتدى الأرجوحة العامة', type: 'نصي' })
            });
            if (res.ok) {
                setPostContent('');
                Swal.fire('تم النشر', 'مشاركتكِ تزين المنتدى', 'success');
                loadPosts();
            }
        } catch (e) { Swal.fire('خطأ', 'تعذر النشر', 'error'); }
    };

    const sendToAI = async () => {
        if (!aiInput) return;
        const userMsg = { role: 'user', text: aiInput };
        setChatMessages(prev => [...prev, userMsg]);
        setAiInput('');
        try {
            const res = await fetch('/api/raqqa-ai', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ prompt: aiInput })
            });
            const data = await res.json();
            setChatMessages(prev => [...prev, { role: 'ai', text: data.reply }]);
        } catch (e) { setChatMessages(prev => [...prev, { role: 'ai', text: 'عذراً رفيقتي، أنا مشغولة حالياً.' }]); }
    };

    useEffect(() => { loadPosts(); }, []);

    return (
        <div style={{background: '#fdf6f9', minHeight: '100vh', paddingBottom: '80px'}}>
            <header style={{background: 'white', padding: '15px', position: 'sticky', top: 0, overflowX: 'auto', display: 'flex', gap: '15px'}}>
                {['مطبخ الزمرد', 'خزانة أيقونة', 'أكاديمية رقة', 'سوق الأرجوحة'].map(s => (
                    <div key={s} style={{textAlign: 'center', minWidth: '80px'}}>
                        <div style={{width: '45px', height: '45px', background: '#fdf6f9', borderRadius: '50%', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><i className="fas fa-star"></i></div>
                        <span style={{fontSize: '10px'}}>{s}</span>
                    </div>
                ))}
            </header>

            <div style={{padding: '15px'}}>
                <div style={{background: 'white', padding: '15px', borderRadius: '20px', marginBottom: '15px'}}>
                    <textarea value={postContent} onChange={(e)=>setPostContent(e.target.value)} placeholder="ماذا يدور في ذهنك؟" style={{width:'100%', border:'none', outline:'none', height:'60px'}}></textarea>
                    <button onClick={handlePost} style={{background: '#eb2f96', color: 'white', border: 'none', padding: '8px 25px', borderRadius: '20px', float: 'left'}}>نشر</button>
                    <div style={{clear:'both'}}></div>
                </div>

                {posts.map((p, i) => (
                    <div key={i} style={{background: 'white', padding: '15px', borderRadius: '20px', marginBottom: '15px', border: '1px solid #eee'}}>
                        <div style={{fontSize: '12px', color: '#999', marginBottom: '5px'}}>مشاركة في {p.section}</div>
                        <div style={{fontSize: '14px'}}>{p.content}</div>
                    </div>
                ))}
            </div>

            <div onClick={()=>setIsChatOpen(true)} style={{position: 'fixed', bottom: '100px', left: '20px', width: '60px', height: '60px', background: 'linear-gradient(135deg, #eb2f96, #8e44ad)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '25px', cursor: 'pointer'}}>
                <i className="fas fa-robot"></i>
            </div>

            {isChatOpen && (
                <div style={{position: 'fixed', inset: 0, background: 'white', z-index: 2000, display: 'flex', flexDirection: 'column'}}>
                    <div style={{padding: '15px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between'}}>
                        <i className="fas fa-times" onClick={()=>setIsChatOpen(false)}></i>
                        <span>رقة الذكية</span>
                        <i></i>
                    </div>
                    <div style={{flex: 1, overflowY: 'auto', padding: '20px', background: '#fdfbfd'}}>
                        {chatMessages.map((m, i) => (
                            <div key={i} style={{padding: '12px', borderRadius: '20px', maxWidth: '80%', marginBottom: '10px', background: m.role === 'user' ? '#f0f0f0' : '#eb2f96', color: m.role === 'user' ? 'black' : 'white', alignSelf: m.role === 'user' ? 'flex-start' : 'flex-end'}}>
                                {m.text}
                            </div>
                        ))}
                    </div>
                    <div style={{padding: '15px', display: 'flex', gap: '10px'}}>
                        <input value={aiInput} onChange={(e)=>setAiInput(e.target.value)} style={{flex: 1, padding: '12px', borderRadius: '25px', border: '1px solid #eee'}} placeholder="اسألي رقة..." />
                        <button onClick={sendToAI} style={{background: '#eb2f96', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '25px'}}>إرسال</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Swing;
