const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

// استبدل بـ API Key بتاعك من موقع المطورين بتاع Pi
const PI_API_KEY = 'hl667nzicowctfd4bwiy2yl64xpn3ogxuhitkoydqixgprsprjw5plu32bhjpoxa';
const PI_API_URL = 'https://api.minepi.com/v2';
const VALID_APP_CLIENT = 'pi_payment_app'; // نفس القيمة المستخدمة في الواجهة الأمامية

// إعدادات CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// نقطة نهاية الموافقة على الدفع
app.post('/pi/approve', async (req, res) => {
    const { action, paymentId, app_client } = req.body;
    if (action !== 'approve' || !paymentId || app_client !== VALID_APP_CLIENT) {
        return res.status(400).json({ error: 'طلب غير صالح: تحقق من action أو paymentId أو app_client' });
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
app.post('/pi/complete', async (req, res) => {
    const { action, paymentId, txid, app_client } = req.body;
    if (action !== 'complete' || !paymentId || !txid || app_client !== VALID_APP_CLIENT) {
        return res.status(400).json({ error: 'طلب غير صالح: تحقق من action أو paymentId أو txid أو app_client' });
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
app.post('/pi/incomplete', async (req, res) => {
    const { action, paymentId, app_client } = req.body;
    if (action !== 'incomplete' || !paymentId || app_client !== VALID_APP_CLIENT) {
        return res.status(400).json({ error: 'طلب غير صالح: تحقق من action أو paymentId أو app_client' });
    }
    try {
        // منطق التعامل مع الدفعات غير المكتملة (مثل التسجيل أو إعادة المحاولة)
        console.log('التعامل مع دفع غير مكتمل:', { paymentId });
        res.json({ success: true, paymentId });
    } catch (error) {
        console.error('خطأ في التعامل مع دفع غير مكتمل:', error.message);
        res.status(500).json({ error: 'فشل التعامل مع الدفع غير المكتمل' });
    }
});

// تشغيل السيرفر
const PORT = process.env.PORT || 3314;
app.listen(PORT, () => console.log(`السيرفر يعمل على http://localhost:${PORT}`));
