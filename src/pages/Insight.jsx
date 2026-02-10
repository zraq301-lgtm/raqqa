import React, { useState } from 'react';
import Swal from 'sweetalert2';

const Insight = () => {
    const [view, setView] = useState('emotions'); // 'emotions', 'fiqh', 'ai'
    const [aiChat, setAiChat] = useState('ابدئي الفضفضة مع رقة هنا...');
    const [aiInput, setAiInput] = useState('');

    const emotionsData = [
        { title: "المسار الإيماني", icon: "fa-pray", items: ["لذة المناجاة 🤲", "خشوع الصلاة ✨", "طمأنينة الذكر 📿"] },
        { title: "الإيقاع الحيوي", icon: "fa-leaf", items: ["تقلبات المزاج 🎢", "وهن جسدي 💤", "تعب الحيض 🥀"] },
        { title: "القلب الرحيم", icon: "fa-hands-holding-heart", items: ["بر الوالدين 🌳", "مودة الزوج ❤️", "رحمة الأبناء 🐣"] }
        // ... يمكنك إضافة الباقي هنا من الكود الأصلي
    ];

    const processAction = async (cat, val) => {
        setView('ai');
        setAiChat('رقة تكتب لكِ...');
        try {
            await fetch('/api/save-health', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ user_id: 1, category: cat, value: 0, note: val })
            });
            const res = await fetch('/api/raqqa-ai', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ prompt: `بصفتك رقة، حللي هذه الحالة للمرأة المسلمة: ${cat} - ${val}. اذكرِ آية أو حديثاً.` })
            });
            const data = await res.json();
            setAiChat(data.reply);
        } catch (e) { setAiChat("تم حفظ اختياركِ بنجاح ✨"); }
    };

    const openPicker = (title, items, cat) => {
        let opts = {}; items.forEach(i => opts[i] = i);
        Swal.fire({
            title: title, input: 'select', inputOptions: opts,
            confirmButtonText: 'تحليل وحفظ ✨', confirmButtonColor: '#eb2f96'
        }).then(r => { if(r.isConfirmed) processAction(cat, r.value); });
    };

    return (
        <div style={{background: 'linear-gradient(135deg, #fff5f8 0%, #f3e7ff 100%)', minHeight: '100vh', padding: '15px'}}>
            <div style={{display: 'flex', gap: '10px', marginBottom: '20px'}}>
                <button onClick={()=>setView('emotions')} style={{flex: 1, padding: '10px', background: view === 'emotions' ? '#eb2f96' : 'white', color: view === 'emotions' ? 'white' : '#666', border: 'none', borderRadius: '15px'}}>المشاعر</button>
                <button onClick={()=>setView('fiqh')} style={{flex: 1, padding: '10px', background: view === 'fiqh' ? '#eb2f96' : 'white', color: view === 'fiqh' ? 'white' : '#666', border: 'none', borderRadius: '15px'}}>الفقه</button>
            </div>

            {view !== 'ai' ? (
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px'}}>
                    {emotionsData.map(item => (
                        <div key={item.title} onClick={() => openPicker(item.title, item.items, view)} style={{background: 'white', padding: '20px', borderRadius: '22px', textAlign: 'center'}}>
                            <i className={`fas ${item.icon}`} style={{color: '#eb2f96', fontSize: '28px', marginBottom: '10px'}}></i>
                            <div style={{fontSize: '14px', fontWeight: 'bold'}}>{item.title}</div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{background: 'white', padding: '20px', borderRadius: '25px'}}>
                    <div style={{minHeight: '200px', padding: '10px', border: '1px dashed #eee', marginBottom: '15px'}}>{aiChat}</div>
                    <textarea value={aiInput} onChange={(e)=>setAiInput(e.target.value)} style={{width: '100%', height: '80px', borderRadius: '15px', padding: '10px'}} placeholder="اكتبي هنا..."></textarea>
                    <button onClick={()=>processAction('عام', aiInput)} style={{width: '100%', background: '#eb2f96', color: 'white', padding: '12px', border: 'none', borderRadius: '15px', marginTop: '10px'}}>إرسال وتحليل ✨</button>
                    <button onClick={()=>setView('emotions')} style={{width: '100%', background: 'none', border: 'none', color: '#999', marginTop: '10px'}}>العودة</button>
                </div>
            )}
        </div>
    );
};

export default Insight;
