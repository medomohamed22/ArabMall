exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') return { statusCode: 405 };
    
    const { paymentId, txid } = JSON.parse(event.body);
    if (!paymentId || !txid) return { statusCode: 400, body: JSON.stringify({ status: 'error', message: 'Missing data' }) };
    
    // نفس الـ API Key هنا (لازم يكون نفس الكي في الاتنين)
    const apiKey = 'upxjhc6qmawgpzoqvtrjxqpc18gynacrltot4c4w9w1ehre769ire4jemfhd8bzi'; // غيرها بالكي الحقيقي
    
    try {
        const response = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
            method: 'POST',
            headers: { 'Authorization': `Key ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ txid })
        });
        
        if (response.ok) {
            return { statusCode: 200, body: JSON.stringify({ status: 'success' }) };
        } else {
            const err = await response.text();
            return { statusCode: 500, body: JSON.stringify({ status: 'error', message: err }) };
        }
    } catch (err) {
        return { statusCode: 500, body: JSON.stringify({ status: 'error', message: err.message }) };
    }
};