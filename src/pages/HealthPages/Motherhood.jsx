<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>لوحة الأمومة الذكية - رقة</title>
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <script src="https://unpkg.com/@capacitor/core@latest/dist/capacitor.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <style>
        :root {
            --glass-bg: rgba(255, 255, 255, 0.25);
            --glass-border: rgba(255, 255, 255, 0.4);
            --primary-pink: #ff85a2;
            --accent-purple: #6a5acd;
        }

        body {
            margin: 0; padding: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #fce4ec 0%, #e1f5fe 100%);
            min-height: 100vh;
            display: flex; justify-content: center; align-items: flex-start;
            overflow-x: hidden;
        }

        #root { width: 100%; max-width: 1200px; padding: 20px; }

        /* Glassmorphism Classes */
        .glass-panel {
            background: var(--glass-bg);
            backdrop-filter: blur(15px);
            -webkit-backdrop-filter: blur(15px);
            border: 1px solid var(--glass-border);
            border-radius: 30px;
            padding: 20px;
            box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.1);
        }

        /* Horizontal Nav */
        .nav-scroll {
            display: flex; overflow-x: auto; gap: 15px; padding-bottom: 15px;
            scrollbar-width: none;
        }
        .nav-scroll::-webkit-scrollbar { display: none; }

        .nav-item {
            flex: 0 0 auto; width: 75px; height: 75px;
            background: rgba(255, 255, 255, 0.4);
            border-radius: 20px; display: flex; flex-direction: column;
            align-items: center; justify-content: center; cursor: pointer;
            transition: 0.3s; border: 1px solid var(--glass-border);
        }
        .nav-item.active { background: var(--primary-pink); color: white !important; }
        .nav-item i { font-size: 1.4rem; margin-bottom: 5px; color: var(--accent-purple); }
        .nav-item.active i { color: white; }
        .nav-item span { font-size: 0.65rem; font-weight: bold; }

        /* Main Card */
        .main-card {
            background: rgba(255, 255, 255, 0.5);
            border-radius: 25px; padding: 25px; margin-top: 20px;
            animation: fadeIn 0.4s ease-out;
        }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        .checklist-grid {
            display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px;
        }
        .check-item {
            background: white; padding: 15px; border-radius: 15px;
            display: flex; align-items: center; cursor: pointer; transition: 0.2s;
        }
        .check-item:hover { transform: scale(1.02); }
        .check-item input { margin-left: 12px; width: 18px; height: 18px; accent-color: var(--primary-pink); }
        .completed { text-decoration: line-through; color: #aaa; }

        /* Chat Modal */
        .chat-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.3); backdrop-filter: blur(8px);
            z-index: 1000; display: flex; justify-content: center; align-items: center;
        }
        .chat-window {
            width: 90%; max-width: 500px; height: 80vh;
            background: white; border-radius: 25px; display: flex; flex-direction: column;
            overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.2);
        }
        .chat-header { background: var(--accent-purple); color: white; padding: 15px; display: flex; justify-content: space-between; }
        .chat-messages { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 10px; }
        .msg { padding: 12px; border-radius: 15px; max-width: 85%; position: relative; }
        .msg-ai { background: #f0f0f0; align-self: flex-start; }
        .msg-user { background: var(--primary-pink); color: white; align-self: flex-end; }
        .btn-delete { background: none; border: none; color: red; cursor: pointer; font-size: 0.8rem; margin-top: 5px; }

        .chat-input-area { padding: 15px; border-top: 1px solid #eee; background: #fafafa; }
        .chat-tools { display: flex; gap: 10px; margin-bottom: 10px; }
        .tool-btn { background: #eee; border: none; width: 35px; height: 35px; border-radius: 50%; cursor: pointer; }
    </style>
</head>
<body>
    <div id="root"></div>

    <script type="text/babel">
        const { useState } = React;
        const { CapacitorHttp } = Capacitor; // استخدام المحرك من Capacitor مباشرة

        const App = () => {
            const [selectedList, setSelectedList] = useState(0);
            const [checkedState, setCheckedState] = useState({});
            const [isChatOpen, setIsChatOpen] = useState(false);
            const [messages, setMessages] = useState([]);
            const [inputText, setInputText] = useState("");
            const [loading, setLoading] = useState(false);

            const data = [
                { id: 0, title: "السلوك", icon: "fa-child", items: ["التعزيز الإيجابي", "تجاهل المزعج", "عواقب منطقية", "حدود واضحة", "لوحة النجوم", "النمذجة", "وقت خاص", "استماع فعال", "بدائل لـ لا", "بيئة آمنة"] },
                { id: 1, title: "القناعات", icon: "fa-heart", items: ["الصدق", "الثقة بالقدرات", "احترام الآخر", "المشاركة", "الامتنان", "المثابرة", "حب التعلم", "المسؤولية", "الأمانة", "الرحمة"] },
                { id: 2, title: "الذكاء", icon: "fa-brain", items: ["تسمية المشاعر", "التعاطف", "تنفس الهدوء", "الاعتراف بالمشاعر", "حل النزاعات", "الثقة بالذات", "تجاوز الخوف", "لغة الجسد", "تحمل الإحباط", "التفاؤل"] },
                { id: 3, title: "المعرفة", icon: "fa-book-open", items: ["قراءة يومية", "ألعاب ذكاء", "تجارب علمية", "لغة ثانية", "زيارة متاحف", "حساب ذهني", "نقاش مفتوح", "ثقافات عالمية", "تكنولوجيا", "هوايات"] },
                { id: 4, title: "الصحة", icon: "fa-apple-whole", items: ["غذاء متوازن", "نوم منتظم", "شرب الماء", "رياضة", "نظافة", "فحص دوري", "منع السكريات", "هواء طلق", "حركة كبرى", "سلامة جسدية"] },
                { id: 5, title: "الاجتماع", icon: "fa-users", items: ["آداب التحية", "مشاركة", "آداب مائدة", "صداقات", "اعتذار", "استماع", "استئذان", "تعاون", "قيادة", "رأي حر"] },
                { id: 6, title: "الاستقلال", icon: "fa-star", items: ["لبس ملابس", "ترتيب سرير", "تجهيز وجبة", "قرار بسيط", "إدارة مصروف", "جدول يومي", "حل مشاكل", "عناية نبات", "تحمل نتيجة", "إسعافات"] },
                { id: 7, title: "الأم", icon: "fa-spa", items: ["وقت هدوء", "هواية", "طلب دعم", "تخطي الذنب", "نوم عميق", "قراءة", "تأمل", "أولويات", "احتفال", "تواصل"] },
                { id: 8, title: "الأمان", icon: "fa-shield-halved", items: ["لمسات الأمان", "طوارئ", "أمان منزلي", "أمان رقمي", "قواعد طريق", "غرباء", "عنوان منزل", "صدق تام", "مواجهة تنمر", "قواعد مسبح"] },
                { id: 9, title: "الإبداع", icon: "fa-palette", items: ["خيال", "لعب حر", "رسم", "إعادة تدوير", "تمثيل", "تأليف", "مكعبات", "طبيعة", "فنون", "ابتكار"] }
            ];

            const handleAction = async (category, value) => {
                try {
                    const options = {
                        url: 'https://raqqa-v6cd.vercel.app/api/save-notifications',
                        headers: { 'Content-Type': 'application/json' },
                        data: { user_id: 1, category, value }
                    };
                    await CapacitorHttp.post(options);
                } catch (e) { console.error("Save Error:", e); }
            };

            const toggleCheck = (listId, itemIndex, itemName) => {
                const key = `${listId}-${itemIndex}`;
                const isChecking = !checkedState[key];
                setCheckedState(prev => ({ ...prev, [key]: isChecking }));
                if(isChecking) handleAction(data[listId].title, itemName);
            };

            const askAI = async (customText = null) => {
                setLoading(true);
                setIsChatOpen(true);
                const summary = customText || `أنا أنثى مسلمة، قمت بمتابعة بنود في قسم ${data[selectedList].title}. أريد نصيحة تربوية تخصصية مطولة.`;
                
                try {
                    const options = {
                        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
                        headers: { 'Content-Type': 'application/json' },
                        data: { prompt: summary }
                    };
                    const response = await CapacitorHttp.post(options);
                    const reply = response.data.reply || "حدث خطأ في استلام الرد.";
                    setMessages(prev => [...prev, { id: Date.now(), text: reply, sender: 'ai' }]);
                } catch (err) {
                    setMessages(prev => [...prev, { id: Date.now(), text: "خطأ في الاتصال بالذكاء الاصطناعي.", sender: 'ai' }]);
                } finally { setLoading(false); }
            };

            return (
                <div>
                    <header style={{ textAlign: 'center', marginBottom: '25px' }}>
                        <h1 style={{ color: 'var(--accent-purple)' }}>مُفكرتي الواعية</h1>
                        <button onClick={() => askAI()} style={{
                            background: 'var(--accent-purple)', color: 'white', border: 'none', 
                            padding: '12px 25px', borderRadius: '15px', cursor: 'pointer', fontWeight: 'bold'
                        }}>
                            <i className="fas fa-robot"></i> متخصص التربية
                        </button>
                    </header>

                    <div className="glass-panel">
                        <div className="nav-scroll">
                            {data.map((cat, idx) => (
                                <div key={cat.id} 
                                     className={`nav-item ${selectedList === idx ? 'active' : ''}`}
                                     onClick={() => setSelectedList(idx)}>
                                    <i className={`fas ${cat.icon}`}></i>
                                    <span>{cat.title}</span>
                                </div>
                            ))}
                        </div>

                        <div className="main-card">
                            <h2 style={{ color: 'var(--accent-purple)' }}>
                                <i className={`fas ${data[selectedList].icon}`}></i> {data[selectedList].title}
                            </h2>
                            <div className="checklist-grid">
                                {data[selectedList].items.map((item, i) => (
                                    <label key={i} className="check-item">
                                        <input type="checkbox" 
                                               checked={!!checkedState[`${selectedList}-${i}`]} 
                                               onChange={() => toggleCheck(selectedList, i, item)} />
                                        <span className={checkedState[`${selectedList}-${i}`] ? 'completed' : ''}>{item}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {isChatOpen && (
                        <div className="chat-overlay">
                            <div className="chat-window">
                                <div className="chat-header">
                                    <span>طبيبة التربية - رقة</span>
                                    <button onClick={() => setIsChatOpen(false)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                                </div>
                                <div className="chat-messages">
                                    {messages.map(m => (
                                        <div key={m.id} className={`msg ${m.sender === 'ai' ? 'msg-ai' : 'msg-user'}`}>
                                            {m.text}
                                            <div style={{ textAlign: 'left' }}>
                                                <button className="btn-delete" onClick={() => setMessages(prev => prev.filter(x => x.id !== m.id))}>حذف</button>
                                            </div>
                                        </div>
                                    ))}
                                    {loading && <div style={{ color: '#6a5acd', fontStyle: 'italic' }}>جاري التفكير... ✨</div>}
                                </div>
                                <div className="chat-input-area">
                                    <div className="chat-tools">
                                        <button className="tool-btn" title="كاميرا"><i className="fas fa-camera"></i></button>
                                        <button className="tool-btn" title="ميكروفون"><i className="fas fa-microphone"></i></button>
                                        <button className="tool-btn" title="صورة"><i className="fas fa-image"></i></button>
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <input style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #ddd' }} 
                                               placeholder="اكتبي سؤالك هنا..."
                                               value={inputText}
                                               onChange={(e) => setInputText(e.target.value)} />
                                        <button onClick={() => { if(inputText) { setMessages([...messages, {id: Date.now(), text: inputText, sender: 'user'}]); askAI(inputText); setInputText(""); } }}
                                                style={{ background: 'var(--accent-purple)', color: 'white', border: 'none', padding: '0 20px', borderRadius: '12px', cursor: 'pointer' }}>
                                            إرسال
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            );
        };

        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(<App />);
    </script>
</body>
</html>
