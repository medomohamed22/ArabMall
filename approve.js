exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') return { statusCode: 405 };
    
    const { paymentId } = JSON.parse(event.body);
    if (!paymentId) return { statusCode: 400, body: JSON.stringify({ status: 'error', message: 'Missing paymentId' }) };
    
    // حط الـ API Key هنا مباشرة (للتجربة فقط!)
    const apiKey = 'upxjhc6qmawgpzoqvtrjxqpc18gynacrltot4c4w9w1ehre769ire4jemfhd8bzi'; // غيرها بالكي الحقيقي بتاعك
    
    try {
        const response = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
            method: 'POST',
            headers: { 'Authorization': `Key ${apiKey}`, 'Content-Type': 'application/json' }
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