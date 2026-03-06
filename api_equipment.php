<?php
/**
 * ============================================
 * ไฟล์: api_equipment.php
 * หน้าที่: จัดการข้อมูลอุปกรณ์ (Equipment)
 * 
 * ✅ รองรับ Operations:
 * - GET    : ดึงข้อมูลอุปกรณ์ตาม station_id
 * - POST   : เพิ่มอุปกรณ์ใหม่
 * - PUT    : แก้ไขข้อมูลอุปกรณ์
 * - DELETE : ลบอุปกรณ์
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

require_once 'db_connect.php';

$method = $_SERVER['REQUEST_METHOD'];

// ============================================
// ✅ ฟังก์ชัน: GET - ดึงข้อมูลอุปกรณ์
// ============================================
if ($method === 'GET') {
    $station_id = isset($_GET['station_id']) ? intval($_GET['station_id']) : null;
    $equipment_id = isset($_GET['id']) ? intval($_GET['id']) : null;
    
    // ดึงข้อมูลอุปกรณ์เฉพาะ ID
    if ($equipment_id) {
        $stmt = $conn->prepare("
            SELECT e.*, s.station_name 
            FROM equipment e 
            LEFT JOIN stations s ON e.station_id = s.id 
            WHERE e.id = ?
        ");
        $stmt->bind_param("i", $equipment_id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            $equipment = $result->fetch_assoc();
            
            // ดึงรูปภาพทั้งหมดของอุปกรณ์นี้
            $img_stmt = $conn->prepare("SELECT * FROM equipment_images WHERE equipment_id = ?");
            $img_stmt->bind_param("i", $equipment_id);
            $img_stmt->execute();
            $img_result = $img_stmt->get_result();
            $images = [];
            while ($img = $img_result->fetch_assoc()) {
                $images[] = $img;
            }
            $equipment['images'] = $images;
            
            echo json_encode([
                'success' => true,
                'data' => $equipment
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'ไม่พบข้อมูลอุปกรณ์'
            ]);
        }
        $stmt->close();
        $conn->close();
        exit;
    }
    
    // ดึงข้อมูลทั้งหมดหรือตาม station_id
    if ($station_id) {
        $stmt = $conn->prepare("
            SELECT e.*, s.station_name 
            FROM equipment e 
            LEFT JOIN stations s ON e.station_id = s.id 
            WHERE e.station_id = ?
            ORDER BY e.equipment_type, e.equipment_name
        ");
        $stmt->bind_param("i", $station_id);
    } else {
        $stmt = $conn->prepare("
            SELECT e.*, s.station_name 
            FROM equipment e 
            LEFT JOIN stations s ON e.station_id = s.id 
            ORDER BY s.station_name, e.equipment_type, e.equipment_name
        ");
    }
    
    $stmt->execute();
    $result = $stmt->get_result();
    $equipment = [];
    
    while ($row = $result->fetch_assoc()) {
        $equipment[] = $row;
    }
    
    echo json_encode([
        'success' => true,
        'count' => count($equipment),
        'data' => $equipment
    ]);
    
    $stmt->close();
    $conn->close();
    exit;
}

// ============================================
// ✅ ฟังก์ชัน: POST - เพิ่มอุปกรณ์ใหม่
// ============================================
if ($method === 'POST') {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if (!isset($data['equipment_name'])) {
        echo json_encode(['success' => false, 'message' => 'กรุณาระบุชื่ออุปกรณ์']);
        exit;
    }
    
    $station_id = isset($data['station_id']) ? intval($data['station_id']) : null;
    $equipment_name = clean_input($data['equipment_name']);
    $equipment_type = isset($data['equipment_type']) ? clean_input($data['equipment_type']) : '';
    $brand = isset($data['brand']) ? clean_input($data['brand']) : '';
    $model = isset($data['model']) ? clean_input($data['model']) : '';
    $serial_number = isset($data['serial_number']) ? clean_input($data['serial_number']) : '';
    $mac_address = isset($data['mac_address']) ? clean_input($data['mac_address']) : '';
    $ip_address = isset($data['ip_address']) ? clean_input($data['ip_address']) : '';
    $purchase_date = isset($data['purchase_date']) ? $data['purchase_date'] : null;
    $warranty_expire = isset($data['warranty_expire']) ? $data['warranty_expire'] : null;
    $install_date = isset($data['install_date']) ? $data['install_date'] : null;
    $status = isset($data['status']) ? clean_input($data['status']) : 'ใช้งาน';
    $location_detail = isset($data['location_detail']) ? clean_input($data['location_detail']) : '';
    $price = isset($data['price']) ? floatval($data['price']) : 0;
    $notes = isset($data['notes']) ? clean_input($data['notes']) : '';
    $image_url = isset($data['image_url']) ? clean_input($data['image_url']) : '';
    
    $stmt = $conn->prepare("INSERT INTO equipment (station_id, equipment_name, equipment_type, brand, model, serial_number, mac_address, ip_address, purchase_date, warranty_expire, install_date, status, location_detail, price, notes, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("issssssssssssdss", $station_id, $equipment_name, $equipment_type, $brand, $model, $serial_number, $mac_address, $ip_address, $purchase_date, $warranty_expire, $install_date, $status, $location_detail, $price, $notes, $image_url);
    
    if ($stmt->execute()) {
        $equipment_id = $stmt->insert_id;
        
        // เพิ่มรูปภาพถ้ามี
        if (isset($data['images']) && is_array($data['images'])) {
            $img_stmt = $conn->prepare("INSERT INTO equipment_images (equipment_id, image_url, image_name) VALUES (?, ?, ?)");
            foreach ($data['images'] as $img) {
                $img_url = isset($img['url']) ? $img['url'] : '';
                $img_name = isset($img['name']) ? $img['name'] : '';
                $img_stmt->bind_param("iss", $equipment_id, $img_url, $img_name);
                $img_stmt->execute();
            }
            $img_stmt->close();
        }
        
        echo json_encode([
            'success' => true,
            'message' => 'เพิ่มอุปกรณ์สำเร็จ',
            'equipment_id' => $equipment_id
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'เกิดข้อผิดพลาด: ' . $conn->error
        ]);
    }
    
    $stmt->close();
    $conn->close();
    exit;
}

// ============================================
// ✅ ฟังก์ชัน: PUT - แก้ไขข้อมูลอุปกรณ์
// ============================================
if ($method === 'PUT') {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if (!isset($data['id'])) {
        echo json_encode(['success' => false, 'message' => 'กรุณาระบุ ID อุปกรณ์']);
        exit;
    }
    
    $id = intval($data['id']);
    $station_id = isset($data['station_id']) ? intval($data['station_id']) : null;
    $equipment_name = isset($data['equipment_name']) ? clean_input($data['equipment_name']) : '';
    $equipment_type = isset($data['equipment_type']) ? clean_input($data['equipment_type']) : '';
    $brand = isset($data['brand']) ? clean_input($data['brand']) : '';
    $model = isset($data['model']) ? clean_input($data['model']) : '';
    $serial_number = isset($data['serial_number']) ? clean_input($data['serial_number']) : '';
    $mac_address = isset($data['mac_address']) ? clean_input($data['mac_address']) : '';
    $ip_address = isset($data['ip_address']) ? clean_input($data['ip_address']) : '';
    $purchase_date = isset($data['purchase_date']) ? $data['purchase_date'] : null;
    $warranty_expire = isset($data['warranty_expire']) ? $data['warranty_expire'] : null;
    $install_date = isset($data['install_date']) ? $data['install_date'] : null;
    $status = isset($data['status']) ? clean_input($data['status']) : '';
    $location_detail = isset($data['location_detail']) ? clean_input($data['location_detail']) : '';
    $price = isset($data['price']) ? floatval($data['price']) : 0;
    $notes = isset($data['notes']) ? clean_input($data['notes']) : '';
    $image_url = isset($data['image_url']) ? clean_input($data['image_url']) : '';
    
    $stmt = $conn->prepare("UPDATE equipment SET station_id=?, equipment_name=?, equipment_type=?, brand=?, model=?, serial_number=?, mac_address=?, ip_address=?, purchase_date=?, warranty_expire=?, install_date=?, status=?, location_detail=?, price=?, notes=?, image_url=? WHERE id=?");
    $stmt->bind_param("issssssssssssdssi", $station_id, $equipment_name, $equipment_type, $brand, $model, $serial_number, $mac_address, $ip_address, $purchase_date, $warranty_expire, $install_date, $status, $location_detail, $price, $notes, $image_url, $id);
    
    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'แก้ไขข้อมูลสำเร็จ'
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'เกิดข้อผิดพลาด: ' . $conn->error
        ]);
    }
    
    $stmt->close();
    $conn->close();
    exit;
}

// ============================================
// ✅ ฟังก์ชัน: DELETE - ลบอุปกรณ์
// ============================================
if ($method === 'DELETE') {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if (!isset($data['id'])) {
        echo json_encode(['success' => false, 'message' => 'กรุณาระบุ ID อุปกรณ์']);
        exit;
    }
    
    $id = intval($data['id']);
    
    $stmt = $conn->prepare("DELETE FROM equipment WHERE id = ?");
    $stmt->bind_param("i", $id);
    
    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'ลบอุปกรณ์สำเร็จ'
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'เกิดข้อผิดพลาด: ' . $conn->error
        ]);
    }
    
    $stmt->close();
    $conn->close();
    exit;
}

echo json_encode([
    'success' => false,
    'message' => 'Method not supported'
]);
$conn->close();
?>