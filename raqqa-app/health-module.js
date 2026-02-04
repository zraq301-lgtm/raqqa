// الحفاظ على الربط مع API الحفظ الخاص بك (Neon/Knock)
async function showDetailedHealth(type) {
    let config = getHealthConfig(type); // وظيفة مساعدة لجلب القوالب
    
    Swal.fire({
        title: config.title,
        html: config.html,
        confirmButtonText: 'تحليل وحفظ ✨',
        confirmButtonColor: '#eb2f96',
        showCancelButton: true,
        preConfirm: () => {
            // نفس منطق تجميع البيانات من كودك الأصلي
            let noteParts = [];
            let numericVal = 0;
            for(let i=1; i<=4; i++) {
                let el = document.getElementById('v'+i);
                if(el) {
                    let label = el.previousSibling ? el.previousSibling.innerText : "بيانات";
                    noteParts.push(label + ": " + el.value);
                    if (el.type === 'number' && numericVal === 0) numericVal = el.value;
                }
            }
            return { user_id: 1, category: type, value: numericVal || 0, note: noteParts.join(' | ') };
        }
    }).then(async (result) => {
        if (result.isConfirmed) {
            // الربط مع الـ API الخاص بك
            const response = await fetch('/api/save-health', { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify(result.value) 
            });
            const data = await response.json();
            if (data.success) {
                Swal.fire('تم بنجاح ✨', data.advice, 'success');
            }
        }
    });
}

// بناء شبكة المتابعات (11 قسم) ديناميكياً
function renderHealthGrid() {
    const categories = [
        {id: 'menstruation', name: 'الحيض', icon: 'fa-tint', color: '#ff4d4f'},
        {id: 'pregnancy', name: 'الحمل', icon: 'fa-baby', color: '#eb2f96'},
        {id: 'breastfeeding', name: 'الرضاعة', icon: 'fa-magic', color: '#722ed1'},
        // ... تكملة الـ 11 متابعة كما في كودك
    ];
    
    const container = document.getElementById('health-grid-container');
    container.innerHTML = categories.map(cat => `
        <div class="tracker-item" onclick="showDetailedHealth('${cat.id}')">
            <i class="fas ${cat.icon}" style="color:${cat.color}"></i>
            <span>${cat.name}</span>
        </div>
    `).join('');
}
