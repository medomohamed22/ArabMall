const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

const PiSDK = window.Pi; // متاح داخل Pi Browser
const state = { accessToken: null, pioneer: null };

const loginBtn = $('#loginBtn');
const donateBtn = $('#donateBtn');
const amountEl = $('#amount');
const memoEl = $('#memo');
const progress = $('#progress');
const bar = progress.querySelector('.bar');
const alerts = $('#alerts');

$('#year').textContent = new Date().getFullYear();

$$('.chip').forEach(btn => btn.addEventListener('click', () => {
  amountEl.value = btn.dataset.amt;
  validate();
}));

function toast(msg, type='ok'){
  const el = document.createElement('div');
  el.className = `alert ${type}`;
  el.textContent = msg;
  alerts.prepend(el);
  setTimeout(()=> el.remove(), 6000);
}

function setBusy(btn, busy){
  btn.querySelector('.spinner').hidden = !busy;
  btn.querySelector('.btn-text').style.opacity = busy ? .7 : 1;
  btn.disabled = busy;
}

function setProgress(p){
  progress.style.opacity = 1;
  bar.style.width = `${p}%`;
}

function validate(){
  const v = parseFloat(amountEl.value);
  donateBtn.disabled = !(state.accessToken && v && v > 0);
}

amountEl.addEventListener('input', validate);

loginBtn.addEventListener('click', async () => {
  if (!PiSDK) { toast('Pi SDK غير متاح. افتح التطبيق من Pi Browser.', 'err'); return; }
  try {
    setBusy(loginBtn, true);
    // طلب صلاحيات الدفع + اسم المستخدم
    const scopes = ['payments', 'username'];
    function onIncompletePaymentFound(payment){ console.warn('incomplete', payment); }
    const auth = await PiSDK.authenticate(scopes, onIncompletePaymentFound);
    state.accessToken = auth.accessToken;
    // تحقق من التوكن عبر الخادم
    const verify = await fetch('/api/verify/me', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken: state.accessToken })
    }).then(r=>r.json());
    if (!verify.ok) throw new Error('فشل التحقق من الهوية');
    state.pioneer = verify.user;
    loginBtn.textContent = `مرحبًا ${verify.user?.username || ''}`;
    loginBtn.disabled = true;
    toast('تم تسجيل الدخول بنجاح');
  } catch (e) {
    console.error(e);
    toast(e.message || 'تعذر تسجيل الدخول', 'err');
  } finally { setBusy(loginBtn, false); validate(); }
});

// تدفق الدفع عبر Pi SDK + موافقة/إتمام من الخادم

donateBtn.addEventListener('click', async () => {
  const amt = parseFloat(amountEl.value);
  if (!amt || amt <= 0) { toast('أدخل مبلغًا صالحًا', 'err'); return; }
  if (!PiSDK) { toast('Pi SDK غير متاح', 'err'); return; }

  setBusy(donateBtn, true); setProgress(5);

  const paymentData = {
    amount: amt,
    memo: memoEl.value?.trim() || 'Donation',
    metadata: { project: 'donations', ts: Date.now() }
  };

  const paymentCallbacks = {
    onReadyForServerApproval: async (paymentId) => {
      try{
        setProgress(25);
        const r = await fetch('/api/payments/approve', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentId })
        }).then(r=>r.json());
        if(!r.ok) throw new Error('رفض الخادم الموافقة');
        setProgress(45);
      } catch (e){ toast('فشل موافقة الخادم: '+ e.message, 'err'); throw e; }
    },
    onReadyForServerCompletion: async (paymentId, txid) => {
      try{
        setProgress(75);
        const r = await fetch('/api/payments/complete', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentId, txid })
        }).then(r=>r.json());
        if(!r.ok) throw new Error('تعذر إتمام الدفع');
        setProgress(100);
        toast('تم الدفع وإتمام العملية بنجاح ✅');
      } catch (e){ toast('فشل إتمام الدفع: '+ e.message, 'err'); throw e; }
    },
    onCancel: (paymentId) => { toast('تم إلغاء العملية'); setProgress(0); },
    onError: (error, payment) => { console.error(error, payment); toast('خطأ في الدفع: '+ error?.message, 'err'); setProgress(0); }
  };

  try {
    await PiSDK.createPayment(paymentData, paymentCallbacks);
  } catch (e) {
    console.error(e);
    toast('لم يتم إنشاء الدفع', 'err');
  } finally { setBusy(donateBtn, false); }
});
