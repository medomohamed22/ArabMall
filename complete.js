exports.handler = async (event) => {
  console.log("=== COMPLETE FUNCTION CALLED ===");
  console.log("Time:", new Date().toISOString());
  console.log("Event body:", event.body);
  console.log("HTTP Method:", event.httpMethod);

  if (event.httpMethod !== 'POST') {
    console.log("Wrong method:", event.httpMethod);
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch (e) {
    console.log("JSON parse error:", e.message);
    return { 
      statusCode: 400, 
      body: JSON.stringify({ status: 'error', message: 'Invalid JSON' }) 
    };
  }

  const { paymentId, txid } = payload;

  console.log("Received paymentId:", paymentId);
  console.log("Received txid:", txid);

  if (!paymentId || !txid) {
    console.log("Missing paymentId or txid");
    return { 
      statusCode: 400, 
      body: JSON.stringify({ status: 'error', message: 'Missing paymentId or txid' }) 
    };
  }

  // غيّر هذا بالـ API Key الحقيقي بتاعك من Pi Developer Portal (Testnet)
  const apiKey = 'upxjhc6qmawgpzoqvtrjxqpc18gynacrltot4c4w9w1ehre769ire4jemfhd8bzi';

  console.log("Using API Key (first 10 chars):", apiKey.substring(0, 10) + '...');

  try {
    console.log("Sending completion request to Pi API...");
    const response = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ txid })
    });

    console.log("Pi API Response Status:", response.status);

    if (response.ok) {
      console.log("COMPLETION SUCCESSFUL!");
      return { 
        statusCode: 200, 
        body: JSON.stringify({ status: 'success' }) 
      };
    } else {
      const errText = await response.text();
      console.log("Pi API Error:", response.status, errText);
      return { 
        statusCode: 500, 
        body: JSON.stringify({ status: 'error', message: errText }) 
      };
    }
  } catch (error) {
    console.log("Fetch error:", error.message);
    return { 
      statusCode: 500, 
      body: JSON.stringify({ status: 'error', message: error.message }) 
    };
  }
};
