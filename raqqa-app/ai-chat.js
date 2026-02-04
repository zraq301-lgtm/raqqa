async function sendMessage() {
    const input = document.getElementById('chat-input');
    const text = input.value;
    if(!text) return;

    const container = document.getElementById('chat-messages');
    container.innerHTML += `<div class="msg msg-user">${text}</div>`;
    input.value = '';

    try {
        const res = await fetch('/api/raqqa-ai', { 
            method: 'POST', 
            headers: {'Content-Type':'application/json'}, 
            body: JSON.stringify({ prompt: text }) 
        });
        const data = await res.json();
        container.innerHTML += `<div class="msg msg-ai">${data.reply || "أنا معكِ دائماً."}</div>`;
    } catch(e) {
        container.innerHTML += `<div class="msg msg-ai">أسمعكِ جيداً.. أخبريني المزيد.</div>`;
    }
    container.scrollTop = container.scrollHeight;
}
