<?php
// server/api/payments_approve.php
require_once __DIR__ . '/../lib/Database.php';
require_once __DIR__ . '/../config.php';

$input = json_decode(file_get_contents('php://input'), true);
$paymentId = $input['paymentId'] ?? null;
if (!$paymentId) { http_response_code(400); echo json_encode(['error'=>'missing_paymentId']); exit; }

// Approve via Pi API
$ch = curl_init(PI_API_BASE . '/payments/' . urlencode($paymentId) . '/approve');
curl_setopt_array($ch, [
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_POST => true,
  CURLOPT_HTTPHEADER => [
    'Authorization: Key ' . PI_API_KEY,
    'Content-Type: application/json'
  ],
  CURLOPT_POSTFIELDS => json_encode([]),
]);
$resp = curl_exec($ch);
$code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($code >= 200 && $code < 300) {
  echo json_encode(['ok'=>true]);
} else {
  http_response_code($code ?: 500);
  echo $resp ?: json_encode(['error'=>'approve_failed']);
}
