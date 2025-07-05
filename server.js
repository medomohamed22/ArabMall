const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = 3001;
const PI_API_KEY = "4qlcg9kuzhmisw4pjgtzepnur2ufeqrth7l8oizbmuajgq4pyt9luntulvls1mzf"; // من Pi Developer Portal

app.post('/confirm', async (req, res) => {
    const { paymentId, amount, project } = req.body;
    
    console.log(`📢 استلام طلب دفع لمشروع: ${project} بمبلغ ${amount} Pi`);
    
    try {
        const response = await axios.get(`https://api.minepi.com/v2/payments/${paymentId}`, {
            headers: { Authorization: `Key ${PI_API_KEY}` }
        });
        
        const payment = response.data;
        
        if (payment.amount === amount.toString() && payment.status === "completed") {
            console.log("✅ تم التحقق من المعاملة بنجاح عبر Pi Server");
            res.status(200).json({ success: true, message: "تم تأكيد الدفع والتحقق من Pi" });
        } else {
            console.warn("⚠️ المعاملة غير مطابقة أو غير مكتملة");
            res.status(400).json({ success: false, message: "فشل التحقق من المعاملة" });
        }
        
    } catch (err) {
        console.error("❌ خطأ أثناء التحقق من Pi API:", err.response?.data || err.message);
        res.status(500).json({ success: false, message: "خطأ في التحقق من Pi API" });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 سيرفر استقبال Pi يعمل على http://localhost:${PORT}`);
});