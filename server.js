const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

// استبدل بـ API Key بتاعك من موقع المطورين بتاع Pi
const PI_API_KEY = 'your-pi-api-key';
const PI_API_URL = 'https://api.minepi.com/v2';

// تفعيل CORS عشان الواجهة الأمامية تقدر تتصل بالسيرفر
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// الموافقة على الدفع
app.post('/approve', async (req, res) => {
    const { paymentId } = req.body;
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

// إكمال الدفع
app.post('/complete', async (req, res) => {
    const { paymentId, txid } = req.body;
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

// التعامل مع الدفعات غير المكتملة
app.post('/incomplete', async (req, res) => {
    const { payment } = req.body;
    try {
        console.log('التعامل مع دفع غير مكتمل:', payment);
        res.json({ success: true, payment });
    } catch (error) {
        console.error('خطأ في التعامل مع دفع غير مكتمل:', error.message);
        res.status(500).json({ error: 'فشل التعامل مع الدفع غير المكتمل' });
    }
});

app.listen(3314, () => console.log('السيرفر يعمل على http://localhost:3314'));
