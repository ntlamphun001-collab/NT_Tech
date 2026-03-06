<?php
/**
 * ============================================
 * API: api_logout.php
 * หน้าที่: ออกจากระบบ (ลบ Session)
 * ============================================
 */

// เปิด Session
session_start();

// ตั้งค่า Header สำหรับ JSON
header('Content-Type: application/json');

// ============================================
// ทำลาย Session ทั้งหมด
// ============================================
try {
    // ลบตัวแปร Session ทั้งหมด
    $_SESSION = array();
    
    // ทำลาย Session Cookie
    if (isset($_COOKIE[session_name()])) {
        setcookie(session_name(), '', time() - 3600, '/');
    }
    
    // ทำลาย Session
    session_destroy();
    
    // ส่งผลลัพธ์กลับ
    echo json_encode([
        'success' => true,
        'message' => 'Logged out successfully'
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Logout failed: ' . $e->getMessage()
    ]);
}
?>