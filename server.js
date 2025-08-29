// server.js
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// إعدادات — عدّل BASE_URL إن لزم (راجع وثائق Pi في Developer Portal)
const PORT = process.env.PORT || 3000;
const PI_API_KEY = process.env.PI_API_KEY || 'yvmfgwqksgjuqlzpsmxasxve2mnshxtni7cju6h7oz45ua9al5zsxt3wejahwwzz';
const PI_API_BASE = process.env.PI_API_BASE || 'https://api.minepi.com/v1'; // تحقق من الوثائق/لوحة المطور

// تخزين مؤقت للمدفوعات (استبدله بقاعدة بيانات في الإنتاج)
const payments = new Map();

/**
 * 1) /create-payment
 * - يتلقى: { amount, memo, metadata }
 * - ينشئ دفعة لدى خادم Pi (باستخدام Server API Key) أو يحضر Payment DTO اللازم للـ SDK
 * - يرجع Payment DTO للفرونت-إند ليتم تمريره إلى Pi.createPayment(...)
 */
app.post('/create-payment', async (req, res) => {
  try {
    const { amount, memo = '', metadata = {} } = req.body;
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({ error: 'invalid_amount' });
    }

    // مثال جسم طلب لإنشاء دفعة — عدّل الحقول طبقًا لمخطط Pi API الفعلي
    const createBody = {
      amount: Number(amount),
      currency: 'PI',
      memo: memo,
      metadata: metadata,
      // callback / redirect URLs أو بيانات إضافية حسب الحاجة
    };

    // نرسل طلب إنشاء دفعة إلى Pi Platform
    const createResp = await axios.post(
      `${PI_API_BASE}/payments`, // راجع الوثائق إن كان المسار مختلف
      createBody,
      { headers: { 'Authorization': `Bearer ${PI_API_KEY}`, 'Content-Type': 'application/json' } }
    );

    const paymentDTO = createResp.data;
    // خزّن في الذاكرة مع الحالة initial
    payments.set(paymentDTO.paymentId || paymentDTO.id || paymentDTO.payment_id, { dto: paymentDTO, status: 'created' });

    // أعد الـ DTO مباشرة للـ SDK في المتصفح
    res.json(paymentDTO);
  } catch (err) {
    console.error('create-payment error', err?.response?.data || err.message);
    res.status(500).json({ error: 'create_failed', details: err?.response?.data || err.message });
  }
});

/**
 * 2) /complete-payment
 * - تتلقى من الفرونت-إند الـ payment object بعد ما المستخدم يوقّع (أو تحصل عليها في callback من SDK)
 * - تقوم باستدعاء endpoint الإتمام في Pi Platform لإثبات حصولك على txid
 * - تحدث الحالة وترد بالنتيجة
 */
app.post('/complete-payment', async (req, res) => {
  try {
    const payload = req.body; // متوقع أن يحتوي على paymentId و txid بحسب SDK callback
    const paymentId = payload.paymentId || payload.id || payload.payment_id;
    const txid = payload.txid || payload.transactionId;

    if (!paymentId || !txid) return res.status(400).json({ error: 'missing_paymentId_or_txid' });

    // 1) استدعاء خادم Pi لإكمال الدفع — المسار الظاهر في الوثائق: /payments/{paymentId}/complete
    const completeResp = await axios.post(
      `${PI_API_BASE}/payments/${encodeURIComponent(paymentId)}/complete`, 
      { txid },
      { headers: { 'Authorization': `Bearer ${PI_API_KEY}`, 'Content-Type': 'application/json' } }
    );

    // حدثت استجابة ناجحة — حدث حالة الدفع محليًا
    payments.set(paymentId, { ...payments.get(paymentId), status: 'completed', txid, completeResult: completeResp.data });

    res.json({ ok: true, detail: completeResp.data });
  } catch (err) {
    console.error('complete-payment error', err?.response?.data || err.message);
    res.status(500).json({ error: 'complete_failed', details: err?.response?.data || err.message });
  }
});

/** اختياري: endpoint لاستعراض حالة الدفع محليًا (debug) */
app.get('/payment/:id', (req, res) => {
  const p = payments.get(req.params.id);
  if (!p) return res.status(404).json({ error: 'not_found' });
  res.json(p);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));