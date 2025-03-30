const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());
app.post('/', async (req, res) => {
    const { action, paymentId, txid, app_client } = req.body;
    let url;
    let data = {};

    if (action === "approve") {
        url = `https://api.minepi.com/v2/payments/${paymentId}/approve`;
    } else if (action === "complete") {
        url = `https://api.minepi.com/v2/payments/${paymentId}/complete`;
        data.txid = txid;
    }

    const apps = {
        auth_example: 'lpis5qexq2iswzulvqfu8l9k6yg92y7pgapiwj0x6lktjwlgi0hcaylmpjbodp2k>',
        auth_app1: 'lpis5qexq2iswzulvqfu8l9k6yg92y7pgapiwj0x6lktjwlgi0hcaylmpjbodp2k>',
        // أضف تطبيقات أخرى هنا إذا لزم الأمر
    };

    try {
        const response = await axios.post(url, data, {
            headers: {
                Authorization: apps[app_client]
            }
        });

        res.status(200).json({
            response: response.data,
            error: null
        });
    } catch (error) {
        res.status(500).json({
            response: null,
            error: error.message
        });
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});