exports.handler = async (event) => {
    console.log("=== COMPLETE FUNCTION CALLED ===");
    console.log("Time:", new Date().toISOString());
    console.log("Body:", event.body);
    
    if (event.httpMethod !== 'POST') return { statusCode: 405 };
    
    const { paymentId, txid } = JSON.parse(event.body || '{}');
    if (!paymentId || !txid) return { statusCode: 400, body: JSON.stringify({ status: 'error', message: 'Missing data' }) };
    
    const apiKey = ''; // ← نفس الـ Key
    
    try {
        const response = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
            method: 'POST',
            headers: { 'Authorization': `Key ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ txid })
        });
        
        if (response.ok) {
            console.log("COMPLETION SUCCESS");
            return { statusCode: 200, body: JSON.stringify({ status: 'success' }) };
        } else {
            const err = await response.text();
            console.log("COMPLETION FAILED:", err);
            return { statusCode: 500, body: JSON.stringify({ status: 'error', message: err }) };
        }
    } catch (err) {
        console.log("ERROR:", err.message);
        return { statusCode: 500, body: JSON.stringify({ status: 'error', message: err.message }) };
    }
};
