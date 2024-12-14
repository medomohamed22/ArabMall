$(document).ready(function() {
    const Pi = window.Pi;
    Pi.init({ version: "2.0" });

    const donateButton = $("#donate_btn");
    const amountInput = $("#pi_amount");
    const statusDiv = $("#donation_status");

    const jsonDataFile = 'data.json'; // اسم ملف JSON

     // دالة لقراءة البيانات من ملف JSON
    async function readJsonData() {
        try {
            const response = await fetch(jsonDataFile);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error reading JSON file:', error);
            return null;
        }
    }
    
     // دالة لكتابة البيانات إلى ملف JSON
    async function writeJsonData(data) {
         try {
             const response = await fetch(jsonDataFile, {
                    method: 'PUT', // Or POST
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data, null, 2),
                });

            if (!response.ok) {
                 throw new Error(`HTTP error! status: ${response.status}`);
            }
         } catch(error) {
             console.error('Error writing JSON file:', error);
        }
    }

    async function auth() {
        try {
            const scopes = ['username', 'payments', 'wallet_address'];
              async function onIncompletePaymentFound(payment) {
                 const data = await readJsonData();
                   if (!data) return;
                   const paymentFound = data.payments.find((p) => p.payment_id == payment.identifier);
                   if (paymentFound) {
                     paymentFound.txid = payment.transaction.txid;
                     paymentFound.status = 'completed';
                      const now = new Date().toISOString();
                     paymentFound.updated_at = now;
                      await writeJsonData(data);
                   }

                 donateButton.prop( "disabled", false );
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


    async function transfer() { // <--- هنا تم استبدال الدالة القديمة بالكامل
        try {
            const amount = parseFloat(amountInput.val());
            const payment = Pi.createPayment({
                amount: amount,
                memo: "تبرع لموقعنا",
                metadata: { paymentType: "donation" },
            }, {
                  onReadyForServerApproval: async function(paymentId) {
                         const data = await readJsonData();
                           if (!data) return;
                           const payment = data.payments.find((p) => p.payment_id == paymentId);
                               if (payment) {
                                     payment.status = 'approved';
                                    const now = new Date().toISOString();
                                    payment.updated_at = now;
                                      await writeJsonData(data);
                               }

                      donateButton.prop( "disabled", false );
                  },
                   onReadyForServerCompletion: async function(paymentId, txid) {
                        const data = await readJsonData();
                            if (!data) return;
                            const payment = data.payments.find((p) => p.payment_id == paymentId);
                             if (payment) {
                                payment.status = 'completed';
                                 payment.txid = txid;
                                const now = new Date().toISOString();
                                   payment.updated_at = now;
                                await writeJsonData(data);
                             }
                         donateButton.prop( "disabled", false );
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
              const data = await readJsonData();
                if (!data) return;
              //  التحقق إذا كان المستخدم موجود
              let userId;
                  const user = data.users.find(u => u.username === Pi.user.username)
                  if(user) {
                      userId = user.id;
                  } else {
                    const newUserId = data.users.length > 0 ? data.users[data.users.length - 1].id + 1 : 1;
                     const newUser = {
                          id: newUserId,
                           username: Pi.user.username,
                          wallet_address: Pi.user.wallet_address,
                           created_at:  new Date().toISOString(),
                            updated_at: new Date().toISOString()
                      }
                     data.users.push(newUser);
                     userId = newUserId;
                  }
             const newPayment = {
                        id: data.payments.length > 0 ? data.payments[data.payments.length - 1].id + 1 : 1,
                        user_id: userId,
                       payment_id: payment.identifier,
                          amount: amount,
                            txid: "",
                        status: 'pending',
                         memo: "تبرع لموقعنا",
                        metadata: { paymentType: "donation" },
                         created_at: new Date().toISOString(),
                         updated_at: new Date().toISOString()
                    };

                data.payments.push(newPayment);
              await  writeJsonData(data);
        } catch (error) {
            donateButton.prop("disabled", false);
            statusDiv.text("حدث خطأ أثناء إنشاء طلب التبرع: " + error);
            console.error(error);
        }
    }

    auth();
});