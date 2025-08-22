// ننتظر حتى يتم تحميل محتوى الصفحة بالكامل قبل تشغيل الكود
document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. تهيئة وإعداد المتغيرات ---

    // تهيئة Pi SDK
    // ملاحظة: sandbox: true تستخدم للبيئة التجريبية. غيرها إلى false عند إطلاق الموقع بشكل رسمي.
    Pi.init({ version: "2.0", sandbox: true });

    // الوصول إلى عناصر HTML التي سنتعامل معها
    const loginButton = document.getElementById('login-button');
    const donateButton = document.getElementById('donate-button');
    
    const loginSection = document.getElementById('login-section');
    const donationSection = document.getElementById('donation-section');
    const historySection = document.getElementById('history-section');
    
    const usernameSpan = document.getElementById('username');
    const paymentStatus = document.getElementById('payment-status');
    const donationsList = document.getElementById('donations-list');

    const amountButtons = document.querySelectorAll('.amount');
    const customAmountInput = document.getElementById('custom-amount');
    
    let selectedAmount = 0; // متغير لتخزين مبلغ التبرع المختار

    // --- 2. وظائف المصادقة وتسجيل الدخول (Authentication) ---

    // دالة المصادقة الرئيسية باستخدام Pi SDK
    async function authenticateUser() {
        try {
            // نطلب صلاحيات الوصول لاسم المستخدم والدفع
            const scopes = ['username', 'payments'];
            
            // استدعاء دالة المصادقة من SDK
            const authResult = await Pi.authenticate(scopes, onIncompletePaymentFound);
            
            console.log('Authentication successful:', authResult);
            
            // تخزين بيانات المستخدم في التخزين المحلي لتبقى الجلسة مفتوحة
            localStorage.setItem('pi_user', JSON.stringify(authResult.user));
            
            // تحديث واجهة المستخدم لإظهار قسم التبرع
            showUserInterface(authResult.user);

        } catch (error) {
            console.error('Authentication failed:', error);
            alert('فشل تسجيل الدخول. يرجى المحاولة مرة أخرى.');
        }
    }

    // دالة للتعامل مع المدفوعات غير المكتملة (مطلوبة من SDK)
    function onIncompletePaymentFound(payment) {
        console.log('Incomplete payment found:', payment);
        // يمكنك هنا عرض نافذة للمستخدم لإكمال الدفع أو إلغائه
        // مثال: return Pi.completePayment(payment.identifier);
    };

    // دالة لتحديث واجهة المستخدم بعد تسجيل الدخول
    function showUserInterface(user) {
        loginSection.classList.add('hidden'); // إخفاء قسم تسجيل الدخول
        donationSection.classList.remove('hidden'); // إظهار قسم التبرع
        historySection.classList.remove('hidden'); // إظهار قسم السجل
        usernameSpan.textContent = user.username; // عرض اسم المستخدم
        loadDonationHistory(); // تحميل سجل التبرعات السابق
    }

    // --- 3. وظائف الدفع والتبرع (Payments) ---

    // دالة إنشاء وإرسال طلب الدفع
    async function makePayment() {
        if (selectedAmount <= 0 || isNaN(selectedAmount)) {
            alert('الرجاء اختيار أو إدخال مبلغ صحيح للتبرع.');
            return;
        }

        paymentStatus.textContent = 'جاري معالجة الدفع...';
        donateButton.disabled = true; // تعطيل الزر لمنع النقرات المزدوجة

        try {
            const paymentData = {
                amount: selectedAmount,
                memo: `تبرع لموقعنا من ${usernameSpan.textContent}`, // مذكرة الدفع
                metadata: { custom_data: 'بيانات إضافية يمكن تتبعها' } 
            };
            
            // دوال المتابعة (Callbacks) التي يستدعيها SDK خلال عملية الدفع
            const callbacks = {
                // هذه الخطوات تتطلب خادمًا خلفيًا (Backend) في التطبيق الحقيقي للأمان
                onReadyForServerApproval: function(paymentId) {
                    console.log('onReadyForServerApproval:', paymentId);
                    // في تطبيق حقيقي: أرسل paymentId إلى خادمك ليقوم بالتحقق والموافقة
                    // fetch('/api/approve-payment', { method: 'POST', body: JSON.stringify({ paymentId }) });
                },
                onReadyForServerCompletion: function(paymentId, txid) {
                    console.log('onReadyForServerCompletion:', paymentId, txid);
                    // في تطبيق حقيقي: أرسل paymentId و txid لخادمك لتأكيد العملية وتخزينها
                    // fetch('/api/complete-payment', { method: 'POST', body: JSON.stringify({ paymentId, txid }) });
                },
                onCancel: function(paymentId) {
                    console.log('onCancel:', paymentId);
                    paymentStatus.textContent = 'تم إلغاء عملية الدفع.';
                    donateButton.disabled = false;
                },
                onError: function(error, payment) {
                    console.error('onError:', error);
                    paymentStatus.textContent = `حدث خطأ: ${error.message}`;
                    donateButton.disabled = false;
                },
            };

            // إنشاء طلب الدفع
            const payment = await Pi.createPayment(paymentData, callbacks);
            
            // في وضع Sandbox، قد تتم العملية بنجاح هنا مباشرة
            console.log('Payment successful:', payment);
            paymentStatus.textContent = `شكراً لك! تم استلام تبرعك بنجاح.`;
            saveDonation(selectedAmount, payment.identifier, payment.transaction.txid || 'N/A');
            loadDonationHistory();

        } catch (error) {
            console.error('Payment creation failed:', error);
            paymentStatus.textContent = 'فشل في إنشاء طلب الدفع.';
        } finally {
            donateButton.disabled = false; // إعادة تفعيل الزر
        }
    }


    // --- 4. إدارة التخزين المحلي (Local Storage) ---

    // حفظ تفاصيل التبرع في LocalStorage
    function saveDonation(amount, paymentId, txid) {
        const user = JSON.parse(localStorage.getItem('pi_user'));
        if (!user) return;

        const storageKey = `donations_${user.uid}`;
        const donations = JSON.parse(localStorage.getItem(storageKey)) || [];
        
        donations.unshift({ // unshift لإضافة التبرع الجديد في بداية القائمة
            amount: amount,
            date: new Date().toISOString(),
            paymentId: paymentId,
            txid: txid
        });

        localStorage.setItem(storageKey, JSON.stringify(donations));
    }

    // تحميل وعرض سجل التبرعات من LocalStorage
    function loadDonationHistory() {
        const user = JSON.parse(localStorage.getItem('pi_user'));
        if (!user) return;

        donationsList.innerHTML = ''; // تفريغ القائمة قبل ملئها
        const storageKey = `donations_${user.uid}`;
        const donations = JSON.parse(localStorage.getItem(storageKey)) || [];

        if (donations.length === 0) {
            donationsList.innerHTML = '<li>لم تقم بأي تبرعات بعد.</li>';
            return;
        }

        donations.forEach(donation => {
            const li = document.createElement('li');
            const formattedDate = new Date(donation.date).toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' });
            li.textContent = `تبرعت بمبلغ ${donation.amount}π - ${formattedDate}`;
            donationsList.appendChild(li);
        });
    }

    // --- 5. ربط الأحداث (Event Listeners) ---

    // ربط حدث النقر على زر تسجيل الدخول
    loginButton.addEventListener('click', authenticateUser);

    // ربط حدث النقر على زر التبرع
    donateButton.addEventListener('click', makePayment);

    // ربط أحداث النقر على أزرار المبالغ المحددة
    amountButtons.forEach(button => {
        button.addEventListener('click', () => {
            selectedAmount = parseFloat(button.dataset.amount);
            customAmountInput.value = ''; // إفراغ حقل المبلغ المخصص
            amountButtons.forEach(btn => btn.style.border = '2px solid transparent'); // إزالة التحديد من كل الأزرار
            button.style.border = '2px solid #6a4bff'; // تمييز الزر المختار
        });
    });

    // مراقبة التغيير في حقل المبلغ المخصص
    customAmountInput.addEventListener('input', () => {
        if (customAmountInput.value) {
            selectedAmount = parseFloat(customAmountInput.value);
            amountButtons.forEach(btn => btn.style.border = '2px solid transparent'); // إزالة التحديد من الأزرار
        }
    });

    // --- 6. التشغيل عند تحميل الصفحة ---

    // التحقق مما إذا كان المستخدم قد سجل دخوله من قبل
    const storedUser = localStorage.getItem('pi_user');
    if (storedUser) {
        console.log('Found existing user session.');
        showUserInterface(JSON.parse(storedUser));
    }

});
