// التحقق من توفر Pi SDK
if (!window.Pi) {
  console.error("Pi SDK not loaded. Ensure the script is included and the page is opened in Pi Browser.");
  Swal.fire({
    title: "خطأ",
    text: "لم يتم تحميل Pi SDK. تأكد من فتح الصفحة في Pi Browser.",
    icon: "error",
  });
}

// تهيئة Pi SDK لـ Mainnet
try {
  Pi.init({ version: "2.0", sandbox: false }); // Mainnet
  console.log("Pi SDK initialized for Mainnet");
} catch (error) {
  console.error("Pi SDK initialization failed:", error);
  Swal.fire({
    title: "خطأ",
    text: `فشل تهيئة Pi SDK: ${error.message}`,
    icon: "error",
  });
}

// بيانات الحملات (مثال - استبدلها بجلب البيانات من Backend)
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

// حالة اللغة
let currentLang = "ar";
let username = ""; // لتخزين اسم المستخدم بعد المصادقة

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
          <p class="total-pi">${
            currentLang === "ar" ? "إجمالي الـ Pi المدفوع" : "Total Pi Donated"
          }: ${campaign.currentAmount} Pi</p>
          <button class="donate-btn" onclick="initiatePayment('${
            campaign.id
          }', 10)">${
      currentLang === "ar" ? "تبرع الآن" : "Donate Now"
    }</button>
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
  document.getElementById("username").innerText = username
    ? currentLang === "ar"
      ? `مرحبًا، ${username}`
      : `Hello, ${username}`
    : "";
  displayCampaigns();
});

// دالة المصادقة
async function authenticate() {
  const scopes = ["payments", "username"];
  try {
    const auth = await Pi.authenticate(scopes, (payment) => {
      console.log("Incomplete payment:", payment);
      return { paymentId: payment.identifier, action: "cancel" };
    });
    console.log("Authentication successful:", auth);
    username = auth.user.username; // تخزين اسم المستخدم
    document.getElementById("username").innerText =
      currentLang === "ar" ? `مرحبًا، ${username}` : `Hello, ${username}`;
    Swal.fire({
      title: currentLang === "ar" ? "نجاح" : "Success",
      text: currentLang === "ar" ? `تمت المصادقة بنجاح، ${username}!` : `Authentication successful, ${username}!`,
      icon: "success",
    });
    return auth.accessToken;
  } catch (error) {
    console.error("Authentication error:", error);
    Swal.fire({
      title: currentLang === "ar" ? "خطأ" : "Error",
      text: currentLang === "ar" ? `فشل المصادقة: ${error.message}` : `Authentication failed: ${error.message}`,
      icon: "error",
    });
    throw error;
  }
}

// دالة إنشاء الدفع
async function initiatePayment(campaignId, amount) {
  // التحقق من توفر Pi SDK
  if (!window.Pi) {
    Swal.fire({
      title: currentLang === "ar" ? "خطأ" : "Error",
      text: currentLang === "ar" ? "Pi SDK غير متوفر. افتح الصفحة في Pi Browser." : "Pi SDK not available. Open the page in Pi Browser.",
      icon: "error",
    });
    return;
  }

  try {
    const accessToken = await authenticate(); // التأكد من المصادقة
    const paymentData = {
      amount: Number(amount), // التأكد من أن المبلغ رقم
      memo: `تبرع لحملة ${campaignId}`,
      metadata: { campaignId },
    };
    const paymentCallbacks = {
      onReadyForServerApproval: async (paymentId) => {
        try {
          const response = await fetch("/api/payments/approve", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ paymentId }),
          });
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Approval failed");
          }
          console.log("Payment approved:", paymentId);
        } catch (error) {
          console.error("Approval error:", error);
          Swal.fire({
            title: currentLang === "ar" ? "خطأ" : "Error",
            text: currentLang === "ar" ? `فشل الموافقة على الدفع: ${error.message}` : `Payment approval failed: ${error.message}`,
            icon: "error",
          });
        }
      },
      onReadyForServerCompletion: async (paymentId, txid) => {
        try {
          const response = await fetch("/api/payments/complete", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ paymentId, txid }),
          });
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Completion failed");
          }
          const data = await response.json();
          const campaign = campaigns.find((c) => c.id === campaignId);
          campaign.currentAmount += amount;
          displayCampaigns();
          Swal.fire({
            title: currentLang === "ar" ? "نجاح" : "Success",
            text: currentLang === "ar" ? "تم التبرع بنجاح!" : "Donation completed successfully!",
            icon: "success",
          });
        } catch (error) {
          console.error("Completion error:", error);
          Swal.fire({
            title: currentLang === "ar" ? "خطأ" : "Error",
            text: currentLang === "ar" ? `فشل إكمال الدفع: ${error.message}` : `Payment completion failed: ${error.message}`,
            icon: "error",
          });
        }
      },
      onCancel: () => {
        Swal.fire({
          title: currentLang === "ar" ? "إلغاء" : "Info",
          text: currentLang === "ar" ? "تم إلغاء عملية التبرع" : "Donation was cancelled",
          icon: "info",
        });
      },
      onError: (error) => {
        console.error("Payment error:", error);
        Swal.fire({
          title: currentLang === "ar" ? "خطأ" : "Error",
          text: currentLang === "ar" ? `فشل التبرع: ${error.message}` : `Donation failed: ${error.message}`,
          icon: "error",
        });
      },
    };
    await Pi.createPayment(paymentData, paymentCallbacks);
  } catch (error) {
    console.error("Payment initiation error:", error);
    Swal.fire({
      title: currentLang === "ar" ? "خطأ" : "Error",
      text: currentLang === "ar" ? `فشل بدء الدفع: ${error.message}` : `Payment initiation failed: ${error.message}`,
      icon: "error",
    });
  }
}

// عرض الحملات عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", () => {
  displayCampaigns();
  console.log("Checking Pi SDK:", window.Pi);
});
