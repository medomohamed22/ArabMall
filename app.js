import express from "express";
import axios from "axios";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json());

// مفتاح API الخاص بـ Pi Network
const API_KEY = "wbegvil1tpnoi8o2tkieob8e5c1aluxmsit83kh6wyocipcmsw283j7fhfwebjuv";

// إنشاء دفعة
app.post("/payments/create", async (req, res) => {
  const { productId, amount, memo } = req.body;
  
  try {
    const response = await axios.post("https://api.minepi.com/v2/payments", {
      amount,
      memo,
      metadata: { productId },
    }, {
      headers: {
        Authorization: `Key ${API_KEY}`,
      },
    });
    
    const paymentId = response.data.paymentId;
    res.status(200).json({ paymentId, message: "تم إنشاء الدفع بنجاح!" });
  } catch (error) {
    console.error("خطأ أثناء إنشاء الدفع:", error);
    res.status(500).json({ message: "فشل في إنشاء الدفع." });
  }
});

// الموافقة على الدفع
app.post("/payments/approve", async (req, res) => {
  const { paymentId } = req.body;
  
  try {
    await axios.post(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {}, {
      headers: {
        Authorization: `Key ${API_KEY}`,
      },
    });
    
    res.status(200).json({ message: `تمت الموافقة على الدفع: ${paymentId}` });
  } catch (error) {
    console.error("خطأ أثناء الموافقة على الدفع:", error);
    res.status(500).json({ message: "فشل في الموافقة على الدفع." });
  }
});

// بدء تشغيل الخادم
app.listen(8000, () => {
  console.log("الخادم يعمل على المنفذ 8000!");
});
