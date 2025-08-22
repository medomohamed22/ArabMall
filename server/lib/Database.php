<?php
// server/lib/Database.php
require_once __DIR__ . '/../config.php';

class Database {
  private static $pdo = null;

  public static function pdo() {
    if (self::$pdo === null) {
      $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=' . DB_CHARSET;
      $opt = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
      ];
      self::$pdo = new PDO($dsn, DB_USER, DB_PASS, $opt);
    }
    return self::$pdo;
  }
}
