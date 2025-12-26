exports.handler = async (event) => {
  console.log("=== APPROVE FUNCTION CALLED ===");
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
    return { statusCode: 400, body: JSON.stringify({ status: 'error', message: 'Invalid JSON' }) };
  }

  const { paymentId } = payload;

  if (!paymentId) {
    console.log("Missing paymentId");
    return { statusCode: 400, body: JSON.stringify({ status: 'error', message: 'Missing paymentId' }) };
  }

  console.log("Received paymentId:", paymentId);

  const apiKey = 'upxjhc6qmawgpzoqvtrjxqpc18gynacrltot4c4w9w1ehre769ire4jemfhd8bzi'; // تأكد إن ده الكي الصحيح 100%

  try {
    console.log("Sending approval request to Pi API...");
    const response = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    console.log("Pi API Response Status:", response.status);

    if (response.ok) {
      console.log("APPROVAL SUCCESSFUL!");
      return { statusCode: 200, body: JSON.stringify({ status: 'success' }) };
    } else {
      const errText = await response.text();
      console.log("Pi API Error:", response.status, errText);
      return { statusCode: 500, body: JSON.stringify({ status: 'error', message: errText }) };
    }
  } catch (error) {
    console.log("Fetch error:", error.message);
    return { statusCode: 500, body: JSON.stringify({ status: 'error', message: error.message }) };
  }
};
