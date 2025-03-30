(async () => {
  await Pi.init({ version: "2.0" });
  const nativeFeaturesList = await Pi.nativeFeaturesList();
  const adNetworkSupported = nativeFeaturesList.includes("ad_network");
  
  if (!adNetworkSupported) {
    console.log("إعلانات Pi Network غير مدعومة.");
  }
})();

const showRewardedAd = async () => {
  try {
    const isAdReadyResponse = await Pi.Ads.isAdReady("rewarded");
    
    if (!isAdReadyResponse.ready) {
      const requestAdResponse = await Pi.Ads.requestAd("rewarded");
      
      if (requestAdResponse.result === "ADS_NOT_SUPPORTED") {
        return showAdsNotSupportedModal();
      }
      
      if (requestAdResponse.result !== "AD_LOADED") {
        return showAdUnavailableModal();
      }
    }
    
    const showAdResponse = await Pi.Ads.showAd("rewarded");
    
    if (showAdResponse.result === "AD_REWARDED") {
      const adId = showAdResponse.adId;
      const result = await rewardUserForWatchingRewardedAd(adId);
      
      if (result.rewarded) {
        showRewardedModal(result.reward);
      } else {
        showRewardFailModal(result.error);
      }
    } else {
      showAdErrorModal();
    }
  } catch (err) {
    console.error("خطأ أثناء عرض الإعلان:", err);
  }
};

// إضافة زر لتشغيل الإعلان عند الضغط عليه
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("rewardedAdBtn").addEventListener("click", showRewardedAd);
});

// **محاكاة نوافذ العرض**
function showAdsNotSupportedModal() {
  alert("الإعلانات غير مدعومة، يرجى تحديث متصفح Pi.");
}

function showAdUnavailableModal() {
  alert("الإعلانات غير متاحة الآن، حاول مرة أخرى لاحقًا.");
}

function showRewardedModal(reward) {
  alert(`تمت مكافأتك بـ ${reward}!`);
}

function showRewardFailModal(error) {
  alert(`فشلت المكافأة: ${error}`);
}

function showAdErrorModal() {
  alert("حدث خطأ أثناء عرض الإعلان.");
}

async function rewardUserForWatchingRewardedAd(adId) {
  // محاكاة إرسال الطلب إلى السيرفر
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ rewarded: true, reward: "10 Pi Coins" });
    }, 1000);
  });
}