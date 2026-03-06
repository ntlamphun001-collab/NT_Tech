-- ============================================
-- ไฟล์: create_stations_detail.sql
-- สร้างตาราง station_details สำหรับเก็บข้อมูล station detail
-- แทนที่ Firebase Firestore collection 'stations'
-- ============================================

USE nt_tech_db;

CREATE TABLE IF NOT EXISTS station_details (
    id          INT AUTO_INCREMENT PRIMARY KEY,

    -- รหัสสถานี (เทียบเท่า Firestore document ID เช่น 'maeta_t', 'lamphun1')
    station_id  VARCHAR(100) NOT NULL UNIQUE  COMMENT 'รหัสสถานี เช่น maeta_t, lamphun1',

    -- ข้อมูลที่อยู่และพิกัด
    address     TEXT                          COMMENT 'ที่อยู่เต็ม',
    latitude    VARCHAR(50)                   COMMENT 'ละติจูด',
    longitude   VARCHAR(50)                   COMMENT 'ลองจิจูด',

    -- รูปภาพ (JSON array [{id, url, name, date}])
    images      JSON,

    -- ข้อมูลรายละเอียด 36 หัวข้อ (ตรงกับ loadMaetaTData dbMap)
    `รหัส10หลัก`              VARCHAR(100),
    `ภาคขายและบริการ`          VARCHAR(200),
    `ชื่อย่อสถานที่`           VARCHAR(100),
    `ชื่อสถานที่ไทย`           VARCHAR(200),
    `ชื่อสถานที่ไทยเดิม`        VARCHAR(200),
    `ชื่อสถานที่อังกฤษ`         VARCHAR(200),
    `ชื่อสถานที่อังกฤษเดิม`     VARCHAR(200),
    `ชื่อบริษัท`               VARCHAR(200),
    `สถานะ`                   VARCHAR(100),
    `Homing`                  VARCHAR(200),
    `ศูนย์บริการลูกค้า`         VARCHAR(200),
    `Rank`                    VARCHAR(50),
    `ขนาดเลขหมาย`             VARCHAR(100),
    `โครงการ`                  VARCHAR(200),
    `รหัสสถานีฐานบริษัท`        VARCHAR(100),
    `SITE_NAMETH`             VARCHAR(200),
    `SITE_LAT`                VARCHAR(50),
    `SITE_LONG`               VARCHAR(50),
    `SITE_TYPE`               VARCHAR(100),
    `SITE_EQUIPMENT`          VARCHAR(200),
    `SITE_TYPE2`              VARCHAR(100),
    `SITE_OWNER`              VARCHAR(200),
    `สถานที่ติดตั้ง`            TEXT,
    `ซอย`                     VARCHAR(200),
    `ถนน`                     VARCHAR(200),
    `หมู่บ้าน`                 VARCHAR(200),
    `แขวง/ตำบล`               VARCHAR(100),
    `เขต/อำเภอ`               VARCHAR(100),
    `จังหวัด`                  VARCHAR(100),
    `รหัสไปรณีย์`              VARCHAR(20),
    `Lat`                     VARCHAR(50),
    `Long`                    VARCHAR(50),
    `ส่วนงานผู้ขอรหัส`          VARCHAR(200),
    `วันที่อนุมัติ`             VARCHAR(50),
    `ผู้จัดทำ`                 VARCHAR(200),
    `หมายเหตุ`                 TEXT,

    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_station_id (station_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SELECT '✅ สร้างตาราง station_details สำเร็จ' AS result;