-- ============================================
-- ไฟล์: create_equipment_inventory.sql
-- เพิ่มตาราง equipment_inventory ใน nt_tech_db
-- โครงสร้างตรงกับ JS: FIELD_DEFINITIONS ทุกฟิลด์
-- ============================================

USE nt_tech_db;

DROP TABLE IF EXISTS equipment_inventory;

CREATE TABLE equipment_inventory (
    id           INT AUTO_INCREMENT PRIMARY KEY,

    -- กลุ่มข้อมูล (เทียบเท่า Firebase: station, type)
    station      VARCHAR(100) NOT NULL  COMMENT 'รหัสชุมสาย เช่น maeta, lamphun1',
    type         VARCHAR(50)  NOT NULL  COMMENT 'air|battery|generator|transformer|rectifier|peameter|solarcell',
    doc_id       VARCHAR(200)           COMMENT 'ID ที่ JS สร้างขึ้น เช่น 5101_001 หรือ PEA_123456',

    -- ฟิลด์มาตรฐาน (TABLE_CONFIGS.default / FIELD_DEFINITIONS)
    newAssetCode     VARCHAR(100),
    subAssetCode     VARCHAR(100),
    oldAssetCode     VARCHAR(100),
    assetDescription TEXT,
    assetSpec        TEXT,
    serialNumber     VARCHAR(200),
    capDate          VARCHAR(50),
    quantity         VARCHAR(50),
    unit             VARCHAR(50),
    acquisitionValue VARCHAR(100),
    bookValue        VARCHAR(100),
    costCenter       VARCHAR(100),
    assetLocationID  VARCHAR(200),
    centerCode       VARCHAR(100),
    remark           TEXT,

    -- ฟิลด์ PEA Meter (TABLE_CONFIGS.peameter)
    peaName          VARCHAR(200),
    userNumber       VARCHAR(100),
    location         TEXT,
    stationName      VARCHAR(200),
    stationCode      VARCHAR(100),
    peaNumber        VARCHAR(100),
    coordinates      VARCHAR(200),

    -- รูปภาพ (JSON array [{id, url, name, date}])
    images           JSON,

    lastUpdated      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_station_type (station, type),
    INDEX idx_doc_id       (doc_id(100))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SELECT '✅ สร้างตาราง equipment_inventory สำเร็จ' AS result;