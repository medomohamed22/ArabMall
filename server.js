const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3314;

// استخدم المفتاح الذي تجده في بوابة المطورين الخاصة بك
// هام: لا تشارك هذا المفتاح أبدًا واحفظه في متغيرات البيئة في تطبيق حقيقي
const PI_API_KEY = 'YOUR_PI_API_KEY'; // <--- ضع مفتاح الـ API الخاص بك هنا

app.use(cors()); // للسماح بالطلبات من الواجهة الأمامية
app.use(bodyParser.json());

const PI_API_URL = 'https://api.minepi.com/v2/payments';

// Endpoint للموافقة على الدفع من جانب الخادم
app.post('/approve', async (req, res) => {
    const { paymentId } = req.body;
    console.log(`الموافقة على الدفع: ${paymentId}`);

    try {
        await axios.post(
            `${PI_API_URL}/${paymentId}/approve`,
            {},
            { headers: { 'Authorization': `Key ${PI_API_KEY}` } }
        );
        console.log(`تمت الموافقة على الدفع بنجاح: ${paymentId}`);
        res.status(200).json({ message: 'Approved' });
    } catch (error) {
        console.error('خطأ في الموافقة:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to approve payment' });
    }
});

// Endpoint لإكمال الدفع من جانب الخادم
app.post('/complete', async (req, res) => {
    const { paymentId, txid } = req.body;
    console.log(`إكمال الدفع: ${paymentId} مع TXID: ${txid}`);

    try {
        await axios.post(
            `${PI_API_URL}/${paymentId}/complete`,
            { txid },
            { headers: { 'Authorization': `Key ${PI_API_KEY}` } }
        );
        console.log(`اكتمل الدفع بنجاح: ${paymentId}`);
        // هنا يمكنك تحديث قاعدة البيانات الخاصة بك (مثلاً، وضع علامة على الطلب كـ "مدفوع")
        res.status(200).json({ message: 'Completed' });
    } catch (error) {
        console.error('خطأ في الإكمال:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to complete payment' });
    }
});

// Endpoint لمعالجة المدفوعات غير المكتملة (اختياري ولكن موصى به)
app.post('/incomplete', (req, res) => {
    const { payment } = req.body;
    console.log('تم استلام دفعة غير مكتملة:', payment);
    // يمكنك هنا التحقق من حالة الدفع في قاعدة البيانات الخاصة بك وتحديد الإجراء التالي
    res.status(200).json({ message: 'Incomplete payment noted' });
});


app.listen(port, () => {
    console.log(`خادم Pi الخلفي يعمل على http://localhost:${port}`);
});
