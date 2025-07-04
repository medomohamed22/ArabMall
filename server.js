const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

// استبدل بـ API Key بتاعك من موقع المطورين بتاع Pi
const PI_API_KEY = 'hl667nzicowctfd4bwiy2yl64xpn3ogxuhitkoydqixgprsprjw5plu32bhjpoxa';
const PI_API_URL = 'https://api.minepi.com/v2';

// إعدادات CORS عشان الواجهة الأمامية تتصل بالسيرفر
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// نقطة نهاية الموافقة على الدفع
app.post('/approve', async (req, res) => {
    const { paymentId } = req.body;
    if (!paymentId) {
        return res.status(400).json({ error: 'paymentId مطلوب' });
    }
    try {
        const response = await axios.post(
            `${PI_API_URL}/payments/${paymentId}/approve`,
            {},
            { headers: { Authorization: `Key ${PI_API_KEY}` } }
        );
        console.log(`تمت الموافقة على الدفع ${paymentId}:`, response.data);
        res.json({ success: true, paymentId });
    } catch (error) {
        console.error(`خطأ في الموافقة على الدفع ${paymentId}:`, error.message);
        res.status(500).json({ error: 'فشل الموافقة على الدفع' });
    }
});

// نقطة نهاية إكمال الدفع
app.post('/complete', async (req, res) => {
    const { paymentId, txid } = req.body;
    if (!paymentId || !txid) {
        return res.status(400).json({ error: 'paymentId و txid مطلوبان' });
    }
    try {
        const response = await axios.post(
            `${PI_API_URL}/payments/${paymentId}/complete`,
            { txid },
            { headers: { Authorization: `Key ${PI_API_KEY}` } }
        );
        console.log(`تم إكمال الدفع ${paymentId}:`, response.data);
        res.json({ success: true, paymentId, txid });
    } catch (error) {
        console.error(`خطأ في إكمال الدفع ${paymentId}:`, error.message);
        res.status(500).json({ error: 'فشل إكمال الدفع' });
    }
});

// نقطة نهاية التعامل مع الدفعات غير المكتملة
app.post('/incomplete', async (req, res) => {
    const { payment } = req.body;
    if (!payment) {
        return res.status(400).json({ error: 'payment مطلوب' });
    }
    try {
        // هنا ممكن تضيف منطق للتعامل مع الدفعات غير المكتملة (مثل التسجيل أو إعادة المحاولة)
        console.log('التعامل مع دفع غير مكتمل:', payment);
        res.json({ success: true, payment });
    } catch (error) {
        console.error('خطأ في التعامل مع دفع غير مكتمل:', error.message);
        res.status(500).json({ error: 'فشل التعامل مع الدفع غير المكتمل' });
    }
});

// تشغيل السيرفر
const PORT = process.env.PORT || 3314;
app.listen(PORT, () => console.log(`السيرفر يعمل على http://localhost:${PORT}`));
