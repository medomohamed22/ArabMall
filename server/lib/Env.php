<?php
// server/lib/Env.php
namespace Env;

function load($path) {
  if (!file_exists($path)) return;
  $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
  foreach ($lines as $line) {
    if (strpos(trim($line), '#') === 0) continue;
    if (!str_contains($line, '=')) continue;
    list($key, $val) = array_map('trim', explode('=', $line, 2));
    if (!array_key_exists($key, $_ENV)) {
      putenv("$key=$val");
      $_ENV[$key] = $val;
    }
  }
}
