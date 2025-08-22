// Frontend app logic for Pi donations
const yearSpan = document.getElementById('year');
if (yearSpan) yearSpan.textContent = new Date().getFullYear();

const state = {
  user: null,
  sandbox: true, // اجعلها false في الإنتاج
};

function setUserUI(user) {
  const userBox = document.getElementById('userBox');
  const loginBtn = document.getElementById('loginBtn');
  if (user) {
    document.getElementById('username').textContent = user.username || user.uid || 'User';
    document.getElementById('pubkey').textContent = user.public_key || '—';
    userBox.classList.remove('hidden');
    loginBtn.classList.add('hidden');
  } else {
    userBox.classList.add('hidden');
    loginBtn.classList.remove('hidden');
  }
}

async function fetchJSON(url, opts={}){
  const r = await fetch(url, Object.assign({headers:{'Content-Type':'application/json'}}, opts));
  if(!r.ok) throw new Error('HTTP ' + r.status);
  return r.json();
}

async function refreshStats() {
  try {
    const s = await fetchJSON('server/api/stats.php');
    document.getElementById('stat-total').textContent = s.total_pi?.toFixed(2) ?? '0.00';
    document.getElementById('stat-count').textContent = s.unique_donors ?? '0';
    document.getElementById('stat-last').textContent = s.last_donation_pi ? s.last_donation_pi.toFixed(2) + ' Pi' : '—';
  } catch (e) {
    console.error('stats error', e);
  }
}

function setPaymentState(msg){
  const el = document.getElementById('paymentState');
  el.textContent = msg || '';
}

async function handleLogin() {
  if (!window.Pi) {
    alert('يجب فتح الموقع داخل Pi Browser.');
    return;
  }
  try {
    // Initialize SDK
    window.Pi.init({ version: '2.0', sandbox: state.sandbox });
    // Ask for scopes we need. "payments" is required for payment.
    const scopes = ['username', 'payments'];
    const authRes = await window.Pi.authenticate(scopes, onIncompletePaymentFound);
    // Send user to backend to create/update
    const res = await fetchJSON('server/api/auth_login.php', {
      method: 'POST',
      body: JSON.stringify({ user: authRes.user, accessToken: authRes.accessToken })
    });
    state.user = res.user;
    setUserUI(state.user);
  } catch (err) {
    console.error(err);
    alert('فشل تسجيل الدخول: ' + err.message);
  }
}

async function onIncompletePaymentFound(payment) {
  // Optionally handle incomplete payments (e.g., resume them).
  console.log('incomplete payment found', payment);
}

async function donate() {
  if (!state.user) {
    alert('من فضلك سجّل الدخول أولًا.');
    return;
  }
  if (!window.Pi) {
    alert('يجب فتح الموقع داخل Pi Browser.');
    return;
  }
  const amount = parseFloat(document.getElementById('amount').value || '0');
  const memo = document.getElementById('memo').value || 'تبرع';
  const cause = document.getElementById('cause').value || 'تبرع عام';
  if (!amount || amount <= 0) {
    alert('أدخل مبلغ صالح.');
    return;
  }
  setPaymentState('جارٍ إنشاء عملية الدفع…');

  window.Pi.init({ version: '2.0', sandbox: state.sandbox });

  try {
    const payment = await window.Pi.createPayment({
      amount,
      memo: memo,
      metadata: { cause },
    }, {
      onReadyForServerApproval: async (paymentId) => {
        setPaymentState('في انتظار موافقة الخادم…');
        try {
          await fetchJSON('server/api/payments_approve.php', {
            method: 'POST',
            body: JSON.stringify({ paymentId })
          });
        } catch (e) {
          setPaymentState('تعذر الموافقة من الخادم.');
          throw e;
        }
      },
      onReadyForServerCompletion: async (paymentId, txid) => {
        setPaymentState('اكتمال المعاملة على السلسلة، جارٍ إنهاء العملية…');
        try {
          await fetchJSON('server/api/payments_complete.php', {
            method: 'POST',
            body: JSON.stringify({ paymentId, txid, amount, cause, memo })
          });
          setPaymentState('تم تسجيل تبرعك بنجاح، شكرًا لك!');
          refreshStats();
        } catch (e) {
          setPaymentState('تعذر إكمال العملية من الخادم.');
          throw e;
        }
      },
      onCancel: (paymentId) => {
        setPaymentState('تم إلغاء العملية.');
      },
      onError: (error, paymentId) => {
        console.error('payment error', error);
        setPaymentState('حدث خطأ أثناء الدفع.');
      },
    });
    console.log('payment object', payment);
  } catch (e) {
    console.error('createPayment failed', e);
    alert('تعذر إنشاء عملية الدفع.');
  }
}

document.getElementById('loginBtn').addEventListener('click', handleLogin);
document.getElementById('logoutBtn').addEventListener('click', async () => {
  state.user = null;
  setUserUI(null);
});

document.getElementById('donateBtn').addEventListener('click', donate);

refreshStats();
