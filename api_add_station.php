<?php
/**
 * ============================================
 * API: api_add_station.php
 * หน้าที่: เพิ่มข้อมูลสถานีใหม่เข้า Database
 * ============================================
 */

session_start();
header('Content-Type: application/json; charset=utf-8');

// ตรวจสอบ Session
if (!isset($_SESSION['user_id'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Unauthorized'
    ]);
    exit;
}

// รับข้อมูล JSON
$json = file_get_contents('php://input');
$data = json_decode($json, true);

if (!$data) {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid JSON data'
    ]);
    exit;
}

// เชื่อมต่อ Database
require_once 'db_connect.php';

try {
    // ============================================
    // เตรียม SQL Statement (37 ฟิลด์ + images)
    // ============================================
    $sql = "INSERT INTO stations (
        ลำดับ, รหัส10หลัก, ภาคขายและบริการ, ชื่อย่อสถานที่, 
        ชื่อสถานที่ไทย, ชื่อสถานที่ไทยเดิม, ชื่อสถานที่อังกฤษ, ชื่อสถานที่อังกฤษเดิม,
        ชื่อบริษัท, สถานะ, Homing, ศูนย์บริการลูกค้า,
        `Rank`, ขนาดเลขหมาย, โครงการ, รหัสสถานีฐานบริษัท,
        SITE_NAMETH, SITE_LAT, SITE_LONG, SITE_TYPE,
        SITE_EQUIPMENT, SITE_TYPE2, SITE_OWNER, สถานที่ติดตั้ง,
        ซอย, ถนน, หมู่บ้าน, แขวงตำบล,
        เขตอำเภอ, จังหวัด, รหัสไปรษณีย์, Lat,
        `Long`, ส่วนงานผู้ขอรหัส, วันที่อนุมัติ, ผู้จัดทำ,
        หมายเหตุ, images, created_at, updated_at
    ) VALUES (
        :lam_dub, :rahat10, :phak, :chueyostation,
        :chueth, :chuethkao, :chueen, :chueenkao,
        :borrisat, :status, :Homing, :servicecenter,
        :Rank, :khanat, :project, :rahatbase,
        :SITE_NAMETH, :SITE_LAT, :SITE_LONG, :SITE_TYPE,
        :SITE_EQUIPMENT, :SITE_TYPE2, :SITE_OWNER, :location,
        :soi, :road, :village, :tambon,
        :amphoe, :province, :zipcode, :Lat,
        :Long, :dept, :approve_date, :creator,
        :note, :images, NOW(), NOW()
    )";
    
    $stmt = $conn->prepare($sql);
    
    // ============================================
    // ฟังก์ชันแปลงวันที่ → YYYY-MM-DD (ค.ศ.) สำหรับ MariaDB
    // รองรับ: DD/MM/YYYY (พ.ศ./ค.ศ.), YYYY-MM-DD, Excel Serial Number
    // ============================================
    function convertDateToSQL($dateStr) {
        if ($dateStr === null || $dateStr === '' || $dateStr === '-' || $dateStr === 'null') {
            return null;
        }
        $dateStr = trim((string)$dateStr);

        // รูปแบบ DD/MM/YYYY (พ.ศ. หรือ ค.ศ.)
        if (preg_match('/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/', $dateStr, $m)) {
            $day   = (int)$m[1];
            $month = (int)$m[2];
            $year  = (int)$m[3];
            if ($year > 2300) $year -= 543; // พ.ศ. → ค.ศ.
            if ($year < 1800 || $year > 2200 || $month < 1 || $month > 12 || $day < 1 || $day > 31) return null;
            return sprintf('%04d-%02d-%02d', $year, $month, $day);
        }

        // รูปแบบ YYYY-MM-DD (ค.ศ. แล้ว)
        if (preg_match('/^(\d{4})-(\d{2})-(\d{2})/', $dateStr, $m)) {
            $year = (int)$m[1]; $month = (int)$m[2]; $day = (int)$m[3];
            if ($year === 0 || $month === 0 || $day === 0) return null;
            if ($year === 1900 && $month === 1 && $day <= 1) return null;
            return sprintf('%04d-%02d-%02d', $year, $month, $day);
        }

        // Excel Serial Number (ตัวเลขล้วน เช่น 235832)
        // รองรับ Excel Serial Number เช่น 235832, 198329
        // เหตุ: Excel ไทยเก็บวันที่เป็นปี พ.ศ. ใน Serial โดยตรง
        // Serial 235832 => epoch+serial = 2545-09-06 (ปี พ.ศ.) => -543 => 2002-09-06 (ค.ศ.)
        // Serial 198329 => epoch+serial = 2443-01-01 (ปี พ.ศ.) => -543 => 1900-01-01 (ค.ศ.)
        if (preg_match('/^\d+(\.\d+)?$/', $dateStr)) {
            $serial = (float)$dateStr;
            if ($serial > 1 && $serial < 400000) {
                $unixTime = ($serial - 25569) * 86400;
                $dt = new DateTime('@' . (int)$unixTime);
                $year  = (int)$dt->format('Y');
                $month = (int)$dt->format('m');
                $day   = (int)$dt->format('d');
                // ถ้าปีที่ได้ >= 2500 = ปี พ.ศ. ให้แปลงเป็น ค.ศ.
                if ($year >= 2500) {
                    $year -= 543;
                    if ($year < 1800 || $year > 2200) return null;
                    return sprintf('%04d-%02d-%02d', $year, $month, $day);
                }
                // ปี ค.ศ. อยู่แล้ว (<2500)
                if ($year < 1800 || $year > 2200) return null;
                return sprintf('%04d-%02d-%02d', $year, $month, $day);
            }
        }

        return null;
    }

    // ============================================
    // Bind Parameters (ใช้ชื่อ ASCII เพื่อหลีกเลี่ยงปัญหา PDO + ภาษาไทย)
    // ============================================
    $stmt->bindValue(':lam_dub',       $data['ลำดับ'] ?? null);
    $stmt->bindValue(':rahat10',       $data['รหัส10หลัก'] ?? null);
    $stmt->bindValue(':phak',          $data['ภาคขายและบริการ'] ?? null);
    $stmt->bindValue(':chueyostation', $data['ชื่อย่อสถานที่'] ?? null);
    $stmt->bindValue(':chueth',        $data['ชื่อสถานที่ไทย'] ?? null);
    $stmt->bindValue(':chuethkao',     $data['ชื่อสถานที่ไทยเดิม'] ?? null);
    $stmt->bindValue(':chueen',        $data['ชื่อสถานที่อังกฤษ'] ?? null);
    $stmt->bindValue(':chueenkao',     $data['ชื่อสถานที่อังกฤษเดิม'] ?? null);
    $stmt->bindValue(':borrisat',      $data['ชื่อบริษัท'] ?? null);
    $stmt->bindValue(':status',        $data['สถานะ'] ?? null);
    $stmt->bindValue(':Homing',        $data['Homing'] ?? null);
    $stmt->bindValue(':servicecenter', $data['ศูนย์บริการลูกค้า'] ?? null);
    $stmt->bindValue(':Rank',          $data['Rank'] ?? null);
    $stmt->bindValue(':khanat',        $data['ขนาดเลขหมาย'] ?? null);
    $stmt->bindValue(':project',       $data['โครงการ'] ?? null);
    $stmt->bindValue(':rahatbase',     $data['รหัสสถานีฐานบริษัท'] ?? null);
    $stmt->bindValue(':SITE_NAMETH',   $data['SITE_NAMETH'] ?? null);
    $stmt->bindValue(':SITE_LAT',      $data['SITE_LAT'] ?? null);
    $stmt->bindValue(':SITE_LONG',     $data['SITE_LONG'] ?? null);
    $stmt->bindValue(':SITE_TYPE',     $data['SITE_TYPE'] ?? null);
    $stmt->bindValue(':SITE_EQUIPMENT',$data['SITE_EQUIPMENT'] ?? null);
    $stmt->bindValue(':SITE_TYPE2',    $data['SITE_TYPE2'] ?? null);
    $stmt->bindValue(':SITE_OWNER',    $data['SITE_OWNER'] ?? null);
    $stmt->bindValue(':location',      $data['สถานที่ติดตั้ง'] ?? null);
    $stmt->bindValue(':soi',           $data['ซอย'] ?? null);
    $stmt->bindValue(':road',          $data['ถนน'] ?? null);
    $stmt->bindValue(':village',       $data['หมู่บ้าน'] ?? null);
    $stmt->bindValue(':tambon',        $data['แขวงตำบล'] ?? null);
    $stmt->bindValue(':amphoe',        $data['เขตอำเภอ'] ?? null);
    $stmt->bindValue(':province',      $data['จังหวัด'] ?? null);
    // รองรับทั้ง 2 การสะกด (ไปรณีย์ และ ไปรษณีย์)
    $zipcode = $data['รหัสไปรษณีย์'] ?? $data['รหัสไปรณีย์'] ?? null;
    $stmt->bindValue(':zipcode',       $zipcode);
    $stmt->bindValue(':Lat',           $data['Lat'] ?? null);
    $stmt->bindValue(':Long',          $data['Long'] ?? null);
    $stmt->bindValue(':dept',          $data['ส่วนงานผู้ขอรหัส'] ?? null);
    // แปลงวันที่เป็น YYYY-MM-DD ก่อนบันทึก
    $stmt->bindValue(':approve_date',  convertDateToSQL($data['วันที่อนุมัติ'] ?? null));
    $stmt->bindValue(':creator',       $data['ผู้จัดทำ'] ?? null);
    $stmt->bindValue(':note',          $data['หมายเหตุ'] ?? null);
    
    // แปลง Array images เป็น JSON String
    $images = isset($data['images']) && is_array($data['images']) 
        ? json_encode($data['images'], JSON_UNESCAPED_UNICODE) 
        : '[]';
    $stmt->bindValue(':images', $images);
    
    // ============================================
    // Execute
    // ============================================
    $stmt->execute();
    
    echo json_encode([
        'success' => true,
        'message' => 'Station added successfully',
        'id' => $conn->lastInsertId()
    ], JSON_UNESCAPED_UNICODE);
    
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>