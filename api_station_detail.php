<?php
/**
 * ============================================
 * api_station_detail.php
 * แทนที่ Firebase Firestore collection 'stations'
 * ใช้กับหน้า station detail ทุกชุมสาย (maeta_t, lamphun1, ฯลฯ)
 *
 * Actions (POST body JSON):
 *   get        → ดึงข้อมูลสถานี (ที่อยู่ พิกัด รูปภาพ รายละเอียด)
 *   save       → บันทึก/อัปเดตข้อมูลสถานี (merge เหมือน Firestore set+merge)
 *   get_counts → นับจำนวนอุปกรณ์แต่ละประเภทของสถานีนั้น
 * ============================================
 */

// ✅ ป้องกัน PHP warning/notice/error ปนออกมาเป็น HTML ก่อน JSON
ob_start();
error_reporting(0);
ini_set('display_errors', 0);

session_start();

// ล้าง output buffer ที่อาจมี HTML error ค้างอยู่ แล้วตั้ง header JSON
ob_clean();
header('Content-Type: application/json; charset=utf-8');

// ✅ ตรวจสอบ Session (แทน firebase.auth().onAuthStateChanged)
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

require_once 'db_connect.php';

$input  = file_get_contents('php://input');
$data   = json_decode($input, true) ?? [];
$action  = $data['action']  ?? '';
$station = trim($data['station'] ?? '');

if (!$station) {
    echo json_encode(['success' => false, 'message' => 'กรุณาระบุ station']);
    exit;
}

// ============================================
// ACTION: get — ดึงข้อมูลสถานี
// แทน: MAETA_T_DOC_REF.get() / db.collection('stations').doc(stationID).get()
// ============================================
if ($action === 'get') {
    $stmt = $conn->prepare(
        "SELECT * FROM station_details WHERE station_id = :station LIMIT 1"
    );
    $stmt->bindValue(':station', $station);
    $stmt->execute();
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($row) {
        // แปลง images JSON string → array
        $row['images'] = json_decode($row['images'] ?? '[]', true) ?: [];
        echo json_encode(['success' => true, 'data' => $row], JSON_UNESCAPED_UNICODE);
    } else {
        // ไม่พบข้อมูล — ส่ง success:true + data:null (JS จะแสดง "-" เหมือน Firestore doc.exists = false)
        echo json_encode(['success' => true, 'data' => null], JSON_UNESCAPED_UNICODE);
    }
    exit;
}

// ============================================
// ACTION: save — บันทึก/อัปเดตข้อมูลสถานี
// แทน: MAETA_T_DOC_REF.set(updatedData, { merge: true })
// รองรับข้อมูลที่บันทึก: address, latitude, longitude, images, ข้อมูลรายละเอียดทุกฟิลด์
// ============================================
if ($action === 'save') {
    $payload = $data['data'] ?? [];

    // ฟิลด์ทั้งหมดที่รองรับ (ตรงกับ FIELD_DEFINITIONS และ loadMaetaTData)
    $textFields = [
        'address', 'latitude', 'longitude',
        'รหัส10หลัก', 'ภาคขายและบริการ', 'ชื่อย่อสถานที่',
        'ชื่อสถานที่ไทย', 'ชื่อสถานที่ไทยเดิม', 'ชื่อสถานที่อังกฤษ', 'ชื่อสถานที่อังกฤษเดิม',
        'ชื่อบริษัท', 'สถานะ', 'Homing', 'ศูนย์บริการลูกค้า', 'Rank', 'ขนาดเลขหมาย',
        'โครงการ', 'รหัสสถานีฐานบริษัท', 'SITE_NAMETH', 'SITE_LAT', 'SITE_LONG',
        'SITE_TYPE', 'SITE_EQUIPMENT', 'SITE_TYPE2', 'SITE_OWNER',
        'สถานที่ติดตั้ง', 'ซอย', 'ถนน', 'หมู่บ้าน', 'แขวง/ตำบล', 'เขต/อำเภอ',
        'จังหวัด', 'รหัสไปรณีย์', 'Lat', 'Long',
        'ส่วนงานผู้ขอรหัส', 'วันที่อนุมัติ', 'ผู้จัดทำ', 'หมายเหตุ'
    ];

    // ตรวจสอบว่ามี record อยู่แล้วหรือยัง
    $check = $conn->prepare(
        "SELECT id FROM station_details WHERE station_id = :station LIMIT 1"
    );
    $check->bindValue(':station', $station);
    $check->execute();
    $existing = $check->fetch(PDO::FETCH_ASSOC);

    try {
        if ($existing) {
            // UPDATE — สร้าง SET clause เฉพาะฟิลด์ที่ส่งมา (merge: true)
            $setParts = [];
            $bindValues = [':station' => $station];

            foreach ($textFields as $i => $f) {
        if (array_key_exists($f, $payload)) {
            $key = ':f_' . $i;          // ← ใช้ index แทน
            $setParts[] = "`$f` = $key";
            $bindValues[$key] = $payload[$f];
                }
            }

            // จัดการ images แยก (JSON)
            if (array_key_exists('images', $payload)) {
                $setParts[] = '`images` = :images';
                $bindValues[':images'] = json_encode($payload['images'], JSON_UNESCAPED_UNICODE);
            }

            if (empty($setParts)) {
                echo json_encode(['success' => true, 'message' => 'ไม่มีข้อมูลที่ต้องอัปเดต']);
                exit;
            }

            $setParts[] = '`updated_at` = NOW()';
            $sql = "UPDATE station_details SET " . implode(', ', $setParts) . " WHERE station_id = :station";
            $stmt = $conn->prepare($sql);
            foreach ($bindValues as $k => $v) {
                $stmt->bindValue($k, $v);
            }
            $stmt->execute();

        } else {
            // INSERT — สร้าง record ใหม่พร้อมข้อมูลทั้งหมด
            $cols     = ['station_id'];
            $vals     = [':station'];
            $bindValues = [':station' => $station];

            foreach ($textFields as $i => $f) {
        if (array_key_exists($f, $payload)) {
            $key = ':f_' . $i;          // ← ใช้ index แทน
            $cols[] = "`$f`";
            $vals[] = $key;
            $bindValues[$key] = $payload[$f];
                }
            }

            if (array_key_exists('images', $payload)) {
                $cols[] = '`images`';
                $vals[] = ':images';
                $bindValues[':images'] = json_encode($payload['images'], JSON_UNESCAPED_UNICODE);
            }

            $sql = "INSERT INTO station_details (" . implode(', ', $cols) . ") VALUES (" . implode(', ', $vals) . ")";
            $stmt = $conn->prepare($sql);
            foreach ($bindValues as $k => $v) {
                $stmt->bindValue($k, $v);
            }
            $stmt->execute();
        }

        echo json_encode(['success' => true, 'message' => 'บันทึกข้อมูลสำเร็จ'], JSON_UNESCAPED_UNICODE);

    } catch (Exception $e) {
        error_log("api_station_detail save error: " . $e->getMessage());
        echo json_encode(['success' => false, 'message' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
    }
    exit;
}

// ============================================
// ACTION: get_counts — นับจำนวนอุปกรณ์แต่ละประเภท
// แทน: db.collection('equipment_inventory').where('station','==',stationID).get()
// ============================================
if ($action === 'get_counts') {
    $types = ['air', 'battery', 'generator', 'transformer', 'rectifier', 'peameter', 'solar', 'property'];
    $counts = [];

    foreach ($types as $type) {
        $stmt = $conn->prepare(
            "SELECT COUNT(*) as cnt FROM equipment_inventory WHERE station = :station AND type = :type"
        );
        $stmt->bindValue(':station', $station);
        $stmt->bindValue(':type',    $type);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        $counts[$type] = (int)($row['cnt'] ?? 0);
    }

    echo json_encode(['success' => true, 'data' => $counts], JSON_UNESCAPED_UNICODE);
    exit;
}

echo json_encode(['success' => false, 'message' => 'Unknown action: ' . $action]);
?>