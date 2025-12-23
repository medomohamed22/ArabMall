require('dotenv').config();
const express = require('express');
const cors = require('cors');
const PiNetwork = require('pi-backend');

const app = express();
app.use(cors());
app.use(express.json());

const apiKey = process.env.PI_API_KEY;
const walletPrivateSeed = process.env.PI_WALLET_PRIVATE_SEED;

const pi = new PiNetwork(apiKey, walletPrivateSeed);

// Route للموافقة على الدفع (يُنادى من frontend)
app.post('/approve-payment', async (req, res) => {
    const { paymentId } = req.body;
    
    if (!paymentId) {
        return res.status(400).json({ error: 'Missing paymentId' });
    }
    
    try {
        // موافقة على الدفع في خوادم Pi (Server-Side Approval)
        const result = await pi.approvePayment(paymentId);
        console.log('Payment approved:', result);
        res.json({ success: true, message: 'Payment approved' });
    } catch (error) {
        console.error('Approval error:', error);
        res.status(500).json({ error: error.message || 'Approval failed' });
    }
});

// Route لإكمال الدفع (يُنادى من frontend بعد ما المستخدم يوافق)
app.post('/complete-payment', async (req, res) => {
    const { paymentId, txid } = req.body;
    
    if (!paymentId || !txid) {
        return res.status(400).json({ error: 'Missing paymentId or txid' });
    }
    
    try {
        // إكمال الدفع في خوادم Pi (Server-Side Completion)
        const payment = await pi.completePayment(paymentId, txid);
        console.log('Payment completed:', payment);
        
        // هنا تقدر تسجل التبرع في database بتاعتك
        // مثال: amount = payment.amount, from_uid = payment.user_uid, username هتحصله من frontend
        
        res.json({ success: true, message: 'Payment completed successfully', payment });
    } catch (error) {
        console.error('Completion error:', error);
        res.status(500).json({ error: error.message || 'Completion failed' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});