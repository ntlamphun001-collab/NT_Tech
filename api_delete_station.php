<?php
/**
 * ============================================
 * API: api_delete_station.php
 * หน้าที่: ลบข้อมูลสถานีออกจาก Database
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

if (!$data || !isset($data['id'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Missing station ID'
    ]);
    exit;
}

// เชื่อมต่อ Database
require_once 'db_connect.php';

try {
    // ============================================
    // ลบข้อมูล
    // ============================================
    $sql = "DELETE FROM stations WHERE id = :id";
    $stmt = $conn->prepare($sql);
    $stmt->bindValue(':id', $data['id']);
    $stmt->execute();
    
    if ($stmt->rowCount() > 0) {
        echo json_encode([
            'success' => true,
            'message' => 'Station deleted successfully'
        ], JSON_UNESCAPED_UNICODE);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Station not found'
        ], JSON_UNESCAPED_UNICODE);
    }
    
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>