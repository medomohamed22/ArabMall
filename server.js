require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());
app.use(express.static('public'));

const API_KEY = process.env.PI_API_KEY;
const PI_API_URL = 'https://api.minepi.com/v2/payments';

// الموافقة على الدفع
app.post('/approve_payment', async (req, res) => {
    const { paymentId } = req.body;
    try {
        const response = await fetch(`${PI_API_URL}/${paymentId}/approve`, {
            method: 'POST',
            headers: {
                'Authorization': `Key ${API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error approving payment');
    }
});

// إكمال الدفع
app.post('/complete_payment', async (req, res) => {
    const { paymentId, txid } = req.body;
    try {
        const response = await fetch(`${PI_API_URL}/${paymentId}/complete`, {
            method: 'POST',
            headers: {
                'Authorization': `Key ${API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ txid })
        });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error completing payment');
    }
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
