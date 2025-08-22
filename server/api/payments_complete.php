<?php
// server/api/payments_complete.php
require_once __DIR__ . '/../lib/Database.php';
require_once __DIR__ . '/../config.php';

$input = json_decode(file_get_contents('php://input'), true);
$paymentId = $input['paymentId'] ?? null;
$txid = $input['txid'] ?? null;
$amount = floatval($input['amount'] ?? 0);
$cause = $input['cause'] ?? 'تبرع';
$memo = $input['memo'] ?? 'تبرع';

if (!$paymentId) { http_response_code(400); echo json_encode(['error'=>'missing_paymentId']); exit; }

// Complete via Pi API
$ch = curl_init(PI_API_BASE . '/payments/' . urlencode($paymentId) . '/complete');
curl_setopt_array($ch, [
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_POST => true,
  CURLOPT_HTTPHEADER => [
    'Authorization: Key ' . PI_API_KEY,
    'Content-Type: application/json'
  ],
  CURLOPT_POSTFIELDS => json_encode(['txid' => $txid]),
]);
$resp = curl_exec($ch);
$code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if (!($code >= 200 && $code < 300)) {
  http_response_code($code ?: 500);
  echo $resp ?: json_encode(['error'=>'complete_failed']);
  exit;
}

// Fetch payment info to persist
$ch = curl_init(PI_API_BASE . '/payments/' . urlencode($paymentId));
curl_setopt_array($ch, [
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_HTTPHEADER => [
    'Authorization: Key ' . PI_API_KEY,
    'Content-Type: application/json'
  ],
]);
$paymentInfo = curl_exec($ch);
$code2 = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);
if (!($code2 >= 200 && $code2 < 300)) {
  // still return ok but without storing
  echo json_encode(['ok'=>true, 'warning'=>'store_skipped']);
  exit;
}

$payment = json_decode($paymentInfo, true);

// Store donation
$pdo = Database::pdo();
$stmt = $pdo->prepare("INSERT INTO donations (payment_id, uid, username, amount_pi, cause, memo, txid) VALUES (:payment_id, :uid, :username, :amount_pi, :cause, :memo, :txid)
ON DUPLICATE KEY UPDATE txid = VALUES(txid), amount_pi = VALUES(amount_pi)");
$stmt->execute([
  ':payment_id' => $paymentId,
  ':uid' => $payment['user_uid'] ?? null,
  ':username' => $payment['user']['username'] ?? null,
  ':amount_pi' => $amount ?: ($payment['amount'] ?? 0),
  ':cause' => $cause,
  ':memo' => $memo,
  ':txid' => $txid ?? ($payment['transaction']['txid'] ?? null),
]);

echo json_encode(['ok'=>true]);
