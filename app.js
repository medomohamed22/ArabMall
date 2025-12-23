Pi.init({ version: "2.0" });

function donate() {
    let amount = document.getElementById("amount").value;
    
    fetch("../backend/create_payment.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount })
        })
        .then(res => res.json())
        .then(data => {
            
            Pi.createPayment({
                amount: amount,
                memo: "DonateWay Donation",
                metadata: { donation_id: data.donation_id },
                
                onReadyForServerApproval(paymentId) {
                    fetch("../backend/approve_payment.php", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ paymentId })
                    });
                },
                
                onComplete(paymentId) {
                    document.getElementById("status").innerText = "✅ تم التبرع بنجاح";
                },
                
                onCancel() {
                    document.getElementById("status").innerText = "❌ تم الإلغاء";
                }
            });
            
        });
}