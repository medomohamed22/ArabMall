(async () => {
  await Pi.init({ version: "2.0" });
  const nativeFeaturesList = await Pi.nativeFeaturesList();
  const adNetworkSupported = nativeFeaturesList.includes("ad_network");
  
  if (adNetworkSupported) {
    console.log("إعلانات Pi Network مدعومة.");
  } else {
    console.log("إعلانات Pi Network غير مدعومة.");
  }
})();

// متغير لتتبع المستوى الحالي
let currentLevel = 1;

// دالة لإكمال المستوى
async function completeLevel() {
  console.log(`تم إكمال المستوى ${currentLevel}`);
  
  // عرض إعلان كل 3 مستويات
  if (currentLevel % 3 === 0) {
    try {
      await Pi.Ads.showAd("interstitial");
      console.log("تم عرض الإعلان.");
    } catch (error) {
      console.error("فشل في عرض الإعلان:", error);
    }
  }
  
  startNewLevel();
}

// دالة لبدء مستوى جديد
function startNewLevel() {
  currentLevel++;
  console.log(`بدأ المستوى الجديد: ${currentLevel}`);
}

// محاكاة تقدم في اللعبة
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("nextLevelBtn").addEventListener("click", completeLevel);
});