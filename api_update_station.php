<?php
/**
 * ============================================
 * API: api_update_station.php
 * หน้าที่: แก้ไขข้อมูลสถานีใน Database
 * ✅ แก้ไข: ใส่ backtick ครอบคอลัมน์ภาษาไทย
 *           เปลี่ยน Named Param เป็น ASCII
 *           เพิ่ม convertDateToSQL สำหรับวันที่
 * ============================================
 */

session_start();
header('Content-Type: application/json; charset=utf-8');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$json = file_get_contents('php://input');
$data = json_decode($json, true);

if (!$data || !isset($data['id'])) {
    echo json_encode(['success' => false, 'message' => 'Invalid data or missing ID']);
    exit;
}

require_once 'db_connect.php';

// ============================================
// ✅ แปลงวันที่ DD/MM/YYYY (พ.ศ.) → YYYY-MM-DD (ค.ศ.) สำหรับบันทึก DB
// หรือ Excel Serial → YYYY-MM-DD
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
        if ($year > 2300) $year -= 543;   // พ.ศ. → ค.ศ.
        if ($year < 1800 || $year > 2200 || $month < 1 || $month > 12 || $day < 1 || $day > 31) return null;
        return sprintf('%04d-%02d-%02d', $year, $month, $day);
    }

    // รูปแบบ YYYY-MM-DD (ถูกต้องแล้ว)
    if (preg_match('/^(\d{4})-(\d{2})-(\d{2})/', $dateStr, $m)) {
        $year = (int)$m[1]; $month = (int)$m[2]; $day = (int)$m[3];
        if ($year <= 0 || $month === 0 || $day === 0) return null;
        return sprintf('%04d-%02d-%02d', $year, $month, $day);
    }

    // Excel Serial Number (ปี พ.ศ. ใน Serial)
    if (preg_match('/^\d+(\.\d+)?$/', $dateStr)) {
        $serial = (float)$dateStr;
        if ($serial > 1 && $serial < 400000) {
            $unixTime = ($serial - 25569) * 86400;
            $dt = new DateTime('@' . (int)$unixTime);
            $year  = (int)$dt->format('Y');
            $month = (int)$dt->format('m');
            $day   = (int)$dt->format('d');
            if ($year >= 2500) $year -= 543;
            if ($year < 1800 || $year > 2200) return null;
            return sprintf('%04d-%02d-%02d', $year, $month, $day);
        }
    }

    return null;
}

try {
    // ============================================
    // ✅ SQL ใส่ backtick ครอบคอลัมน์ภาษาไทยทั้งหมด
    //    Named Param เปลี่ยนเป็น ASCII (:p1, :p2, ...)
    // ============================================
    $sql = "UPDATE stations SET
        `รหัส10หลัก`            = :p01,
        `ภาคขายและบริการ`        = :p02,
        `ชื่อย่อสถานที่`          = :p03,
        `ชื่อสถานที่ไทย`          = :p04,
        `ชื่อสถานที่ไทยเดิม`      = :p05,
        `ชื่อสถานที่อังกฤษ`       = :p06,
        `ชื่อสถานที่อังกฤษเดิม`   = :p07,
        `ชื่อบริษัท`              = :p08,
        `สถานะ`                  = :p09,
        `Homing`                 = :p10,
        `ศูนย์บริการลูกค้า`       = :p11,
        `Rank`                   = :p12,
        `ขนาดเลขหมาย`            = :p13,
        `โครงการ`                = :p14,
        `รหัสสถานีฐานบริษัท`      = :p15,
        `SITE_NAMETH`            = :p16,
        `SITE_LAT`               = :p17,
        `SITE_LONG`              = :p18,
        `SITE_TYPE`              = :p19,
        `SITE_EQUIPMENT`         = :p20,
        `SITE_OWNER`             = :p21,
        `สถานที่ติดตั้ง`          = :p22,
        `ซอย`                    = :p23,
        `ถนน`                    = :p24,
        `หมู่บ้าน`               = :p25,
        `แขวงตำบล`               = :p26,
        `เขตอำเภอ`               = :p27,
        `จังหวัด`                = :p28,
        `รหัสไปรษณีย์`           = :p29,
        `Lat`                    = :p30,
        `Long`                   = :p31,
        `ส่วนงานผู้ขอรหัส`        = :p32,
        `วันที่อนุมัติ`           = :p33,
        `ผู้จัดทำ`               = :p34,
        `หมายเหตุ`               = :p35,
        updated_at               = NOW()
    WHERE id = :pid";

    $stmt = $conn->prepare($sql);

    // รองรับการสะกดวันที่อนุมัติ 2 แบบ
    $dateRaw = $data['วันที่อนุมัติ'] ?? null;
    // แปลงวันที่ที่ผู้ใช้พิมพ์ในฟอร์ม (DD/MM/YYYY พ.ศ.) → YYYY-MM-DD ค.ศ.
    $dateSql = convertDateToSQL($dateRaw);

    // รองรับทั้ง 2 การสะกดรหัสไปรษณีย์
    $zip = $data['รหัสไปรษณีย์'] ?? $data['รหัสไปรณีย์'] ?? null;

    $stmt->bindValue(':p01', $data['รหัส10หลัก']          ?? null);
    $stmt->bindValue(':p02', $data['ภาคขายและบริการ']      ?? null);
    $stmt->bindValue(':p03', $data['ชื่อย่อสถานที่']        ?? null);
    $stmt->bindValue(':p04', $data['ชื่อสถานที่ไทย']        ?? null);
    $stmt->bindValue(':p05', $data['ชื่อสถานที่ไทยเดิม']    ?? null);
    $stmt->bindValue(':p06', $data['ชื่อสถานที่อังกฤษ']     ?? null);
    $stmt->bindValue(':p07', $data['ชื่อสถานที่อังกฤษเดิม'] ?? null);
    $stmt->bindValue(':p08', $data['ชื่อบริษัท']            ?? null);
    $stmt->bindValue(':p09', $data['สถานะ']                ?? null);
    $stmt->bindValue(':p10', $data['Homing']               ?? null);
    $stmt->bindValue(':p11', $data['ศูนย์บริการลูกค้า']     ?? null);
    $stmt->bindValue(':p12', $data['Rank']                 ?? null);
    $stmt->bindValue(':p13', $data['ขนาดเลขหมาย']          ?? null);
    $stmt->bindValue(':p14', $data['โครงการ']              ?? null);
    $stmt->bindValue(':p15', $data['รหัสสถานีฐานบริษัท']    ?? null);
    $stmt->bindValue(':p16', $data['SITE_NAMETH']          ?? null);
    $stmt->bindValue(':p17', $data['SITE_LAT']             ?? null);
    $stmt->bindValue(':p18', $data['SITE_LONG']            ?? null);
    $stmt->bindValue(':p19', $data['SITE_TYPE']            ?? null);
    $stmt->bindValue(':p20', $data['SITE_EQUIPMENT']       ?? null);
    $stmt->bindValue(':p21', $data['SITE_OWNER']           ?? null);
    $stmt->bindValue(':p22', $data['สถานที่ติดตั้ง']        ?? null);
    $stmt->bindValue(':p23', $data['ซอย']                  ?? null);
    $stmt->bindValue(':p24', $data['ถนน']                  ?? null);
    $stmt->bindValue(':p25', $data['หมู่บ้าน']             ?? null);
    $stmt->bindValue(':p26', $data['แขวงตำบล']             ?? null);
    $stmt->bindValue(':p27', $data['เขตอำเภอ']             ?? null);
    $stmt->bindValue(':p28', $data['จังหวัด']              ?? null);
    $stmt->bindValue(':p29', $zip);
    $stmt->bindValue(':p30', $data['Lat']                  ?? null);
    $stmt->bindValue(':p31', $data['Long']                 ?? null);
    $stmt->bindValue(':p32', $data['ส่วนงานผู้ขอรหัส']      ?? null);
    $stmt->bindValue(':p33', $dateSql);   // ✅ วันที่แปลงแล้ว
    $stmt->bindValue(':p34', $data['ผู้จัดทำ']              ?? null);
    $stmt->bindValue(':p35', $data['หมายเหตุ']              ?? null);
    $stmt->bindValue(':pid', $data['id']);

    $stmt->execute();

    echo json_encode([
        'success' => true,
        'message' => 'Station updated successfully'
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>