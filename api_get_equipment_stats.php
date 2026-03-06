<?php
/**
 * ============================================
 * API: api_get_equipment_stats.php
 * หน้าที่: ดึงสถิติจำนวนอุปกรณ์แต่ละประเภท
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

// เชื่อมต่อ Database
require_once 'db_connect.php';

try {
    // ============================================
    // ประเภทอุปกรณ์ที่ต้องนับ
    // ============================================
    $types = [
        'air',
        'battery',
        'generator',
        'transformer',
        'rectifier',
        'peameter',
        'solar'
    ];
    
    $stats = [];
    
    // ============================================
    // นับจำนวนแต่ละประเภท
    // ============================================
    foreach ($types as $type) {
        $sql = "SELECT COUNT(*) as count FROM equipment_inventory WHERE type = :type";
        $stmt = $conn->prepare($sql);
        $stmt->bindValue(':type', $type);
        $stmt->execute();
        
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        $stats[$type] = (int)$result['count'];
    }
    
    // ============================================
    // ส่งข้อมูลกลับ
    // ============================================
    // Property stats (ดึงจากตาราง properties)
    $propStmt = $conn->query("
        SELECT
            COUNT(*)                                                   AS total,
            SUM(status LIKE '%ใช้งาน%')                                AS inuse,
            SUM(status LIKE '%ว่าง%')                                  AS vacant,
            SUM(status LIKE '%เช่า%')                                  AS rent,
            COALESCE(SUM(CASE WHEN rent > 0 THEN rent ELSE 0 END), 0) AS income
        FROM properties
    ");
    $prop = $propStmt->fetch(PDO::FETCH_ASSOC);
    $stats['property']        = (int)($prop['total']  ?? 0);
    $stats['property_inuse']  = (int)($prop['inuse']  ?? 0);
    $stats['property_vacant'] = (int)($prop['vacant'] ?? 0);
    $stats['property_rent']   = (int)($prop['rent']   ?? 0);
    $stats['property_income'] = (float)($prop['income'] ?? 0);
    echo json_encode([
        'success' => true,
        'data' => $stats
    ], JSON_UNESCAPED_UNICODE);
    
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>