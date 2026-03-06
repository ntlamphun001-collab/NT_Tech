<?php
/**
 * ============================================
 * API: api_properties.php
 * หน้าที่: จัดการข้อมูล Property (ที่ดินและสินทรัพย์)
 *
 * ✅ รองรับ Operations:
 * - GET    : ดึงข้อมูลทั้งหมด
 * - POST   : เพิ่ม / upsert (ถ้า seq ซ้ำ = update)
 * - PUT    : แก้ไขตาม id
 * - DELETE : ลบตาม id
 *
 * ✅ อัปเดต: เพิ่มคอลัมน์ใหม่
 *    station_code, chanod, owner_dept, tax_year, images_items, images_chanod
 * ============================================
 */

session_start();
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ตรวจสอบ Session
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

require_once 'db_connect.php';

$method = $_SERVER['REQUEST_METHOD'];

// ── helpers ─────────────────────────────────────────────────
function cleanStr($v) {
    if ($v === null || $v === '' || $v === 'null') return null;
    return trim((string)$v);
}
function cleanNum($v) {
    if ($v === null || $v === '' || $v === 'null') return null;
    $n = filter_var($v, FILTER_VALIDATE_FLOAT);
    return $n !== false ? $n : null;
}
// ✅ ใหม่: แปลง JSON column → array (ป้องกัน error ถ้าค่าเป็น null หรือ string ว่าง)
function decodeJson($v) {
    if ($v === null || $v === '') return [];
    $decoded = json_decode($v, true);
    return is_array($decoded) ? $decoded : [];
}

// ============================================
// GET — ดึงข้อมูลทั้งหมด
// ============================================
if ($method === 'GET') {
    try {
        $stmt = $conn->prepare("SELECT * FROM properties ORDER BY seq ASC");
        $stmt->execute();
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($rows as &$r) {
            // แปลงตัวเลข
            $r['rent']     = $r['rent']     !== null ? (float)$r['rent']     : 0;
            $r['appraise'] = $r['appraise'] !== null ? (float)$r['appraise'] : 0;
            $r['lat']      = $r['lat']      !== null ? (float)$r['lat']      : 0;
            $r['lon']      = $r['lon']      !== null ? (float)$r['lon']      : 0;
            $r['seq']      = $r['seq']      !== null ? (int)$r['seq']        : 0;

            // ✅ ใหม่: แปลง JSON รูปภาพ → array
            $r['images_items']  = decodeJson($r['images_items']  ?? null);
            $r['images_chanod'] = decodeJson($r['images_chanod'] ?? null);
        }
        unset($r);

        echo json_encode([
            'success' => true,
            'data'    => $rows,
            'count'   => count($rows)
        ], JSON_UNESCAPED_UNICODE);

    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
    }
    exit;
}

// ============================================
// POST — เพิ่ม / upsert (seq ซ้ำ = update)
// ============================================
if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!$data) {
        echo json_encode(['success' => false, 'message' => 'Invalid JSON data']);
        exit;
    }

    // ── ฟิลด์เดิม ──
    $seq        = cleanNum($data['seq']        ?? null);
    $name       = cleanStr($data['name']       ?? null);
    $amphoe     = cleanStr($data['amphoe']     ?? null);
    $changwat   = cleanStr($data['changwat']   ?? null);
    $land_type  = cleanStr($data['landType']   ?? null);
    $area       = cleanStr($data['area']       ?? null);
    $doc_right  = cleanStr($data['docRight']   ?? null);
    $rent       = cleanNum($data['rent']       ?? null);
    $appraise   = cleanNum($data['appraise']   ?? null);
    $lat        = cleanNum($data['lat']        ?? null);
    $lon        = cleanNum($data['lon']        ?? null);
    $status     = cleanStr($data['status']     ?? 'ใช้งานเต็มพื้นที่');
    $tax        = cleanStr($data['tax']        ?? null);
    $tamlae     = cleanStr($data['tamlae']     ?? null);
    $items      = cleanStr($data['items']      ?? null);
    $note       = cleanStr($data['note']       ?? null);
    $suggestion = cleanStr($data['suggestion'] ?? null);

    // ✅ ฟิลด์ใหม่
    $station_code   = cleanStr($data['station_code']   ?? null);
    $chanod         = cleanStr($data['chanod']         ?? null);
    $owner_dept     = cleanStr($data['owner_dept']     ?? null);
    $tax_year       = cleanStr($data['tax_year']       ?? null);
    $images_items   = isset($data['images_items'])   ? json_encode($data['images_items'],   JSON_UNESCAPED_UNICODE) : null;
    $images_chanod  = isset($data['images_chanod'])  ? json_encode($data['images_chanod'],  JSON_UNESCAPED_UNICODE) : null;

    try {
        // ตรวจ seq ว่ามีอยู่แล้วหรือไม่
        $existing = false;
        if ($seq !== null) {
            $check = $conn->prepare("SELECT id FROM properties WHERE seq = :seq");
            $check->bindValue(':seq', $seq);
            $check->execute();
            $existing = $check->fetch(PDO::FETCH_ASSOC);
        }

        if ($existing) {
            // ── UPDATE ──
            $stmt = $conn->prepare("
                UPDATE properties SET
                    name          = :name,         amphoe        = :amphoe,
                    changwat      = :changwat,      land_type     = :land_type,
                    area          = :area,          doc_right     = :doc_right,
                    rent          = :rent,          appraise      = :appraise,
                    lat           = :lat,           lon           = :lon,
                    status        = :status,        tax           = :tax,
                    tamlae        = :tamlae,        items         = :items,
                    note          = :note,          suggestion    = :suggestion,
                    station_code  = :station_code,  chanod        = :chanod,
                    owner_dept    = :owner_dept,    tax_year      = :tax_year,
                    images_items  = :images_items,  images_chanod = :images_chanod,
                    updated_at    = NOW()
                WHERE seq = :seq
            ");
            $stmt->bindValue(':seq',           $seq);
            $stmt->bindValue(':name',          $name);
            $stmt->bindValue(':amphoe',        $amphoe);
            $stmt->bindValue(':changwat',      $changwat);
            $stmt->bindValue(':land_type',     $land_type);
            $stmt->bindValue(':area',          $area);
            $stmt->bindValue(':doc_right',     $doc_right);
            $stmt->bindValue(':rent',          $rent);
            $stmt->bindValue(':appraise',      $appraise);
            $stmt->bindValue(':lat',           $lat);
            $stmt->bindValue(':lon',           $lon);
            $stmt->bindValue(':status',        $status);
            $stmt->bindValue(':tax',           $tax);
            $stmt->bindValue(':tamlae',        $tamlae);
            $stmt->bindValue(':items',         $items);
            $stmt->bindValue(':note',          $note);
            $stmt->bindValue(':suggestion',    $suggestion);
            // ✅ ใหม่
            $stmt->bindValue(':station_code',  $station_code);
            $stmt->bindValue(':chanod',        $chanod);
            $stmt->bindValue(':owner_dept',    $owner_dept);
            $stmt->bindValue(':tax_year',      $tax_year);
            $stmt->bindValue(':images_items',  $images_items);
            $stmt->bindValue(':images_chanod', $images_chanod);
            $stmt->execute();

            echo json_encode(['success' => true, 'action' => 'updated', 'seq' => $seq], JSON_UNESCAPED_UNICODE);

        } else {
            // ── INSERT ──
            $stmt = $conn->prepare("
                INSERT INTO properties
                    (seq, name, amphoe, changwat, land_type, area, doc_right,
                     rent, appraise, lat, lon, status, tax, tamlae, items,
                     note, suggestion,
                     station_code, chanod, owner_dept, tax_year,
                     images_items, images_chanod,
                     created_at, updated_at)
                VALUES
                    (:seq, :name, :amphoe, :changwat, :land_type, :area, :doc_right,
                     :rent, :appraise, :lat, :lon, :status, :tax, :tamlae, :items,
                     :note, :suggestion,
                     :station_code, :chanod, :owner_dept, :tax_year,
                     :images_items, :images_chanod,
                     NOW(), NOW())
            ");
            $stmt->bindValue(':seq',           $seq);
            $stmt->bindValue(':name',          $name);
            $stmt->bindValue(':amphoe',        $amphoe);
            $stmt->bindValue(':changwat',      $changwat);
            $stmt->bindValue(':land_type',     $land_type);
            $stmt->bindValue(':area',          $area);
            $stmt->bindValue(':doc_right',     $doc_right);
            $stmt->bindValue(':rent',          $rent);
            $stmt->bindValue(':appraise',      $appraise);
            $stmt->bindValue(':lat',           $lat);
            $stmt->bindValue(':lon',           $lon);
            $stmt->bindValue(':status',        $status);
            $stmt->bindValue(':tax',           $tax);
            $stmt->bindValue(':tamlae',        $tamlae);
            $stmt->bindValue(':items',         $items);
            $stmt->bindValue(':note',          $note);
            $stmt->bindValue(':suggestion',    $suggestion);
            // ✅ ใหม่
            $stmt->bindValue(':station_code',  $station_code);
            $stmt->bindValue(':chanod',        $chanod);
            $stmt->bindValue(':owner_dept',    $owner_dept);
            $stmt->bindValue(':tax_year',      $tax_year);
            $stmt->bindValue(':images_items',  $images_items);
            $stmt->bindValue(':images_chanod', $images_chanod);
            $stmt->execute();

            echo json_encode(['success' => true, 'action' => 'inserted', 'id' => $conn->lastInsertId()], JSON_UNESCAPED_UNICODE);
        }

    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
    }
    exit;
}

// ============================================
// PUT — แก้ไขตาม id (จากฟอร์ม Edit Modal)
// ============================================
if ($method === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!$data || empty($data['id'])) {
        echo json_encode(['success' => false, 'message' => 'Missing id']);
        exit;
    }

    // ✅ images: ถ้าส่งมาเป็น array ให้ encode เป็น JSON string
    $images_items  = isset($data['images_items'])
        ? (is_array($data['images_items'])  ? json_encode($data['images_items'],  JSON_UNESCAPED_UNICODE) : $data['images_items'])
        : null;
    $images_chanod = isset($data['images_chanod'])
        ? (is_array($data['images_chanod']) ? json_encode($data['images_chanod'], JSON_UNESCAPED_UNICODE) : $data['images_chanod'])
        : null;

    try {
        $stmt = $conn->prepare("
            UPDATE properties SET
                name          = :name,         amphoe        = :amphoe,
                changwat      = :changwat,      land_type     = :land_type,
                area          = :area,          doc_right     = :doc_right,
                rent          = :rent,          appraise      = :appraise,
                lat           = :lat,           lon           = :lon,
                status        = :status,        tax           = :tax,
                tamlae        = :tamlae,        items         = :items,
                note          = :note,          suggestion    = :suggestion,
                station_code  = :station_code,  chanod        = :chanod,
                owner_dept    = :owner_dept,    tax_year      = :tax_year,
                images_items  = :images_items,  images_chanod = :images_chanod,
                updated_at    = NOW()
            WHERE id = :id
        ");
        $stmt->bindValue(':id',            (int)$data['id'],                    PDO::PARAM_INT);
        $stmt->bindValue(':name',          cleanStr($data['name']       ?? null));
        $stmt->bindValue(':amphoe',        cleanStr($data['amphoe']     ?? null));
        $stmt->bindValue(':changwat',      cleanStr($data['changwat']   ?? null));
        $stmt->bindValue(':land_type',     cleanStr($data['landType']   ?? $data['land_type'] ?? null));
        $stmt->bindValue(':area',          cleanStr($data['area']       ?? null));
        $stmt->bindValue(':doc_right',     cleanStr($data['docRight']   ?? $data['doc_right'] ?? null));
        $stmt->bindValue(':rent',          cleanNum($data['rent']       ?? null));
        $stmt->bindValue(':appraise',      cleanNum($data['appraise']   ?? null));
        $stmt->bindValue(':lat',           cleanNum($data['lat']        ?? null));
        $stmt->bindValue(':lon',           cleanNum($data['lon']        ?? null));
        $stmt->bindValue(':status',        cleanStr($data['status']     ?? null));
        $stmt->bindValue(':tax',           cleanStr($data['tax']        ?? null));
        $stmt->bindValue(':tamlae',        cleanStr($data['tamlae']     ?? null));
        $stmt->bindValue(':items',         cleanStr($data['items']      ?? null));
        $stmt->bindValue(':note',          cleanStr($data['note']       ?? null));
        $stmt->bindValue(':suggestion',    cleanStr($data['suggestion'] ?? null));
        // ✅ ใหม่
        $stmt->bindValue(':station_code',  cleanStr($data['station_code']  ?? null));
        $stmt->bindValue(':chanod',        cleanStr($data['chanod']        ?? null));
        $stmt->bindValue(':owner_dept',    cleanStr($data['owner_dept']    ?? null));
        $stmt->bindValue(':tax_year',      cleanStr($data['tax_year']      ?? null));
        $stmt->bindValue(':images_items',  $images_items);
        $stmt->bindValue(':images_chanod', $images_chanod);
        $stmt->execute();

        echo json_encode(['success' => true, 'message' => 'Property updated successfully'], JSON_UNESCAPED_UNICODE);

    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
    }
    exit;
}

// ============================================
// DELETE — ลบตาม id (ไม่มีการเปลี่ยนแปลง)
// ============================================
if ($method === 'DELETE') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!$data || empty($data['id'])) {
        echo json_encode(['success' => false, 'message' => 'Missing id']);
        exit;
    }

    try {
        $stmt = $conn->prepare("DELETE FROM properties WHERE id = :id");
        $stmt->bindValue(':id', (int)$data['id'], PDO::PARAM_INT);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            echo json_encode(['success' => true,  'message' => 'Deleted successfully'],  JSON_UNESCAPED_UNICODE);
        } else {
            echo json_encode(['success' => false, 'message' => 'Record not found'],       JSON_UNESCAPED_UNICODE);
        }

    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
    }
    exit;
}

// ============================================
// Method ไม่รองรับ
// ============================================
echo json_encode(['success' => false, 'message' => 'Method not supported'], JSON_UNESCAPED_UNICODE);
?>