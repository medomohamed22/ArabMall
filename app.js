// ربط محفظتك (ضع عنوان محفظتك هنا)
const RECEIVER_WALLET = "GBS27QZJP3RLL4D63Z3523BTY272KUPJE3OFQWA67DASMOH4NIZI2CEP";

// عند تحميل الصفحة، عرض التبرعات المخزنة
window.onload = () => {
  loadDonations();
};

// زر التبرع
document.getElementById("donateBtn").addEventListener("click", async () => {
  const amount = document.getElementById("amount").value;
  if (!amount || amount <= 0) {
    alert("من فضلك أدخل مبلغ صحيح للتبرع");
    return;
  }

  try {
    // استدعاء الـ SDK للدفع
    const payment = await Pi.createPayment({
      amount: parseFloat(amount),
      memo: "Donation to project",
      metadata: { type: "donation" },
      to_address: RECEIVER_WALLET, // محفظتك
    });

    // حفظ بيانات التبرع محليًا
    saveDonation({
      amount,
      txid: payment.txid || "TX-" + Date.now(),
      date: new Date().toLocaleString(),
    });

    alert("✅ تمت عملية التبرع بنجاح!");
    loadDonations();

  } catch (err) {
    console.error(err);
    alert("❌ فشلت عملية التبرع");
  }
});

// حفظ التبرعات محليًا
function saveDonation(donation) {
  let donations = JSON.parse(localStorage.getItem("donations")) || [];
  donations.push(donation);
  localStorage.setItem("donations", JSON.stringify(donations));
}

// تحميل التبرعات من localStorage
function loadDonations() {
  let donations = JSON.parse(localStorage.getItem("donations")) || [];
  let list = document.getElementById("donationsList");
  list.innerHTML = "";
  donations.forEach(d => {
    let li = document.createElement("li");
    li.textContent = `مبلغ: ${d.amount} Pi | تاريخ: ${d.date} | TxID: ${d.txid}`;
    list.appendChild(li);
  });
}

