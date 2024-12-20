require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const { MongoClient } = require('mongodb');

const app = express();
app.use(bodyParser.json());

const mongoURI = `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}/${process.env.MONGODB_DATABASE_NAME}`;

let db;

// اتصل بقاعدة البيانات
MongoClient.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((client) => {
    db = client.db(process.env.MONGODB_DATABASE_NAME);
    console.log('Connected to MongoDB');
  })
  .catch((err) => console.error('Failed to connect to MongoDB', err));

// استلام الطلبات
app.post('/payment', async (req, res) => {
  const { action, paymentId, txid } = req.body;

  try {
    if (action === 'approve') {
      const payment = await axios.get(`${process.env.PLATFORM_API_URL}/v2/payments/${paymentId}`, {
        headers: { Authorization: `Bearer ${process.env.PI_API_KEY}` },
      });
      await db.collection('payments').insertOne({
        paymentId,
        status: 'approved',
        txid: null,
        createdAt: new Date(),
      });
      res.json({ message: 'Payment approved' });
    } else if (action === 'complete') {
      await db.collection('payments').updateOne(
        { paymentId },
        { $set: { status: 'completed', txid } }
      );
      res.json({ message: 'Payment completed' });
    } else {
      res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// تشغيل الخادم
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
