const chatInput = document.getElementById('chat-input');
const chatArea = document.getElementById('chat-area');
const sendButton = document.getElementById('send-button');
const apiKey = 'AIzaSyBbRnH6zZsKyQMbxIg7thGKCappZsJl5GI';
const footer = document.querySelector('.footer');
const chatStorageKey = 'chatHistory';  // مفتاح لتخزين سجل الدردشة في localStorage

// تحميل سجل الدردشة من localStorage عند تحميل الصفحة
loadChatHistory();

sendButton.addEventListener('click', async () => {
    const userText = chatInput.value;
    if (!userText) return;

    appendMessage("user", userText);
    saveMessage("user", userText); // حفظ رسالة المستخدم
    chatInput.value = '';

    const typingIndicator = createTypingIndicator();
    chatArea.appendChild(typingIndicator);
    chatArea.scrollTop = chatArea.scrollHeight;

    const requestBody = {
        contents: [{ parts: [{ text: userText }] }],
    };

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
            }
        );
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        if (data && data.candidates && data.candidates.length > 0 && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts.length > 0) {
            let aiResponse = data.candidates[0].content.parts[0].text;
            aiResponse = formatResponse(aiResponse);
            typingIndicator.remove();
             appendMessage("ai", aiResponse);
           saveMessage("ai", aiResponse);  // حفظ رد الذكاء الاصطناعي
        } else {
            typingIndicator.remove();
            appendMessage("error", "لم يتم تلقي رد صحيح من الذكاء الاصطناعي.");
             saveMessage("error", "لم يتم تلقي رد صحيح من الذكاء الاصطناعي.");
        }
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        typingIndicator.remove();
         appendMessage("error", "حدث خطأ أثناء الاتصال بالذكاء الاصطناعي.");
          saveMessage("error", "حدث خطأ أثناء الاتصال بالذكاء الاصطناعي.");
    }
});
function formatResponse(text) {
     let formattedText = text.replace(/\*+/g, '');
    formattedText = formattedText.replace(/_+/g, '');
    formattedText = formattedText.replace(/~+/g, '');

     const lines = formattedText.split('\n').filter(line => line.trim() !== '');
        if (lines.length > 1) {
            const listItems = lines.map(line => `<li>${line.trim()}</li>`).join('');
           return `<ul>${listItems}</ul>`;
        }
    return formattedText;
}
function createTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.classList.add('ai-message', 'typing-indicator');
    typingDiv.innerHTML = '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';
    return typingDiv;
}

function appendMessage(sender, message) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add(sender + '-message');
    messageDiv.innerHTML = message;
    chatArea.appendChild(messageDiv);
    chatArea.scrollTop = chatArea.scrollHeight;
}

// إخفاء الفوتر عند التركيز على مربع الإدخال
chatInput.addEventListener('focus', () => {
    footer.classList.add('hidden');
});

// إظهار الفوتر عند الخروج من مربع الإدخال
chatInput.addEventListener('blur', () => {
     footer.classList.remove('hidden');
});
// حفظ الرسالة في localStorage
function saveMessage(sender, message) {
    const chatHistory = getChatHistory();
    chatHistory.push({ sender, message });
    localStorage.setItem(chatStorageKey, JSON.stringify(chatHistory));
}

// الحصول على سجل الدردشة من localStorage
function getChatHistory() {
    const storedHistory = localStorage.getItem(chatStorageKey);
    return storedHistory ? JSON.parse(storedHistory) : [];
}

// تحميل سجل الدردشة وعرضه
function loadChatHistory() {
    const chatHistory = getChatHistory();
    chatHistory.forEach(messageObj => {
        appendMessage(messageObj.sender, messageObj.message);
    });
}