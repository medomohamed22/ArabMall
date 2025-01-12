const chatInput = document.getElementById('chat-input');
const chatArea = document.getElementById('chat-area');
const sendButton = document.getElementById('send-button');
const apiKey = 'AIzaSyBbRnH6zZsKyQMbxIg7thGKCappZsJl5GI';
const footer = document.querySelector('.footer');
const chatStorageKey = 'chatHistory';
const pointsStorageKey = 'userPoints';
const userPointsDisplay = document.getElementById('user-points');
const watchAdButton = document.getElementById('watch-ad-button');
const pointsPerAd = 10;
const errorMessage = document.getElementById('error-message'); // الحصول على عنصر رسالة الخطأ

// تحميل النقاط عند تحميل الصفحة
let userPoints = loadUserPoints();
updatePointsDisplay();
// تعطيل زر الإرسال إذا لم يكن لدى المستخدم نقاط كافية
updateSendButtonState();
// تحميل سجل الدردشة من localStorage عند تحميل الصفحة
loadChatHistory();

const Pi = window.Pi;
    Pi.init({ version: "2.0" });

//this function was made by LatinChain Platform
async function showPiAds() {
    try {
        var d1 = new Date();
        var date1 = new Date(d1.getUTCFullYear(), d1.getUTCMonth(), d1.getUTCDate(), d1.getUTCHours(), d1.getUTCMinutes(), d1.getUTCSeconds());
        var date2 = new Date(date1.getTime() - 2 * 60000);

        if(localStorage && localStorage['pi_ad_datetime'] > date2.getTime())
        {
            return;
        }

        const isAdReadyResponse = await Pi.Ads.isAdReady("interstitial");

        if (isAdReadyResponse.ready === false) {
            await Pi.Ads.requestAd("interstitial");
        }

        const showAdResponse = await Pi.Ads.showAd("interstitial");

        if(showAdResponse.result == "AD_CLOSED")
        {
           var d1 = new Date();
           var date1 = new Date(d1.getUTCFullYear(), d1.getUTCMonth(), d1.getUTCDate(), d1.getUTCHours(), d1.getUTCMinutes(), d1.getUTCSeconds());
           localStorage['pi_ad_datetime'] = date1.getTime();

           userPoints += pointsPerAd;
           saveUserPoints(userPoints);
           updatePointsDisplay();
           updateSendButtonState();
            alert("تمت مشاهدة الإعلان، لقد كسبت 10 نقاط!");
       }
    } catch (err) {
        //alert(err);
        // Not able to fetch the user
    }
}

async function auth() {
    try {
        const nativeFeaturesList = await Pi.nativeFeaturesList();
        const adNetworkSupported = nativeFeaturesList.includes("ad_network");

        if(!adNetworkSupported)
           alert("Update Pi Browser version, please.");

        // Identify the user with their username / unique network-wide ID, and get permission to request payments from them.
        const scopes = ['username', 'payments', 'wallet_address'];
        function onIncompletePaymentFound(payment) {
        
        }; // Read more about this in the SDK reference

        Pi.authenticate(scopes, onIncompletePaymentFound).then(function (auth) {
        
            //alert('Hello ' + auth.user.username);
             // لا تعرض الإعلانات عند تحميل الصفحة لأول مرة
            // showPiAds();
        }).catch(function (error) {
            console.error(error);
        });
    } catch (err) {
        alert(err);
        // Not able to fetch the user
    }
}
auth();

watchAdButton.addEventListener('click', () => {
     showPiAds();
});

sendButton.addEventListener('click', async () => {
  if (userPoints <= 0) {
       showErrorMessage("شاهد إعلان للحصول على نقاط.");
      return;
  }
   hideErrorMessage();
    userPoints--;
    saveUserPoints(userPoints);
    updatePointsDisplay();
    updateSendButtonState();
    const userText = chatInput.value;
    if (!userText) return;

    appendMessage("user", userText);
    saveMessage("user", userText);
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
            saveMessage("ai", aiResponse);
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

// حفظ النقاط في localStorage
function saveUserPoints(points) {
    localStorage.setItem(pointsStorageKey, JSON.stringify(points));
}

// تحميل النقاط من localStorage
function loadUserPoints() {
    const storedPoints = localStorage.getItem(pointsStorageKey);
    return storedPoints ? JSON.parse(storedPoints) : 0;
}
// تحديث عرض النقاط
function updatePointsDisplay() {
   userPointsDisplay.textContent = userPoints;
}
// تحديث حالة زر الإرسال بناءً على عدد النقاط
function updateSendButtonState() {
   sendButton.disabled = userPoints <= 0;
}
// عرض رسالة الخطأ
function showErrorMessage(message) {
  errorMessage.textContent = message;
  errorMessage.classList.add('show');
}
// إخفاء رسالة الخطأ
function hideErrorMessage() {
  errorMessage.classList.remove('show');
}