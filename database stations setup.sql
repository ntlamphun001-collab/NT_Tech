-- ============================================
-- ไฟล์: database_stations_setup.sql
-- หน้าที่: สร้างฐานข้อมูลสำหรับระบบชุมสาย
-- ============================================

USE nt_tech_db;

-- ============================================
-- 1. ตารางชุมสาย (Stations)
-- [แก้ไข] เปลี่ยนคอลัมน์เป็นภาษาไทยให้ตรงกับ api_add_station.php
-- ============================================
DROP TABLE IF EXISTS stations;
CREATE TABLE IF NOT EXISTS stations (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    ลำดับ INT NULL,
    รหัส10หลัก VARCHAR(50) NULL,
    ภาคขายและบริการ VARCHAR(100) NULL,
    ชื่อย่อสถานที่ VARCHAR(100) NULL,
    ชื่อสถานที่ไทย VARCHAR(255) NULL,
    ชื่อสถานที่ไทยเดิม VARCHAR(255) NULL,
    ชื่อสถานที่อังกฤษ VARCHAR(255) NULL,
    ชื่อสถานที่อังกฤษเดิม VARCHAR(255) NULL,
    ชื่อบริษัท VARCHAR(255) NULL,
    สถานะ VARCHAR(50) NULL,
    Homing VARCHAR(100) NULL,
    ศูนย์บริการลูกค้า VARCHAR(100) NULL,
    `Rank` VARCHAR(50) NULL,
    ขนาดเลขหมาย VARCHAR(50) NULL,
    โครงการ VARCHAR(255) NULL,
    รหัสสถานีฐานบริษัท VARCHAR(100) NULL,
    SITE_NAMETH VARCHAR(255) NULL,
    SITE_LAT VARCHAR(50) NULL,
    SITE_LONG VARCHAR(50) NULL,
    SITE_TYPE VARCHAR(100) NULL,
    SITE_EQUIPMENT TEXT NULL,
    SITE_TYPE2 VARCHAR(100) NULL,
    SITE_OWNER VARCHAR(255) NULL,
    สถานที่ติดตั้ง TEXT NULL,
    ซอย VARCHAR(255) NULL,
    ถนน VARCHAR(255) NULL,
    หมู่บ้าน VARCHAR(255) NULL,
    แขวงตำบล VARCHAR(255) NULL,
    เขตอำเภอ VARCHAR(255) NULL,
    จังหวัด VARCHAR(100) NULL,
    รหัสไปรษณีย์ VARCHAR(10) NULL,
    Lat DECIMAL(10,6) NULL,
    `Long` DECIMAL(10,6) NULL,
    ส่วนงานผู้ขอรหัส VARCHAR(255) NULL,
    วันที่อนุมัติ DATE NULL,
    ผู้จัดทำ VARCHAR(255) NULL,
    หมายเหตุ TEXT NULL,
    images LONGTEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_รหัส10หลัก (รหัส10หลัก),
    INDEX idx_ชื่อสถานที่ไทย (ชื่อสถานที่ไทย),
    INDEX idx_จังหวัด (จังหวัด)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 2. ตารางอุปกรณ์ (Equipment)
-- ============================================
CREATE TABLE IF NOT EXISTS equipment (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    station_id INT(11),                          -- Foreign Key ไปยังตาราง stations
    equipment_name VARCHAR(200) NOT NULL,        -- ชื่ออุปกรณ์
    equipment_type VARCHAR(100),                 -- ประเภทอุปกรณ์ (Router, Switch, ฯลฯ)
    brand VARCHAR(100),                          -- ยี่ห้อ
    model VARCHAR(100),                          -- รุ่น
    serial_number VARCHAR(100),                  -- Serial Number
    mac_address VARCHAR(100),                    -- MAC Address
    ip_address VARCHAR(50),                      -- IP Address
    purchase_date DATE,                          -- วันที่ซื้อ
    warranty_expire DATE,                        -- วันที่หมดประกัน
    install_date DATE,                           -- วันที่ติดตั้ง
    status VARCHAR(50) DEFAULT 'ใช้งาน',         -- สถานะ (ใช้งาน, ชำรุด, ซ่อม, ฯลฯ)
    location_detail VARCHAR(200),                -- ตำแหน่งติดตั้ง
    price DECIMAL(15,2),                         -- ราคา
    notes TEXT,                                  -- หมายเหตุ
    image_url TEXT,                              -- URL รูปภาพ (Cloudinary)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE,
    INDEX idx_equipment_type (equipment_type),
    INDEX idx_station_id (station_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 3. ตารางรูปภาพอุปกรณ์ (Equipment Images)
-- ============================================
CREATE TABLE IF NOT EXISTS equipment_images (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    equipment_id INT(11) NOT NULL,               -- Foreign Key ไปยังตาราง equipment
    image_url TEXT NOT NULL,                     -- URL รูปภาพ (Cloudinary)
    image_name VARCHAR(200),                     -- ชื่อไฟล์
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE CASCADE,
    INDEX idx_equipment_id (equipment_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 4. เพิ่มข้อมูลตัวอย่างชุมสาย
-- [แก้ไข] ใช้คอลัมน์ภาษาไทยให้ตรงกับโครงสร้างใหม่
-- ============================================
INSERT INTO stations (ลำดับ, รหัส10หลัก, ชื่อย่อสถานที่, ชื่อสถานที่ไทย, จังหวัด, สถานะ) VALUES
(1, '5101000001', 'MT-T',  'แม่ทา(T)',       'ลำพูน', 'active'),
(2, '5101000002', 'LP1',   'ลำพูน1',         'ลำพูน', 'active'),
(3, '5101000003', 'MKJ',   'มะเขือแจ้',      'ลำพูน', 'active'),
(4, '5101000004', 'UMG',   'อุโมงค์',        'ลำพูน', 'active'),
(5, '5101000005', 'NKM',   'นิคมลำพูน',      'ลำพูน', 'active'),
(6, '5101000006', 'LP2',   'ลำพูน2',         'ลำพูน', 'active'),
(7, '5101000007', 'PSK',   'ป่าสัก(ลำพูน)',  'ลำพูน', 'active')
ON DUPLICATE KEY UPDATE ชื่อสถานที่ไทย=VALUES(ชื่อสถานที่ไทย);

-- ============================================
-- 5. แสดงข้อมูลทั้งหมด
-- ============================================
SELECT 'Stations:' AS info;
SELECT * FROM stations;

SELECT 'Equipment:' AS info;
SELECT * FROM equipment;

SELECT 'Equipment Images:' AS info;
SELECT * FROM equipment_images;