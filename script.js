// تهيئة Pi SDK
Pi.init({ version: "2.0", sandbox: true }); // استخدم sandbox: false لـ Mainnet

// بيانات الحملات (مثال - يمكن استبدالها ببيانات من Backend)
const campaigns = [
  {
    id: "1",
    name: "حملة دعم التعليم",
    nameEn: "Education Support Campaign",
    description: "دعم تعليم الأطفال المحتاجين",
    descriptionEn: "Support education for underprivileged children",
    image: "https://via.placeholder.com/300x200",
    targetAmount: 1000,
    currentAmount: 250,
  },
  {
    id: "2",
    name: "حملة المساكن الآمنة",
    nameEn: "Safe Housing Campaign",
    description: "توفير مساكن للعائلات المشردة",
    descriptionEn: "Provide housing for homeless families",
    image: "https://via.placeholder.com/300x200",
    targetAmount: 2000,
    currentAmount: 500,
  },
];

// حالة اللغة (افتراضية: عربي)
let currentLang = "ar";

// دالة لعرض الحملات
function displayCampaigns() {
  const campaignsContainer = document.getElementById("campaigns");
  campaignsContainer.innerHTML = "";
  campaigns.forEach((campaign) => {
    const progress = (campaign.currentAmount / campaign.targetAmount) * 100;
    const campaignHTML = `
      <div class="col-md-6">
        <div class="campaign-card">
          <img src="${campaign.image}" alt="${
      currentLang === "ar" ? campaign.name : campaign.nameEn
    }" />
          <h3>${currentLang === "ar" ? campaign.name : campaign.nameEn}</h3>
          <p>${currentLang === "ar" ? campaign.description : campaign.descriptionEn}</p>
          <div class="progress">
            <div class="progress-bar" style="width: ${progress}%">${progress.toFixed(2)}%</div>
          </div>
          <p class="total-pi">إجمالي الـ Pi المدفوع: ${campaign.currentAmount} Pi</p>
          <button class="donate-btn" onclick="initiatePayment('${
            campaign.id
          }', 10)">تبرع الآن</button>
        </div>
      </div>
    `;
    campaignsContainer.innerHTML += campaignHTML;
  });
}

// دالة تبديل اللغة
document.getElementById("toggle-lang").addEventListener("click", () => {
  currentLang = currentLang === "ar" ? "en" : "ar";
  document.documentElement.setAttribute("lang", currentLang);
  document.getElementById("toggle-lang").innerText =
    currentLang === "ar" ? "English" : "العربية";
  document.getElementById("page-title").innerText =
    currentLang === "ar" ? "حملات التبرع" : "Donation Campaigns";
  displayCampaigns();
});

// دالة مصادقة Pi
async function authenticate() {
  const scopes = ["payments", "username"];
  try {
    const auth = await Pi.authenticate(scopes, (payment) => {
      console.log("Incomplete payment:", payment);
      return { paymentId: payment.identifier, action: "cancel" };
    });
    console.log("Authentication successful:", auth);
    return auth.accessToken;
  } catch (error) {
    console.error("Authentication error:", error);
    Swal.fire({
      title: currentLang === "ar" ? "خطأ" : "Error",
      text: currentLang === "ar" ? "فشل تسجيل الدخول" : "Authentication failed",
      icon: "error",
    });
    throw error;
  }
}

// دالة إنشاء الدفع
async function initiatePayment(campaignId, amount) {
  try {
    await authenticate(); // التأكد من تسجيل الدخول
    const paymentData = {
      amount: amount,
      memo: `تبرع لحملة ${campaignId}`,
      metadata: { campaignId },
    };
    const paymentCallbacks = {
      onReadyForServerApproval: async (paymentId) => {
        try {
          const response = await fetch("/api/payments/approve", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paymentId }),
          });
          if (!response.ok) throw new Error("Approval failed");
        } catch (error) {
          console.error("Approval error:", error);
        }
      },
      onReadyForServerCompletion: async (paymentId, txid) => {
        try {
          const response = await fetch("/api/payments/complete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paymentId, txid }),
          });
          const data = await response.json();
          // تحديث إجمالي الـ Pi
          const campaign = campaigns.find((c) => c.id === campaignId);
          campaign.currentAmount += amount;
          displayCampaigns();
          Swal.fire({
            title: currentLang === "ar" ? "نجاح" : "Success",
            text:
              currentLang === "ar"
                ? "تم التبرع بنجاح!"
                : "Donation completed successfully!",
            icon: "success",
          });
        } catch (error) {
          console.error("Completion error:", error);
        }
      },
      onCancel: () => {
        Swal.fire({
          title: currentLang === "ar" ? "إلغاء" : "Cancelled",
          text:
            currentLang === "ar"
              ? "تم إلغاء عملية التبرع"
              : "Donation was cancelled",
          icon: "info",
        });
      },
      onError: (error) => {
        console.error("Payment error:", error);
        Swal.fire({
          title: currentLang === "ar" ? "خطأ" : "Error",
          text: currentLang === "ar" ? "فشل التبرع" : "Donation failed",
          icon: "error",
        });
      },
    };
    await Pi.createPayment(paymentData, paymentCallbacks);
  } catch (error) {
    console.error("Payment initiation error:", error);
  }
}

// عرض الحملات عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", displayCampaigns);