-- ============================================
-- ไฟล์: create_tables_final.sql
-- หน้าที่: สร้างตารางตามโครงสร้างที่มีอยู่ (MySQLi Compatible)
-- ============================================

CREATE DATABASE IF NOT EXISTS nt_tech_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE nt_tech_db;

-- ============================================
-- 1. ตาราง users (ตรงกับ api_login.php)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user VARCHAR(50) NOT NULL UNIQUE COMMENT 'Username สำหรับ Login',
    password VARCHAR(255) NOT NULL COMMENT 'BCrypt Hashed Password',
    depname VARCHAR(100) COMMENT 'ชื่อแผนก/หน่วยงาน',
    depid VARCHAR(10) COMMENT 'รหัสแผนก (01=Admin, อื่นๆ=User)',
    last_login TIMESTAMP NULL DEFAULT NULL COMMENT 'เวลา Login ล่าสุด',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user (user),
    INDEX idx_depid (depid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 2. ตาราง stations
-- ============================================
CREATE TABLE IF NOT EXISTS stations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ลำดับ INT,
    รหัส10หลัก VARCHAR(50),
    ภาคขายและบริการ VARCHAR(100),
    ชื่อย่อสถานที่ VARCHAR(100),
    ชื่อสถานที่ไทย VARCHAR(255),
    ชื่อสถานที่ไทยเดิม VARCHAR(255),
    ชื่อสถานที่อังกฤษ VARCHAR(255),
    ชื่อสถานที่อังกฤษเดิม VARCHAR(255),
    ชื่อบริษัท VARCHAR(255),
    สถานะ VARCHAR(50),
    Homing VARCHAR(100),
    ศูนย์บริการลูกค้า VARCHAR(100),
    `Rank` VARCHAR(50),
    ขนาดเลขหมาย VARCHAR(50),
    โครงการ VARCHAR(255),
    รหัสสถานีฐานบริษัท VARCHAR(100),
    SITE_NAMETH VARCHAR(255),
    SITE_LAT VARCHAR(50),
    SITE_LONG VARCHAR(50),
    SITE_TYPE VARCHAR(100),
    SITE_EQUIPMENT TEXT,
    SITE_TYPE2 VARCHAR(100),
    SITE_OWNER VARCHAR(255),
    สถานที่ติดตั้ง TEXT,
    ซอย VARCHAR(255),
    ถนน VARCHAR(255),
    หมู่บ้าน VARCHAR(255),
    แขวงตำบล VARCHAR(100),
    เขตอำเภอ VARCHAR(100),
    จังหวัด VARCHAR(100),
    รหัสไปรษณีย์ VARCHAR(10),
    Lat DECIMAL(10, 6),
    `Long` DECIMAL(10, 6),
    ส่วนงานผู้ขอรหัส VARCHAR(255),
    วันที่อนุมัติ VARCHAR(50),
    ผู้จัดทำ VARCHAR(255),
    หมายเหตุ TEXT,
    images JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_รหัส10หลัก (รหัส10หลัก),
    INDEX idx_ชื่อสถานที่ไทย (ชื่อสถานที่ไทย),
    INDEX idx_จังหวัด (จังหวัด)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 3. ตาราง equipment_inventory
-- ============================================
CREATE TABLE IF NOT EXISTS equipment_inventory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    station_id INT,
    type VARCHAR(50) NOT NULL COMMENT 'ประเภท: air, battery, generator, etc.',
    brand VARCHAR(100),
    model VARCHAR(100),
    serial_number VARCHAR(100),
    status VARCHAR(50),
    installation_date DATE,
    warranty_expiry DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE,
    INDEX idx_type (type),
    INDEX idx_station (station_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 4. เพิ่มข้อมูล Admin (password: admin123)
-- ============================================
INSERT IGNORE INTO users (user, password, depname, depid) 
VALUES ('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ฝ่ายไอที', '01');

-- เพิ่ม User ทดสอบ (password: user123)
INSERT IGNORE INTO users (user, password, depname, depid) 
VALUES ('nttech', '$2y$10$YourGeneratedHashHere', 'ฝ่ายปฏิบัติการ', '02');

-- ============================================
-- ตรวจสอบผลลัพธ์
-- ============================================
SELECT '✅ ตารางที่สร้าง:' AS status;
SHOW TABLES;

SELECT '✅ โครงสร้างตาราง users:' AS status;
DESCRIBE users;

SELECT '✅ ข้อมูล Admin:' AS status;
SELECT id, user, depname, depid, created_at FROM users;

SELECT '✅ จำนวนข้อมูล:' AS status;
SELECT 
    'users' AS table_name, 
    COUNT(*) AS row_count 
FROM users
UNION ALL
SELECT 'stations', COUNT(*) FROM stations
UNION ALL
SELECT 'equipment_inventory', COUNT(*) FROM equipment_inventory;