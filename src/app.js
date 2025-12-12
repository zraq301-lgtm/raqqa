/* app.js */

// ===================================================================
// 1. بيانات الاعتماد (Admin Credentials) وحل مشكلة استمرارية البيانات
// ===================================================================

const ADMIN_USERNAME = 'zazo';
const ADMIN_PASSWORD = 'zazo010988';
const STORAGE_KEY = 'app_content_db'; // مفتاح تخزين محتوى البوستات

// دالة محاكاة الاتصال بقاعدة البيانات (Neon/Vercel Postgres)
// تقوم هذه الدالة الآن بحفظ المحتوى في التخزين المحلي (localStorage)
function saveContentToDB(content) {
    let allContent = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    // إضافة المحتوى الجديد
    content.id = Date.now(); // لضمان معرف فريد لكل بوست
    allContent.push(content);
    // حفظ القائمة المحدثة
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allContent));
    return content.id;
}

// دالة جلب المحتوى عند تحميل الصفحة (حل مشكلة اختفاء المحتوى)
function fetchAndRenderAllContent() {
    console.log("Fetching and rendering content...");
    const allContent = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    
    // مسح المحتوى القديم (الافتراضي) وإعادة بناءه من البيانات المحفوظة
    document.getElementById('content-container-sec-feelings').innerHTML = '';
    document.getElementById('content-container-sec-fiqh').innerHTML = '';
    document.getElementById('content-container-sec-intimacy-new').innerHTML = '';
    document.getElementById('content-container-sec-society-new').innerHTML = '';
    document.getElementById('content-container-sec-health').innerHTML = '';

    allContent.forEach(content => {
        renderContent(content, false); // false: ليس محتوى جديداً (لا وميض)
    });
}


// ===================================================================
// 2. منطق إدارة المحتوى (Render, Upload, Delete)
// ===================================================================

function renderContent(content, isNew = true) {
    const containerId = `content-container-${content.section}`;
    const container = document.getElementById(containerId);
    
    if (!container) return;
    
    // إنشاء عنصر البطاقة
    const itemCard = document.createElement('div');
    itemCard.className = `content-item-card ${isNew ? 'newly-added' : ''}`;
    itemCard.id = `post-${content.id}`;

    // إضافة زر الحذف (يظهر فقط في وضع المشرف)
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-overlay-btn';
    deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
    deleteBtn.onclick = (e) => {
        e.stopPropagation(); // منع النقر على البطاقة بالكامل
        deletePost(content.id);
    };
    itemCard.appendChild(deleteBtn);

    // إضافة المحتوى
    itemCard.innerHTML += `
        <span class="type-badge" style="background:${content.type === 'البوح' ? '#ffe0f6' : '#e0f7fa'}; color:${content.type === 'البوح' ? '#e91e63' : '#00bcd4'};">${content.type}</span>
        <div class="post-content">${content.text}</div>
        <small>${new Date(content.timestamp).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</small>
    `;

    // إدراج العنصر في بداية الحاوية
    if (container.children.length === 0 || container.children[0].tagName === 'P') {
        container.innerHTML = '';
    }
    container.prepend(itemCard);

    // إزالة الوميض بعد فترة
    if (isNew) {
        setTimeout(() => {
            itemCard.classList.remove('newly-added');
        }, 5000);
    }
}

function deletePost(id) {
    if (!confirm('هل أنت متأكد من حذف هذا المحتوى بشكل دائم؟')) return;

    // 1. الحذف من الـ DOM
    const postElement = document.getElementById(`post-${id}`);
    if (postElement) {
        postElement.remove();
    }

    // 2. الحذف من قاعدة البيانات المحاكاة (localStorage)
    let allContent = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    allContent = allContent.filter(content => content.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allContent));

    alert('تم حذف المحتوى بنجاح!');
}


// ===================================================================
// 3. دالة متتبع العادات اليومية الجديدة (Habit Tracker)
// ===================================================================

/**
 * دالة تبديل حالة الإنجاز وحفظها في localStorage.
 * @param {string} id - المعرف الفريد للنشاط.
 */
function checkHabitCompletion(id) {
    const statusElement = document.querySelector(`.tracker-status-habit[data-id="${id}"]`);
    if (!statusElement) return;

    const isCompleted = statusElement.classList.contains('completed');
    
    if (isCompleted) {
        statusElement.classList.remove('completed');
        statusElement.innerHTML = ''; 
        localStorage.setItem('dailyHabitTracker-' + id, 'incomplete');
    } else {
        statusElement.classList.add('completed');
        statusElement.innerHTML = '<i class="fas fa-check"></i>';
        localStorage.setItem('dailyHabitTracker-' + id, 'completed');
    }
}


/**
 * الدالة الرئيسية لإنشاء وإضافة لوحة متابعة العادات اليومية.
 */
function createDailyHabitTracker() {
    const trackerData = [
        // الأنشطة المطلوبة
        { id: 'sport', name: 'الرياضة (30 دقيقة)', icon: 'fas fa-running', color: '#4CAF50' },
        { id: 'sleep', name: 'النوم (7-9 ساعات)', icon: 'fas fa-moon', color: '#5C6BC0' },
        { id: 'water', name: 'شرب الماء (8 أكواب)', icon: 'fas fa-tint', color: '#2196F3' },
        { id: 'skincare', name: 'العناية بالبشرة', icon: 'fas fa-hand-sparkles', color: '#e91e63' },
        // الأنشطة المقترحة
        { id: 'reading', name: 'القراءة/التعلم (15 دقيقة)', icon: 'fas fa-book-open', color: '#FF9800' },
        { id: 'meditate', name: 'التأمل/اليقظة (5 دقائق)', icon: 'fas fa-peace', color: '#00BCD4' },
        { id: 'healthyeat', name: 'وجبة صحية رئيسية', icon: 'fas fa-carrot', color: '#795548' },
        { id: 'journal', name: 'كتابة اليوميات/التخطيط', icon: 'fas fa-pencil-alt', color: '#9C27B0' }
    ];

    const insertionPoint = document.querySelector('#sec-health .health-subs');

    if (!insertionPoint) return;

    const trackerContainer = document.createElement('div');
    trackerContainer.id = 'daily-habit-tracker-ui';
    trackerContainer.className = 'tracker-ui'; 

    trackerContainer.innerHTML = `
        <h3 style="color: var(--accent-blue);">
            <i class="fas fa-check-double" style="color: #673ab7;"></i> قائمة العادات اليومية
        </h3>
        <div class="tracker-list" id="habit-tracker-list">
            </div>
    `;

    const trackerList = trackerContainer.querySelector('#habit-tracker-list');
    trackerData.forEach((item) => {
        const listItem = document.createElement('div');
        listItem.className = 'tracker-item';
        
        // التحقق من الحالة المحفوظة (persistence solution)
        const savedStatus = localStorage.getItem('dailyHabitTracker-' + item.id);
        const isCompleted = savedStatus === 'completed';

        listItem.innerHTML = `
            <div class="tracker-info">
                <div class="tracker-icon" style="color: ${item.color};"><i class="${item.icon}"></i></div>
                <div class="tracker-name">${item.name}</div>
            </div>
            <div 
                class="tracker-status-habit ${isCompleted ? 'completed' : ''}" 
                data-id="${item.id}"
            >
                ${isCompleted ? '<i class="fas fa-check"></i>' : ''}
            </div>
        `;
        // لتبديل الحالة عند الضغط على أي مكان في عنصر القائمة
        listItem.onclick = () => checkHabitCompletion(item.id);

        trackerList.appendChild(listItem);
    });

    insertionPoint.insertAdjacentElement('afterend', trackerContainer);
}


// ===================================================================
// 4. الدوال الأساسية للتطبيق (Modal, Admin, Navigation)
// ===================================================================

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('active');
}

function showSection(sectionId) {
    const sections = document.querySelectorAll('.section-view');
    sections.forEach(sec => sec.style.display = 'none');
    
    if (sectionId === 'home') {
        document.getElementById('homeView').style.display = 'block';
    } else {
        document.getElementById(sectionId).style.display = 'block';
    }

    // تحديث شريط التنقل السفلي
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-section') === sectionId || sectionId === 'home' && item.textContent.includes('الرئيسية')) {
             item.classList.add('active');
        }
    });

    // إخفاء لوحة الأدمن عند التنقل
    document.getElementById('adminDashboard').style.display = 'none';
    document.getElementById('adminLogin').style.display = 'none';
    localStorage.removeItem('isAdminLoggedIn');
    document.body.classList.remove('delete-mode-active');
}

function toggleAdminPanel() {
    const adminToggleBtn = document.getElementById('adminToggleBtn');
    if (localStorage.getItem('isAdminLoggedIn') === 'true') {
        // إذا كان مسجل دخوله بالفعل
        document.getElementById('adminDashboard').style.display = document.getElementById('adminDashboard').style.display === 'block' ? 'none' : 'block';
        document.getElementById('adminLogin').style.display = 'none';
    } else {
        // إذا لم يكن مسجل دخوله
        document.getElementById('adminLogin').style.display = document.getElementById('adminLogin').style.display === 'block' ? 'none' : 'block';
        document.getElementById('adminDashboard').style.display = 'none';
    }
}

function adminLogin(event) {
    event.preventDefault();
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        localStorage.setItem('isAdminLoggedIn', 'true');
        document.getElementById('adminLogin').style.display = 'none';
        document.getElementById('adminDashboard').style.display = 'block';
        alert('تم تسجيل الدخول بنجاح! مرحباً بك Zazo.');
    } else {
        alert('خطأ: اسم المستخدم أو كلمة المرور غير صحيحة.');
    }
}

function adminLogout() {
    localStorage.removeItem('isAdminLoggedIn');
    document.getElementById('adminDashboard').style.display = 'none';
    document.body.classList.remove('delete-mode-active');
    alert('تم تسجيل الخروج.');
}

function toggleDeleteMode() {
    document.body.classList.toggle('delete-mode-active');
    const isActive = document.body.classList.contains('delete-mode-active');
    alert(isActive ? 'وضع الحذف مفعل. انقر على أيقونة (X) لحذف أي محتوى.' : 'تم إلغاء وضع الحذف.');
}

function openModal(modalId) {
    document.getElementById(modalId).style.display = 'flex';
}

function closeModal(event, modalId) {
    if (event.target.id === modalId) {
        document.getElementById(modalId).style.display = 'none';
    }
}

// دالة محاكاة لتوليد محتوى بواسطة AI (لإكمال المنطق)
function fetchGeminiContent(prompt, type) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(`هذا محتوى تم توليده بواسطة الذكاء الاصطناعي (محاكاة) عن **${prompt}** في مجال **${type}**. يمكن استخدامه كبوست أو مقال.`);
        }, 1500);
    });
}

// دالة محاكاة تأثير الكتابة (لإكمال المنطق)
function startTypingEffect(text, outputElement, useBtn) {
    outputElement.innerHTML = '';
    useBtn.disabled = true;
    useBtn.setAttribute('data-content', text);

    let i = 0;
    const speed = 20;

    function type() {
        if (i < text.length) {
            outputElement.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        } else {
            useBtn.disabled = false;
        }
    }
    type();
}


// دوال لفتح وإغلاق النوافذ المنبثقة (Modals)
function openUploadPostModal(type) {
    const modalId = 'uploadPostModal';
    const section = document.getElementById('adminSectionSelect').value;
    const modalContent = document.getElementById('uploadPostModalContent');
    
    modalContent.innerHTML = `
        <h3 style="color: var(--primary-pink);"><i class="fas fa-upload"></i> رفع محتوى جديد (${type})</h3>
        <form onsubmit="handlePostSubmit(event, '${section}', '${type}')">
            <textarea id="postContentArea" placeholder="أدخل محتوى ${type} هنا..." class="modal-box textarea" required></textarea>
            <button type="submit" class="btn-primary"><i class="fas fa-save"></i> نشر المحتوى</button>
        </form>
        <button class="btn-primary" style="background:#ccc; margin-top:10px;" onclick="closeModal(event, '${modalId}')">إلغاء</button>
    `;
    openModal(modalId);
}

function handlePostSubmit(event, section, type) {
    event.preventDefault();
    const content = document.getElementById('postContentArea').value;
    
    if (content.trim() === "") {
        alert("لا يمكن نشر محتوى فارغ.");
        return;
    }

    const newPost = {
        section: section,
        type: type,
        text: content,
        timestamp: Date.now()
    };
    
    // 💡 حل مشكلة الـ persistence: حفظ المحتوى في قاعدة البيانات المحاكاة
    const postId = saveContentToDB(newPost);
    newPost.id = postId; // تحديث المعرف
    
    // عرض المحتوى الجديد
    renderContent(newPost, true);

    alert(`تم نشر المحتوى بنجاح في قسم ${section} كـ ${type}!`);
    document.getElementById('uploadPostModal').style.display = 'none';
}


function openAIGeneratorModal() {
    const modalId = 'aiGeneratorModal';
    const modalContent = document.getElementById('aiGeneratorModalContent');

    modalContent.innerHTML = `
        <h3 style="color: #673ab7;"><i class="fas fa-robot"></i> توليد محتوى بالذكاء الاصطناعي</h3>
        <div class="ai-options">
            <button class="ai-option-btn active" data-type="post" onclick="selectAIType(this)">بوست</button>
            <button class="ai-option-btn" data-type="article" onclick="selectAIType(this)">مقالة</button>
        </div>
        <input type="text" id="aiPrompt" placeholder="أدخل موضوع التوليد (مثال: أهمية العناية الذاتية)" class="inp-field" required>
        <button class="btn-primary btn-ai" onclick="generateAIContent()">
            <i class="fas fa-magic"></i> توليد المحتوى
        </button>
        <div class="ai-output" id="aiOutput">
            <i class="fas fa-lightbulb"></i> سيظهر المحتوى المولد هنا.
        </div>
        <button id="useAIBtn" class="btn-primary" style="background:var(--accent-green); margin-top:15px;" onclick="useAIContent()" disabled>
            استخدام المحتوى
        </button>
        <button class="btn-primary" style="background:#ccc; margin-top:10px;" onclick="closeModal(event, '${modalId}')">إلغاء</button>
    `;
    openModal(modalId);
}

function selectAIType(button) {
    document.querySelectorAll('.ai-option-btn').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
}

async function generateAIContent() {
    const prompt = document.getElementById('aiPrompt').value;
    const typeElement = document.querySelector('.ai-option-btn.active');
    const type = typeElement ? typeElement.getAttribute('data-type') : 'general';
    const outputElement = document.getElementById('aiOutput');
    const useBtn = document.getElementById('useAIBtn');
    
    if (!prompt) {
        alert('يرجى إدخال موضوع لتوليد المحتوى.');
        return;
    }

    outputElement.innerHTML = `<i class="fas fa-robot fa-spin"></i> جاري استدعاء المحتوى الحقيقي (${type}) عن: **${prompt}**...`;
    useBtn.disabled = true;

    const generatedText = await fetchGeminiContent(prompt, type);
    
    startTypingEffect(generatedText, outputElement, useBtn);
}

function useAIContent() {
    const useBtn = document.getElementById('useAIBtn');
    const content = useBtn.getAttribute('data-content');
    if (content) {
        alert('تم نسخ المحتوى: ' + content);
        // يمكنك توجيه المحتوى إلى textarea الرفع هنا
        // مثال: document.getElementById('postContentArea').value = content;
        // ثم فتح نافذة الرفع
    }
}

// دالة محاكاة لتتبع واجهات المستخدم (UI) الأخرى في قسم الصحة
function toggleTrackerUI(trackerId) {
    alert(`سيتم فتح واجهة تتبع: ${trackerId}. (تحتاج إلى تطبيق منطق هذه الواجهة).`);
}

function openContentScreen(sectionId, title, event) {
    const isDeleteMode = document.body.classList.contains('delete-mode-active');
    if (isDeleteMode) {
        // إذا كان وضع الحذف مفعلاً، لا تفتح الشاشة، بل اترك الزر الأحمر ليعمل
        return;
    }
    
    const contentId = sectionId === 'sec-feelings' ? 'txt-feelings' : 'txt-fiqh';
    const contentElement = document.getElementById(contentId);
    if (!contentElement) return;

    const content = contentElement.textContent.trim();

    const modalId = 'contentScreenModal';
    const modalContent = document.getElementById('contentScreenModalContent');

    modalContent.innerHTML = `
        <h3 style="color: var(--primary-pink); margin-bottom: 20px;">${title}</h3>
        <div style="text-align: right; white-space: pre-wrap; line-height: 1.8; color: #555;">${content}</div>
        <button class="btn-primary" style="background:#ccc; margin-top:30px;" onclick="closeModal(event, '${modalId}')">إغلاق</button>
    `;
    openModal(modalId);
}

function openCommentModal(postId) {
    const modalId = 'commentModal';
    const modalContent = document.getElementById('commentModalContent');

    modalContent.innerHTML = `
        <h3 style="color: var(--primary-pink);"><i class="far fa-comment-dots"></i> إضافة تعليق (ID: ${postId})</h3>
        <div class="comment-input-area">
            <textarea id="commentText" placeholder="اكتب تعليقك هنا..." required></textarea>
            <button class="btn-primary" style="background: var(--accent-green);" onclick="submitComment(${postId})">
                <i class="fas fa-paper-plane"></i> إرسال التعليق
            </button>
        </div>
        <button class="btn-primary" style="background:#ccc; margin-top:10px;" onclick="closeModal(event, '${modalId}')">إلغاء</button>
    `;
    openModal(modalId);
}

function submitComment(postId) {
    const commentText = document.getElementById('commentText').value;
    if (commentText.trim() === "") {
        alert("لا يمكن إرسال تعليق فارغ.");
        return;
    }
    alert(`تم إرسال التعليق "${commentText}" بنجاح على البوست رقم ${postId}! (محاكاة حفظ البيانات)`);
    document.getElementById('commentModal').style.display = 'none';
}

function toggleLike(button, postId) {
    button.classList.toggle('active');
    const icon = button.querySelector('i');
    const textSpan = button.querySelector('span');

    if (button.classList.contains('active')) {
        icon.classList.remove('far');
        icon.classList.add('fas');
        textSpan.textContent = 'أعجبني';
        alert(`أعجبك البوست رقم ${postId}!`);
    } else {
        icon.classList.remove('fas');
        icon.classList.add('far');
        textSpan.textContent = 'إعجاب';
        alert(`تم إلغاء الإعجاب بالبوست رقم ${postId}.`);
    }
}

function shareContent(postId, title) {
    if (navigator.share) {
        navigator.share({
            title: title,
            text: `اكتشفي هذا المحتوى المميز في تطبيق رقة: ${title}`,
            url: window.location.href,
        }).then(() => {
            console.log('تمت المشاركة بنجاح');
        }).catch(console.error);
    } else {
        alert(`تم محاكاة مشاركة البوست رقم ${postId} بعنوان "${title}"`);
    }
}


// ===================================================================
// 5. تهيئة التطبيق عند التحميل
// ===================================================================

document.addEventListener('DOMContentLoaded', () => {
    // 1. جلب وعرض المحتوى المحفوظ (حل مشكلة الـ Refresh)
    fetchAndRenderAllContent();
    
    // 2. إنشاء متتبع العادات اليومية
    createDailyHabitTracker();
    
    // 3. عرض لوحة الأدمن إذا كان مسجل دخوله مسبقاً
    if (localStorage.getItem('isAdminLoggedIn') === 'true') {
        document.getElementById('adminDashboard').style.display = 'block';
    }

    // 4. تعيين القسم النشط في شريط التنقل السفلي (Home افتراضياً)
    showSection('home');
});
