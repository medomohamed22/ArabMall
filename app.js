// app.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Payment Schema
const PaymentSchema = new mongoose.Schema({
    paymentId: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    userId: { type: String, required: true },
    txid: { type: String },
    status: { 
        type: String, 
        enum: ['PENDING', 'COMPLETED', 'FAILED'],
        default: 'PENDING'
    },
    metadata: { type: Object },
    createdAt: { type: Date, default: Date.now }
});

const Payment = mongoose.model('Payment', PaymentSchema);

// Pi Network SDK Configuration
const Pi = require('@pinetwork-js/sdk');
const piConfig = {
    apiKey: process.env.PI_API_KEY,
    walletPrivateSeed: process.env.PI_WALLET_PRIVATE_SEED
};

// API Routes
app.post('/api/payments/create', async (req, res) => {
    try {
        const { paymentId, amount, userId } = req.body;

        // Validate payment data
        if (!paymentId || !amount || !userId) {
            return res.status(400).json({ error: 'Missing required payment information' });
        }

        // Create new payment record
        const payment = new Payment({
            paymentId,
            amount,
            userId,
            metadata: req.body.metadata
        });

        await payment.save();

        res.status(201).json({
            success: true,
            payment: {
                id: payment._id,
                paymentId: payment.paymentId,
                status: payment.status
            }
        });
    } catch (error) {
        console.error('Error creating payment:', error);
        res.status(500).json({ error: 'Failed to create payment' });
    }
});

app.post('/api/payments/confirm', async (req, res) => {
    try {
        const { paymentId, txid, userId } = req.body;

        // Validate payment confirmation
        if (!paymentId || !txid) {
            return res.status(400).json({ error: 'Missing payment confirmation details' });
        }

        // Verify the transaction with Pi Network
        const piResponse = await Pi.Payments.verify(txid, piConfig);

        if (piResponse.verified) {
            // Update payment status
            const payment = await Payment.findOneAndUpdate(
                { paymentId },
                { 
                    status: 'COMPLETED',
                    txid: txid
                },
                { new: true }
            );

            if (!payment) {
                return res.status(404).json({ error: 'Payment not found' });
            }

            res.json({
                success: true,
                payment: {
                    id: payment._id,
                    paymentId: payment.paymentId,
                    status: payment.status,
                    txid: payment.txid
                }
            });
        } else {
            throw new Error('Transaction verification failed');
        }
    } catch (error) {
        console.error('Error confirming payment:', error);
        res.status(500).json({ error: 'Failed to confirm payment' });
    }
});

app.get('/api/payments/:paymentId/status', async (req, res) => {
    try {
        const { paymentId } = req.params;
        const payment = await Payment.findOne({ paymentId });

        if (!payment) {
            return res.status(404).json({ error: 'Payment not found' });
        }

        res.json({
            success: true,
            payment: {
                id: payment._id,
                paymentId: payment.paymentId,
                status: payment.status,
                amount: payment.amount,
                txid: payment.txid
            }
        });
    } catch (error) {
        console.error('Error checking payment status:', error);
        res.status(500).json({ error: 'Failed to check payment status' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});