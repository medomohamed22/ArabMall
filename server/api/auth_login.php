<?php
// server/api/auth_login.php
require_once __DIR__ . '/../lib/Database.php';
require_once __DIR__ . '/../config.php';

$input = json_decode(file_get_contents('php://input'), true);
$user = $input['user'] ?? null;
$accessToken = $input['accessToken'] ?? null;

if (!$user || !$accessToken) {
  http_response_code(400);
  echo json_encode(['error' => 'missing_user_or_token']);
  exit;
}

// Verify access token with Pi if needed (optional for basic flow).
// Here we trust Pi Browser; for production, validate token via Pi API if available.

$pdo = Database::pdo();

// Upsert user
$stmt = $pdo->prepare("INSERT INTO users (uid, username, public_key) VALUES (:uid, :username, :public_key)
ON DUPLICATE KEY UPDATE username = VALUES(username), public_key = VALUES(public_key)");
$stmt->execute([
  ':uid' => $user['uid'],
  ':username' => $user['username'] ?? null,
  ':public_key' => $user['public_key'] ?? null
]);

echo json_encode(['ok' => true, 'user' => $user]);
