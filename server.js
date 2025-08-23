import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const PI_API_URL = "https://api.minepi.com/v2";
const API_KEY = "ضع-API-Key-الخاص-بتطبيقك"; // من Pi Developer Portal

// الموافقة على الدفع
app.post("/approve_payment", async (req, res) => {
  const { paymentId } = req.body;
  try {
    const response = await fetch(`${PI_API_URL}/payments/${paymentId}/approve`, {
      method: "POST",
      headers: {
        "Authorization": `Key ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({})
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error approving payment");
  }
});

// إتمام الدفع
app.post("/complete_payment", async (req, res) => {
  const { paymentId, txid } = req.body;
  try {
    const response = await fetch(`${PI_API_URL}/payments/${paymentId}/complete`, {
      method: "POST",
      headers: {
        "Authorization": `Key ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ txid })
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error completing payment");
  }
});

app.listen(3000, () => console.log("✅ Server running on http://localhost:3000"));
