-- server/db.sql
-- إنشاء قاعدة البيانات والجداول
CREATE DATABASE IF NOT EXISTS pi_donations CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE pi_donations;

CREATE TABLE IF NOT EXISTS users (
  uid VARCHAR(64) PRIMARY KEY,
  username VARCHAR(128),
  public_key TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS donations (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  payment_id VARCHAR(128) UNIQUE,
  uid VARCHAR(64),
  username VARCHAR(128),
  amount_pi DECIMAL(18,8) NOT NULL,
  cause VARCHAR(255),
  memo VARCHAR(255),
  txid VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (uid),
  INDEX (payment_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
