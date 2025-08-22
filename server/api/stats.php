<?php
// server/api/stats.php
require_once __DIR__ . '/../lib/Database.php';

try {
  $pdo = Database::pdo();

  $row = $pdo->query("SELECT COALESCE(SUM(amount_pi),0) AS total_pi, COUNT(*) AS cnt, MAX(created_at) AS last_at
                      FROM donations")->fetch();
  $total = floatval($row['total_pi'] ?? 0);
  $cnt = intval($row['cnt'] ?? 0);

  $lastDonation = $pdo->query("SELECT amount_pi FROM donations ORDER BY created_at DESC LIMIT 1")->fetch();
  $lastAmount = $lastDonation ? floatval($lastDonation['amount_pi']) : null;

  $uniqueDonors = $pdo->query("SELECT COUNT(DISTINCT uid) AS u FROM donations")->fetch();
  $donors = intval($uniqueDonors['u'] ?? 0);

  echo json_encode([
    'total_pi' => $total,
    'count' => $cnt,
    'unique_donors' => $donors,
    'last_donation_pi' => $lastAmount,
  ]);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(['error'=>'db_error','message'=>$e->getMessage()]);
}
