<?php
/**
 * ============================================
 * API: api_get_stations.php (แก้ไขเพิ่ม ?code=)
 * หน้าที่: ดึงข้อมูลสถานี (ทั้งหมด หรือ กรองตามรหัส)
 * ============================================
 */

session_start();
header('Content-Type: application/json; charset=utf-8');

// ตรวจสอบ Session
if (!isset($_SESSION['user_id'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Unauthorized - Please login first'
    ]);
    exit;
}

require_once 'db_connect.php';

// ============================================
// ✅ ฟังก์ชัน clean ค่าวันที่จาก DB
// แปลง 0000-00-00 / null / invalid → null
// และแปลง YYYY-MM-DD (ค.ศ.) → DD/MM/YYYY (พ.ศ.)
// ============================================
function formatDateFromDB($dateVal) {
    if ($dateVal === null || $dateVal === '' || $dateVal === '0000-00-00' || $dateVal === '0000-00-00 00:00:00') {
        return null;
    }

    // จับรูปแบบ YYYY-MM-DD
    if (preg_match('/^(\d{4})-(\d{2})-(\d{2})/', $dateVal, $m)) {
        $year  = (int)$m[1];
        $month = (int)$m[2];
        $day   = (int)$m[3];

        // กรอง invalid date
        if ($year === 0 || $month === 0 || $day === 0) return null;

        // ✅ ถ้าปีใน DB >= 2300 = พ.ศ. หลุดเข้ามา → แปลงกลับเป็น ค.ศ. ก่อน
         if ($year >= 2300) $year -= 543;

        if ($year < 1800 || $year > 2200) return null;

        // แปลง ค.ศ. → พ.ศ.
        $yearBE = $year + 543;

        return sprintf('%02d/%02d/%04d', $day, $month, $yearBE);
    }

    // รองรับ Excel Serial ที่หลุดเข้า DB เป็น String
    if (preg_match('/^\d+$/', trim((string)$dateVal))) {
        $serial = (float)$dateVal;
        if ($serial > 1 && $serial < 400000) {
            $unixTime = ($serial - 25569) * 86400;
            $dt = new DateTime('@' . (int)$unixTime);
            $year  = (int)$dt->format('Y');
            $month = (int)$dt->format('m');
            $day   = (int)$dt->format('d');
            if ($year >= 2300) $year -= 543;
            if ($year < 1800 || $year > 2200) return null;
            $yearBE = $year + 543;
            return sprintf('%02d/%02d/%04d', $day, $month, $yearBE);
        }
        return null;
    }

    // ถ้าเป็นรูปแบบอื่นหรือแปลงไม่ได้ ส่งค่าเดิม
    return $dateVal;
}

// ============================================
// ✅ clean ทุก row ก่อนส่ง JSON
// ============================================
function cleanStation($row) {
    // แปลงวันที่
    $row['วันที่อนุมัติ'] = formatDateFromDB($row['วันที่อนุมัติ'] ?? null);

    // แปลง images จาก JSON string → array
    if (isset($row['images'])) {
        $decoded = json_decode($row['images'], true);
        $row['images'] = is_array($decoded) ? $decoded : [];
    } else {
        $row['images'] = [];
    }

    return $row;
}

try {
    // ✅ ถ้ามี ?code= ให้กรองตามรหัส 10 หลัก
    if (isset($_GET['code']) && !empty($_GET['code'])) {
        $code = clean_input($_GET['code']);

        $sql = "SELECT * FROM stations WHERE รหัส10หลัก = :code LIMIT 1";
        $stmt = $conn->prepare($sql);
        $stmt->bindValue(':code', $code, PDO::PARAM_STR);
        $stmt->execute();

        $stations = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $stations = array_map('cleanStation', $stations);

        echo json_encode([
            'success' => true,
            'data'    => $stations,
            'count'   => count($stations)
        ], JSON_UNESCAPED_UNICODE);
    }

    // ดึงข้อมูลทั้งหมด
    else {
        $sql = "SELECT * FROM stations ORDER BY ลำดับ ASC";
        $stmt = $conn->prepare($sql);
        $stmt->execute();

        $stations = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $stations = array_map('cleanStation', $stations);

        echo json_encode([
            'success' => true,
            'data'    => $stations,
            'count'   => count($stations)
        ], JSON_UNESCAPED_UNICODE);
    }

} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>