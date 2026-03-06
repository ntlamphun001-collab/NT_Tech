<?php
/**
 * ============================================
 * ไฟล์: api_check_session.php
 * หน้าที่: ตรวจสอบสถานะการ Login
 * ============================================
 */

// เริ่ม Session
session_start();

// รองรับ CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

// ตรวจสอบว่า Login อยู่หรือไม่
if (isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true) {
    // ส่งข้อมูลผู้ใช้กลับ
    echo json_encode([
        'success' => true,
        'logged_in' => true,
        'data' => [
            'user_id' => $_SESSION['user_id'],
            'username' => $_SESSION['username'],
            'email'    => $_SESSION['email'] ?? '',   // ✅ เพิ่ม email
            'depname'  => $_SESSION['depname'],
            'depid'    => $_SESSION['depid'],
            'role'     => $_SESSION['role']
        ]
    ]);
} else {
    // ไม่ได้ Login
    echo json_encode([
        'success' => true,
        'logged_in' => false
    ]);
}
?>