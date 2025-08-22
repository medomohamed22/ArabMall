document.addEventListener('DOMContentLoaded', () => {
    // تهيئة Pi SDK
    Pi.init({ version: "2.0", sandbox: true }); // استخدم sandbox: false للإنتاج

    const loginButton = document.getElementById('login-button');
    const loginSection = document.getElementById('login-section');
    const donationSection = document.getElementById('donation-section');
    const usernameSpan = document.getElementById('username');

    // وظيفة تسجيل الدخول
    async function authenticateUser() {
        try {
            const scopes = ['username', 'payments'];
            const authResult = await Pi.authenticate(scopes, onIncompletePaymentFound);
            console.log('Authentication successful:', authResult);
            
            // تخزين بيانات المستخدم محليًا
            localStorage.setItem('pi_user', JSON.stringify(authResult.user));
            
            // تحديث الواجهة
            showDonationSection(authResult.user);

        } catch (error) {
            console.error('Authentication failed:', error);
            alert('فشل تسجيل الدخول. يرجى المحاولة مرة أخرى.');
        }
    }

    loginButton.addEventListener('click', authenticateUser);

    // التحقق من وجود جلسة سابقة عند تحميل الصفحة
    const storedUser = localStorage.getItem('pi_user');
    if (storedUser) {
        showDonationSection(JSON.parse(storedUser));
    }

    function showDonationSection(user) {
        loginSection.classList.add('hidden');
        donationSection.classList.remove('hidden');
        document.getElementById('history-section').classList.remove('hidden');
        usernameSpan.textContent = user.username;
        loadDonationHistory();
    }
    
    // دالة لمعالجة المدفوعات غير المكتملة (مطلوبة من SDK)
    function onIncompletePaymentFound(payment) {
        console.log('Incomplete payment found:', payment);
        // يمكنك هنا عرض رسالة للمستخدم لإكمال الدفع
    };
});
// ... (الكود السابق) ...

const donateButton = document.getElementById('donate-button');
const paymentStatus = document.getElementById('payment-status');
const amounts = document.querySelectorAll('.amount');
const customAmountInput = document.getElementById('custom-amount');
let selectedAmount = 0;

amounts.forEach(button => {
    button.addEventListener('click', () => {
        selectedAmount = parseFloat(button.dataset.amount);
        customAmountInput.value = ''; // مسح الحقل المخصص
        // يمكنك إضافة تأثير بصري للزر المختار
    });
});

customAmountInput.addEventListener('input', () => {
    selectedAmount = parseFloat(customAmountInput.value);
});

async function makePayment() {
    if (selectedAmount <= 0 || isNaN(selectedAmount)) {
        alert('الرجاء اختيار أو إدخال مبلغ صحيح للتبرع.');
        return;
    }

    paymentStatus.textContent = 'جاري معالجة الدفع...';

    try {
        const paymentData = {
            amount: selectedAmount,
            memo: "تبرع لدعم قضيتنا", // مذكرة الدفع
            metadata: { userId: JSON.parse(localStorage.getItem('pi_user')).uid } // بيانات إضافية
        };

        const callbacks = {
            onReadyForServerApproval: function(paymentId) {
                // هنا يجب إرسال paymentId إلى الخادم الخاص بك للتحقق والموافقة
                // بما أننا لا نستخدم خادمًا، سنقوم بالموافقة مباشرة (لأغراض العرض فقط)
                // في بيئة الإنتاج، هذه الخطوة يجب أن تتم على الخادم
                console.log('onReadyForServerApproval', paymentId);
                // approvePaymentOnServer(paymentId);
            },
            onReadyForServerCompletion: function(paymentId, txid) {
                // هنا يجب إرسال paymentId و txid إلى الخادم للتأكيد النهائي
                console.log('onReadyForServerCompletion', paymentId, txid);
                // completePaymentOnServer(paymentId, txid);
            },
            onCancel: function(paymentId) {
                console.log('onCancel', paymentId);
                paymentStatus.textContent = 'تم إلغاء عملية الدفع.';
            },
            onError: function(error, payment) {
                console.error('onError', error);
                paymentStatus.textContent = `حدث خطأ: ${error.message}`;
            },
        };

        const payment = await Pi.createPayment(paymentData, callbacks);

        // بعد إتمام الدفع بنجاح
        paymentStatus.textContent = `شكرًا لتبرعك بمبلغ ${selectedAmount}π!`;
        saveDonation(selectedAmount, payment.identifier); // استخدام معرف الدفع
        loadDonationHistory();

    } catch (error) {
        console.error('Payment creation failed:', error);
        paymentStatus.textContent = 'فشل في إنشاء طلب الدفع.';
    }
}

donateButton.addEventListener('click', makePayment);
// ... (الكود السابق) ...

const donationsList = document.getElementById('donations-list');

// حفظ التبرع في LocalStorage
function saveDonation(amount, paymentId) {
    const user = JSON.parse(localStorage.getItem('pi_user'));
    if (!user) return;

    const donations = JSON.parse(localStorage.getItem(`donations_${user.uid}`)) || [];
    donations.push({
        amount: amount,
        date: new Date().toISOString(),
        paymentId: paymentId
    });

    localStorage.setItem(`donations_${user.uid}`, JSON.stringify(donations));
}

// تحميل وعرض سجل التبرعات
function loadDonationHistory() {
    const user = JSON.parse(localStorage.getItem('pi_user'));
    if (!user) return;

    donationsList.innerHTML = ''; // مسح القائمة الحالية
    const donations = JSON.parse(localStorage.getItem(`donations_${user.uid}`)) || [];

    if (donations.length === 0) {
        donationsList.innerHTML = '<li>لم تقم بأي تبرعات بعد.</li>';
        return;
    }

    donations.forEach(donation => {
        const li = document.createElement('li');
        const formattedDate = new Date(donation.date).toLocaleString('ar-EG');
        li.textContent = `تبرعت بمبلغ ${donation.amount}π بتاريخ ${formattedDate}`;
        donationsList.appendChild(li);
    });
}