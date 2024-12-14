$(document).ready(function() {
    const Pi = window.Pi;
    Pi.init({ version: "2.0" });

    const donateButton = $("#donate_btn");
    const amountInput = $("#pi_amount");
    const statusDiv = $("#donation_status");

    async function auth() {
        try {
            const scopes = ['username', 'payments', 'wallet_address'];
             function onIncompletePaymentFound(payment) {
                var data = {
                    'action': 'complete',
                    'paymentId': payment.identifier,
                    'txid': payment.transaction.txid,
                    'app_client': 'my_app'
                };
                return $.post( "server.php", data).done(function(data) {
                    donateButton.prop( "disabled", false );
                }).fail(function() {
                    donateButton.prop( "disabled", false );
                });
            };
            Pi.authenticate(scopes, onIncompletePaymentFound).then(function(auth) {
                donateButton.on("click", function() {
                    if (parseFloat(amountInput.val()) > 0) {
                        donateButton.prop("disabled", true);
                        transfer();
                    } else {
                        statusDiv.text("الرجاء إدخال مبلغ صحيح.");
                    }
                });
            }).catch(function(error) {
                statusDiv.text("حدث خطأ أثناء المصادقة: " + error);
                console.error(error);
            });
        } catch (error) {
             statusDiv.text("حدث خطأ أثناء المصادقة: " + error);
           console.error(error);
        }
    }


    async function transfer() {
        try {
            const amount = parseFloat(amountInput.val());
            const payment = Pi.createPayment({
                amount: amount,
                memo: "تبرع لموقعنا",
                metadata: { paymentType: "donation" },
            }, {
                  onReadyForServerApproval: function(paymentId) {
                    var data = {
                                'action': 'approve',
                                'paymentId': paymentId,
                                'txid': '',
                                'app_client': 'my_app'
                            };
                    return $.post( "server.php", data).done(function(data) {
                        donateButton.prop( "disabled", false );
                    }).fail(function() {
                        donateButton.prop( "disabled", false );
                    });
                  },
                   onReadyForServerCompletion: function(paymentId, txid) {
                        var data = {
                                'action': 'complete',
                                'paymentId': paymentId,
                                "txid": txid,
                                'app_client': 'my_app'
                            };
                            return $.post( "server.php", data).done(function(data) {
                                donateButton.prop( "disabled", false );
                            }).fail(function() {
                                donateButton.prop( "disabled", false );
                            });
                      },
                onCancel: function(paymentId) {
                    donateButton.prop("disabled", false);
                    statusDiv.text("تم إلغاء عملية التبرع.");
                },
                onError: function(error, payment) {
                    donateButton.prop("disabled", false);
                    statusDiv.text("حدث خطأ أثناء التبرع: " + error);
                    console.error(error);
                }
            });
        } catch (error) {
            donateButton.prop("disabled", false);
            statusDiv.text("حدث خطأ أثناء إنشاء طلب التبرع: " + error);
            console.error(error);
        }
    }

    auth();
});