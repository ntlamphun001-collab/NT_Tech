<?php
/**
 * ============================================
 * ไฟล์: api_stations.php
 * หน้าที่: จัดการข้อมูลชุมสาย (Stations)
 * 
 * ✅ รองรับ Operations:
 * - GET    : ดึงข้อมูลชุมสายทั้งหมดหรือตาม depname
 * - POST   : เพิ่มชุมสายใหม่
 * - PUT    : แก้ไขข้อมูลชุมสาย
 * - DELETE : ลบชุมสาย
 * ============================================
 */

session_start();
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

// จัดการ OPTIONS request (CORS preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once 'db_connect.php';

$method = $_SERVER['REQUEST_METHOD'];

// ============================================
// ✅ ฟังก์ชัน: GET - ดึงข้อมูลชุมสาย
// ============================================
if ($method === 'GET') {
    $depname    = isset($_GET['depname']) ? clean_input($_GET['depname']) : null;
    $station_id = isset($_GET['id'])      ? intval($_GET['id'])           : null;

    try {
        // ดึงข้อมูลชุมสายเฉพาะ ID
        if ($station_id) {
            $stmt = $conn->prepare("SELECT * FROM stations WHERE id = :id");
            $stmt->bindValue(':id', $station_id, PDO::PARAM_INT);
            $stmt->execute();
            $row = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($row) {
                echo json_encode(['success' => true, 'data' => $row], JSON_UNESCAPED_UNICODE);
            } else {
                echo json_encode(['success' => false, 'message' => 'ไม่พบข้อมูลชุมสาย'], JSON_UNESCAPED_UNICODE);
            }
            exit;
        }

        // ดึงข้อมูลตาม depname หรือทั้งหมด
        if ($depname) {
            $stmt = $conn->prepare("SELECT * FROM stations WHERE depname = :dep ORDER BY station_name");
            $stmt->bindValue(':dep', $depname);
        } else {
            $stmt = $conn->prepare("SELECT * FROM stations ORDER BY station_name");
        }

        $stmt->execute();
        $stations = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            'success' => true,
            'count'   => count($stations),
            'data'    => $stations
        ], JSON_UNESCAPED_UNICODE);

    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
    }
    exit;
}

// ============================================
// ✅ ฟังก์ชัน: POST - เพิ่มชุมสายใหม่
// ============================================
if ($method === 'POST') {
    $input = file_get_contents('php://input');
    $data  = json_decode($input, true);

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!isset($data['station_name'])) {
        echo json_encode(['success' => false, 'message' => 'กรุณาระบุชื่อชุมสาย'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $station_code   = isset($data['station_code'])   ? clean_input($data['station_code'])   : '';
    $station_name   = clean_input($data['station_name']);
    $location       = isset($data['location'])       ? clean_input($data['location'])       : '';
    $province       = isset($data['province'])       ? clean_input($data['province'])       : '';
    $district       = isset($data['district'])       ? clean_input($data['district'])       : '';
    $subdistrict    = isset($data['subdistrict'])    ? clean_input($data['subdistrict'])    : '';
    $postcode       = isset($data['postcode'])       ? clean_input($data['postcode'])       : '';
    $contact_person = isset($data['contact_person']) ? clean_input($data['contact_person']) : '';
    $phone          = isset($data['phone'])          ? clean_input($data['phone'])          : '';
    $status         = isset($data['status'])         ? clean_input($data['status'])         : 'active';
    $notes          = isset($data['notes'])          ? clean_input($data['notes'])          : '';
    $depname        = isset($data['depname'])        ? clean_input($data['depname'])        : '';

    try {
        $stmt = $conn->prepare(
            "INSERT INTO stations
                (station_code, station_name, location, province, district, subdistrict,
                 postcode, contact_person, phone, status, notes, depname)
             VALUES
                (:code, :name, :loc, :prov, :dist, :subdist,
                 :post, :contact, :phone, :status, :notes, :dep)"
        );
        $stmt->bindValue(':code',    $station_code);
        $stmt->bindValue(':name',    $station_name);
        $stmt->bindValue(':loc',     $location);
        $stmt->bindValue(':prov',    $province);
        $stmt->bindValue(':dist',    $district);
        $stmt->bindValue(':subdist', $subdistrict);
        $stmt->bindValue(':post',    $postcode);
        $stmt->bindValue(':contact', $contact_person);
        $stmt->bindValue(':phone',   $phone);
        $stmt->bindValue(':status',  $status);
        $stmt->bindValue(':notes',   $notes);
        $stmt->bindValue(':dep',     $depname);

        if ($stmt->execute()) {
            echo json_encode([
                'success'    => true,
                'message'    => 'เพิ่มชุมสายสำเร็จ',
                'station_id' => $conn->lastInsertId()
            ], JSON_UNESCAPED_UNICODE);
        } else {
            echo json_encode(['success' => false, 'message' => 'เกิดข้อผิดพลาดในการบันทึก'], JSON_UNESCAPED_UNICODE);
        }

    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
    }
    exit;
}

// ============================================
// ✅ ฟังก์ชัน: PUT - แก้ไขข้อมูลชุมสาย
// ============================================
if ($method === 'PUT') {
    $input = file_get_contents('php://input');
    $data  = json_decode($input, true);

    if (!isset($data['id'])) {
        echo json_encode(['success' => false, 'message' => 'กรุณาระบุ ID ชุมสาย'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $id             = intval($data['id']);
    $station_code   = isset($data['station_code'])   ? clean_input($data['station_code'])   : '';
    $station_name   = isset($data['station_name'])   ? clean_input($data['station_name'])   : '';
    $location       = isset($data['location'])       ? clean_input($data['location'])       : '';
    $province       = isset($data['province'])       ? clean_input($data['province'])       : '';
    $district       = isset($data['district'])       ? clean_input($data['district'])       : '';
    $subdistrict    = isset($data['subdistrict'])    ? clean_input($data['subdistrict'])    : '';
    $postcode       = isset($data['postcode'])       ? clean_input($data['postcode'])       : '';
    $contact_person = isset($data['contact_person']) ? clean_input($data['contact_person']) : '';
    $phone          = isset($data['phone'])          ? clean_input($data['phone'])          : '';
    $status         = isset($data['status'])         ? clean_input($data['status'])         : '';
    $notes          = isset($data['notes'])          ? clean_input($data['notes'])          : '';
    $depname        = isset($data['depname'])        ? clean_input($data['depname'])        : '';

    try {
        $stmt = $conn->prepare(
            "UPDATE stations SET
                station_code    = :code,
                station_name    = :name,
                location        = :loc,
                province        = :prov,
                district        = :dist,
                subdistrict     = :subdist,
                postcode        = :post,
                contact_person  = :contact,
                phone           = :phone,
                status          = :status,
                notes           = :notes,
                depname         = :dep
             WHERE id = :id"
        );
        $stmt->bindValue(':code',    $station_code);
        $stmt->bindValue(':name',    $station_name);
        $stmt->bindValue(':loc',     $location);
        $stmt->bindValue(':prov',    $province);
        $stmt->bindValue(':dist',    $district);
        $stmt->bindValue(':subdist', $subdistrict);
        $stmt->bindValue(':post',    $postcode);
        $stmt->bindValue(':contact', $contact_person);
        $stmt->bindValue(':phone',   $phone);
        $stmt->bindValue(':status',  $status);
        $stmt->bindValue(':notes',   $notes);
        $stmt->bindValue(':dep',     $depname);
        $stmt->bindValue(':id',      $id, PDO::PARAM_INT);

        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'แก้ไขข้อมูลสำเร็จ'], JSON_UNESCAPED_UNICODE);
        } else {
            echo json_encode(['success' => false, 'message' => 'เกิดข้อผิดพลาดในการแก้ไข'], JSON_UNESCAPED_UNICODE);
        }

    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
    }
    exit;
}

// ============================================
// ✅ ฟังก์ชัน: DELETE - ลบชุมสาย
// ============================================
if ($method === 'DELETE') {
    $input = file_get_contents('php://input');
    $data  = json_decode($input, true);

    if (!isset($data['id'])) {
        echo json_encode(['success' => false, 'message' => 'กรุณาระบุ ID ชุมสาย'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $id = intval($data['id']);

    try {
        $stmt = $conn->prepare("DELETE FROM stations WHERE id = :id");
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);

        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'ลบชุมสายสำเร็จ'], JSON_UNESCAPED_UNICODE);
        } else {
            echo json_encode(['success' => false, 'message' => 'เกิดข้อผิดพลาดในการลบ'], JSON_UNESCAPED_UNICODE);
        }

    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
    }
    exit;
}

// ============================================
// ❌ Method ไม่รองรับ
// ============================================
echo json_encode(['success' => false, 'message' => 'Method not supported'], JSON_UNESCAPED_UNICODE);
?>