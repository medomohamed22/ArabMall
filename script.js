// هذه القيم مكانية - يجب استبدالها بقيمك الحقيقية
const apiKey = "26lhoe5x0uzw5karnmxm7lh6vu7xgsegmxnzddlw1skkrj7gyqyli8byxsukohia";
const walletPrivateSeed = "SAE4JUJZTDK7WCH3QPJSZGWCTRWWNS6BRC5U6WDQ45QW3JOIVBDL4ITQ";

const payButton = document.getElementById('payButton');
const messageDiv = document.getElementById('message');

// تأكد من توفر مكتبة PiNetwork
if (typeof PiNetwork !== 'undefined') {

  const pi = new PiNetwork(apiKey, walletPrivateSeed);

  payButton.addEventListener('click', async () => {
    messageDiv.textContent = "جارٍ معالجة الدفع...";

    try {
      // هنا يمكنك تحديد تفاصيل الدفع (مثلاً: المبلغ، معرف المعاملة)
      const paymentDetails = {
        amount: 1, // قيمة الدفع (تعديل حسب الحاجة)
        transactionId: "tx-" + Math.random().toString(36).substring(2, 15), // معرف معاملة فريد
      };

      const result = await pi.makePayment(paymentDetails.amount, paymentDetails.transactionId);

      if (result.success) {
        messageDiv.textContent = "تم الدفع بنجاح! معرف المعاملة:" + result.transactionId;


      } else {
        messageDiv.textContent = "حدث خطأ في الدفع: " + result.message;
      }

    } catch (error) {
      messageDiv.textContent = "حدث خطأ غير متوقع: " + error.message;
      console.error("خطأ في الدفع:", error);
    }
  });
}
else {
  messageDiv.textContent = "لم يتم العثور على مكتبة PiNetwork. تأكد من تضمينها في المشروع";
}