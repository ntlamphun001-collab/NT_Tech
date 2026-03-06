<?php
/**
 * ============================================
 * ไฟล์: api_register.php
 * หน้าที่: จัดการการสมัครสมาชิก (User เท่านั้น)
 * ============================================
 * ✅ depid ถูกกำหนดเป็น '02' (User) ตายตัวฝั่ง Server
 * ✅ รับ email เพิ่มเติม เพื่อแสดงใต้ชื่อ User ในหน้าต่างๆ
 * ❌ ไม่มีทางสมัครเป็น Admin ผ่านหน้านี้ได้เลย
 */

session_start();
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

require_once 'db_connect.php';

$input = file_get_contents('php://input');
$data  = json_decode($input, true);

// ตรวจสอบ fields ที่จำเป็น
if (!isset($data['username']) || !isset($data['email']) || !isset($data['password'])) {
    echo json_encode(['success' => false, 'message' => 'กรุณากรอกข้อมูลให้ครบ']);
    exit;
}

$username = trim($data['username']);
$email    = trim($data['email']);
$password = $data['password'];

// Validate ไม่ว่าง
if (empty($username) || empty($email) || empty($password)) {
    echo json_encode(['success' => false, 'message' => 'กรุณากรอกข้อมูลให้ครบทุกช่อง']);
    exit;
}

// Validate รูปแบบ Email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'รูปแบบอีเมลไม่ถูกต้อง']);
    exit;
}

// Validate ความยาวรหัสผ่าน
if (strlen($password) < 6) {
    echo json_encode(['success' => false, 'message' => 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร']);
    exit;
}

// ============================================
// ✅ กำหนด depid = '02' (User) ตายตัวฝั่ง Server
//    ไม่ว่า Client จะส่งอะไรมาก็ตาม จะถูกบังคับเป็น User เสมอ
// ============================================
$depid   = '02';
$depname = 'User';

try {
    // ตรวจสอบ Username ซ้ำ
    $checkUser = $conn->prepare("SELECT id FROM users WHERE user = ? LIMIT 1");
    $checkUser->execute([$username]);
    if ($checkUser->fetch()) {
        echo json_encode(['success' => false, 'message' => 'ชื่อผู้ใช้นี้ถูกใช้งานแล้ว']);
        exit;
    }

    // ตรวจสอบ Email ซ้ำ
    $checkEmail = $conn->prepare("SELECT id FROM users WHERE email = ? LIMIT 1");
    $checkEmail->execute([$email]);
    if ($checkEmail->fetch()) {
        echo json_encode(['success' => false, 'message' => 'อีเมลนี้ถูกใช้งานแล้ว']);
        exit;
    }

    // Hash รหัสผ่าน
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    // บันทึกลงฐานข้อมูล
    // *** หมายเหตุ: ตาราง users ต้องมี column 'email' ***
    // *** ถ้ายังไม่มี ให้รัน: ALTER TABLE users ADD COLUMN email VARCHAR(255) AFTER user; ***
    $stmt = $conn->prepare(
        "INSERT INTO users (user, email, password, depid, depname, created_at) 
         VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)"
    );
    $stmt->execute([$username, $email, $hashedPassword, $depid, $depname]);

    echo json_encode([
        'success' => true,
        'message' => 'สมัครสมาชิกสำเร็จ'
    ]);

} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>