<?php
/**
 * ============================================
 * api_equipment_inventory.php
 * แทนที่ Firebase Firestore collection 'equipment_inventory'
 * 
 * Actions (POST body: action=...):
 *   fetch   → GET  ข้อมูลตาม station+type  (แทน onSnapshot)
 *   upload  → POST บันทึกหลายรายการ         (แทน uploadDataToFirebase)
 *   save_image → POST บันทึกรูปภาพ          (แทน saveUploadedImage)
 *   delete  → POST ลบรายการเดียว           (แทน deleteEquipmentUnit)
 * ============================================
 */

session_start();
header('Content-Type: application/json; charset=utf-8');

// ✅ ตรวจสอบ Session (แทน firebase.auth().onAuthStateChanged)
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

require_once 'db_connect.php';

$input  = file_get_contents('php://input');
$data   = json_decode($input, true) ?? [];
$action = $data['action'] ?? $_GET['action'] ?? '';

// ============================================
// ACTION: fetch — ดึงข้อมูลตาม station + type
// แทน: db.collection('equipment_inventory').where('station','==',s).where('type','==',t).onSnapshot(...)
// ============================================
if ($action === 'fetch') {
    $station = trim($data['station'] ?? '');
    $type    = trim($data['type']    ?? '');

    if (!$station || !$type) {
        echo json_encode(['success' => false, 'message' => 'กรุณาระบุ station และ type']);
        exit;
    }

    $stmt = $conn->prepare(
        "SELECT * FROM equipment_inventory WHERE station = :station AND type = :type ORDER BY id ASC"
    );
    $stmt->bindValue(':station', $station);
    $stmt->bindValue(':type',    $type);
    $stmt->execute();
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // แปลง images JSON string → array (เหมือน Firebase doc.data())
    foreach ($rows as &$row) {
        $row['images']  = json_decode($row['images'] ?? '[]', true) ?: [];
        $row['_docId']  = $row['doc_id'];   // ให้ JS ใช้เหมือน doc.id
    }

    echo json_encode(['success' => true, 'data' => $rows], JSON_UNESCAPED_UNICODE);
    exit;
}

// ============================================
// ACTION: upload — บันทึกหลายรายการพร้อมกัน
// แทน: collectionRef.doc(docId).set(assetData, { merge: true })
// ============================================
if ($action === 'upload') {
    $station = trim($data['station'] ?? '');
    $type    = trim($data['type']    ?? '');
    $items   = $data['items']  ?? [];

    if (!$station || !$type || empty($items)) {
        echo json_encode(['success' => false, 'message' => 'ข้อมูลไม่ครบ']);
        exit;
    }

    $fields = [
        'newAssetCode','subAssetCode','oldAssetCode','assetDescription','assetSpec',
        'serialNumber','capDate','quantity','unit','acquisitionValue','bookValue',
        'costCenter','assetLocationID','centerCode','remark',
        'peaName','userNumber','location','stationName','stationCode','peaNumber','coordinates'
    ];

    $success = 0;
    $failed  = 0;

    foreach ($items as $item) {
        $docId  = $item['doc_id'] ?? null;
        $images = isset($item['images']) ? json_encode($item['images'], JSON_UNESCAPED_UNICODE) : '[]';

        try {
            // ตรวจสอบว่ามี doc_id นี้อยู่แล้วหรือไม่ (merge: true)
            $check = $conn->prepare(
                "SELECT id FROM equipment_inventory WHERE station=:s AND type=:t AND doc_id=:d LIMIT 1"
            );
            $check->bindValue(':s', $station);
            $check->bindValue(':t', $type);
            $check->bindValue(':d', $docId);
            $check->execute();
            $existing = $check->fetch(PDO::FETCH_ASSOC);

            if ($existing) {
                // UPDATE (merge)
                $setParts = array_map(fn($f) => "`$f` = :$f", $fields);
                $sql = "UPDATE equipment_inventory SET " . implode(', ', $setParts)
                     . ", images = :images WHERE id = :id";
                $stmt = $conn->prepare($sql);
                $stmt->bindValue(':id', $existing['id']);
            } else {
                // INSERT
                $cols     = implode(', ', array_map(fn($f) => "`$f`", $fields));
                $placeholders = implode(', ', array_map(fn($f) => ":$f", $fields));
                $sql = "INSERT INTO equipment_inventory 
                        (station, type, doc_id, $cols, images)
                        VALUES (:station, :type, :doc_id, $placeholders, :images)";
                $stmt = $conn->prepare($sql);
                $stmt->bindValue(':station', $station);
                $stmt->bindValue(':type',    $type);
                $stmt->bindValue(':doc_id',  $docId);
            }

            // Bind ค่าแต่ละฟิลด์
            foreach ($fields as $f) {
                $stmt->bindValue(":$f", isset($item[$f]) && $item[$f] !== '' ? $item[$f] : null);
            }
            $stmt->bindValue(':images', $images);
            $stmt->execute();
            $success++;

        } catch (Exception $e) {
            $failed++;
            error_log("equipment_inventory upload error: " . $e->getMessage());
        }
    }

    echo json_encode([
        'success' => true,
        'message' => "อัปโหลดเสร็จสิ้น",
        'uploaded' => $success,
        'failed'   => $failed
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// ============================================
// ACTION: save_image — บันทึกรูปภาพเข้า images JSON
// แทน: db.collection('equipment_inventory').doc(id).set({ images: [...] }, { merge: true })
// ============================================
if ($action === 'save_image') {
    $station = trim($data['station'] ?? '');
    $type    = trim($data['type']    ?? '');
    $docId   = trim($data['doc_id']  ?? '');
    $images  = $data['images'] ?? [];

    if (!$station || !$type || !$docId) {
        echo json_encode(['success' => false, 'message' => 'ข้อมูลไม่ครบ']);
        exit;
    }

    $imagesJson = json_encode($images, JSON_UNESCAPED_UNICODE);

    // ตรวจสอบว่ามี record นี้แล้วหรือยัง
    $check = $conn->prepare(
        "SELECT id FROM equipment_inventory WHERE station=:s AND type=:t AND doc_id=:d LIMIT 1"
    );
    $check->bindValue(':s', $station);
    $check->bindValue(':t', $type);
    $check->bindValue(':d', $docId);
    $check->execute();
    $existing = $check->fetch(PDO::FETCH_ASSOC);

    if ($existing) {
        $stmt = $conn->prepare(
            "UPDATE equipment_inventory SET images = :images WHERE id = :id"
        );
        $stmt->bindValue(':images', $imagesJson);
        $stmt->bindValue(':id',     $existing['id']);
    } else {
        // สร้าง record ใหม่ถ้าไม่มี (กรณี Upload รูปก่อน upload ข้อมูล)
        $stmt = $conn->prepare(
            "INSERT INTO equipment_inventory (station, type, doc_id, images) VALUES (:s, :t, :d, :images)"
        );
        $stmt->bindValue(':s',      $station);
        $stmt->bindValue(':t',      $type);
        $stmt->bindValue(':d',      $docId);
        $stmt->bindValue(':images', $imagesJson);
    }

    $stmt->execute();
    echo json_encode(['success' => true, 'message' => 'บันทึกรูปภาพสำเร็จ'], JSON_UNESCAPED_UNICODE);
    exit;
}

// ============================================
// ACTION: delete — ลบรายการเดียว
// ============================================
if ($action === 'delete') {
    $id = intval($data['id'] ?? 0);
    if (!$id) {
        echo json_encode(['success' => false, 'message' => 'ไม่ระบุ id']);
        exit;
    }
    $stmt = $conn->prepare("DELETE FROM equipment_inventory WHERE id = :id");
    $stmt->bindValue(':id', $id, PDO::PARAM_INT);
    $stmt->execute();
    echo json_encode(['success' => true, 'message' => 'ลบสำเร็จ'], JSON_UNESCAPED_UNICODE);
    exit;
}

// ============================================
// ACTION: fetch_all_by_type — ดึงอุปกรณ์ทุกชุมสายตาม type (สำหรับ Popup สถิติ)
// ============================================
if ($action === 'fetch_all_by_type') {
    $type = trim($data['type'] ?? '');

    if (!$type) {
        echo json_encode(['success' => false, 'message' => 'กรุณาระบุ type']);
        exit;
    }

    $stmt = $conn->prepare(
        "SELECT * FROM equipment_inventory WHERE type = :type ORDER BY station ASC, id ASC"
    );
    $stmt->bindValue(':type', $type);
    $stmt->execute();
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($rows as &$row) {
        $row['images'] = json_decode($row['images'] ?? '[]', true) ?: [];
        $row['_docId'] = $row['doc_id'];
    }

    echo json_encode(['success' => true, 'data' => $rows], JSON_UNESCAPED_UNICODE);
    exit;
}

echo json_encode(['success' => false, 'message' => 'Unknown action: ' . $action]);
?>