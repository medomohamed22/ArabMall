<?php
// server/config.php
// استخدم ملف .env (انسخه من .env.example) لوضع مفاتيحك
require_once __DIR__ . '/lib/Env.php';

$envPath = __DIR__ . '/.env';
\Env\load($envPath);

// Database
define('DB_HOST', getenv('DB_HOST') ?: 'sql302.infinityfree.com	
');
define('DB_NAME', getenv('DB_NAME') ?: 'if0_39724134_transport_system');
define('DB_USER', getenv('DB_USER') ?: 'if0_39724134');
define('DB_PASS', getenv('DB_PASS') ?: 'dNvOKiVIwZ');
define('DB_CHARSET', 'utf8mb4');

// Pi Network
define('PI_API_KEY', getenv('PI_API_KEY') ?: 'a7goaamjuhqn96fbrj4el0l7nrbqxwpmouasit2bklvretgtv1li21n8nzu32ius');
define('PI_API_BASE', getenv('PI_API_BASE') ?: 'https://api.minepi.com/v2'); // اتركها كما هي عادةً
define('PI_APP_ID', getenv('PI_APP_ID') ?: 'YOUR_PI_APP_ID'); // App ID من منصة Pi
define('PI_SANDBOX', getenv('PI_SANDBOX') ?: '1'); // 1 للساندبوكس

// CORS بسيط للـ API
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit;
}
