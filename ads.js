// تهيئة Pi Network SDK
(async () => {
  await Pi.init({ version: "2.0" });
  const nativeFeaturesList = await Pi.nativeFeaturesList();
  const adNetworkSupported = nativeFeaturesList.includes("ad_network");
  
  if (!adNetworkSupported) {
    console.log("إعلانات Pi Network غير مدعومة.");
  }
})();

// دالة لعرض إعلان مكافآت (Rewarded Ad)
const showRewardedAd = async () => {
  try {
    const isAdReadyResponse = await Pi.Ads.isAdReady("rewarded");
    
    if (!isAdReadyResponse.ready) {
      const requestAdResponse = await Pi.Ads.requestAd("rewarded");
      
      if (requestAdResponse.result === "ADS_NOT_SUPPORTED") {
        return alert("الإعلانات غير مدعومة، يرجى تحديث متصفح Pi.");
      }
      
      if (requestAdResponse.result !== "AD_LOADED") {
        return alert("الإعلانات غير متاحة الآن، حاول مرة أخرى لاحقًا.");
      }
    }
    
    const showAdResponse = await Pi.Ads.showAd("rewarded");
    
    if (showAdResponse.result === "AD_REWARDED") {
      alert("مبروك! لقد حصلت على مكافأة.");
    } else {
      alert("لم يتم عرض الإعلان، حاول مرة أخرى.");
    }
  } catch (err) {
    console.error("حدث خطأ أثناء عرض الإعلان:", err);
  }
};

// دالة لعرض إعلان بين المستويات (Interstitial Ad)
const showInterstitialAd = async () => {
  try {
    await Pi.Ads.showAd("interstitial");
  } catch (err) {
    console.error("حدث خطأ أثناء عرض الإعلان:", err);
  }
};

// محاكاة إكمال مستوى وعرض إعلان بعد كل 3 مستويات
let currentLevel = 1;

const completeLevel = () => {
  currentLevel++;
  console.log(`لقد أكملت المستوى ${currentLevel}`);
  
  if (currentLevel % 3 === 0) {
    showInterstitialAd();
  }
};

// إضافة زر لتشغيل الإعلان عند الطلب
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("rewardedAdBtn").addEventListener("click", showRewardedAd);
});