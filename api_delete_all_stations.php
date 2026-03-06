<?php
/**
 * ============================================
 * API: api_delete_all_stations.php
 * หน้าที่: ลบข้อมูลสถานีทั้งหมด (Admin Only)
 * ============================================
 */

session_start();
header('Content-Type: application/json; charset=utf-8');

// ตรวจสอบ Session และสิทธิ์ Admin
if (!isset($_SESSION['user_id'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Unauthorized - Please login first'
    ]);
    exit;
}

// เฉพาะ Admin เท่านั้น (depid = 01)
if (!isset($_SESSION['depid']) || $_SESSION['depid'] !== '01') {
    echo json_encode([
        'success' => false,
        'message' => 'Access denied - Admin only'
    ]);
    exit;
}

$json = file_get_contents('php://input');
$data = json_decode($json, true);

// ต้องยืนยันด้วยการส่ง confirm: "DELETE ALL"
if (!isset($data['confirm']) || $data['confirm'] !== 'DELETE ALL') {
    echo json_encode([
        'success' => false,
        'message' => 'Not confirmed'
    ]);
    exit;
}

require_once 'db_connect.php';

try {
    // ลบข้อมูลทั้งหมด
    $sql = "DELETE FROM stations";
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    
    $deletedCount = $stmt->rowCount();
    
    echo json_encode([
        'success' => true,
        'deleted_count' => $deletedCount,
        'message' => "All stations deleted successfully ($deletedCount records)"
    ], JSON_UNESCAPED_UNICODE);
    
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>