<?php
/**
 * ============================================
 * ไฟล์: api_login.php (PDO Version)
 * หน้าที่: จัดการการ Login
 * ============================================
 * ✅ แก้ไข: เพิ่ม email ใน response data
 *    เพื่อให้หน้าต่างๆ แสดงอีเมลใต้ชื่อ User ได้
 * ✅ คงโค้ดเดิมไว้ 100%
 */

session_start();
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed. กรุณาใช้ POST Request'
    ]);
    exit;
}

require_once 'db_connect.php';

$input = file_get_contents('php://input');
$data  = json_decode($input, true);

if (!isset($data['username']) || !isset($data['password'])) {
    echo json_encode([
        'success' => false,
        'message' => 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน'
    ]);
    exit;
}

$username = clean_input($data['username']);
$password = $data['password'];

if (empty($username) || empty($password)) {
    echo json_encode([
        'success' => false,
        'message' => 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน'
    ]);
    exit;
}

try {
    $stmt = $conn->prepare("SELECT * FROM users WHERE user = ? LIMIT 1");
    $stmt->execute([$username]);
    $user = $stmt->fetch();

    if (!$user) {
        echo json_encode([
            'success' => false,
            'message' => 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'
        ]);
        exit;
    }

    if (!password_verify($password, $user['password'])) {
        echo json_encode([
            'success' => false,
            'message' => 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'
        ]);
        exit;
    }

    // อัพเดทเวลา Login
    $update_stmt = $conn->prepare("UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?");
    $update_stmt->execute([$user['id']]);

    // กำหนดสิทธิ์
    $role = ($user['depid'] === '01') ? 'admin' : 'user';
    $permissions = [
        'can_create' => ($user['depid'] === '01'),
        'can_edit'   => ($user['depid'] === '01'),
        'can_delete' => ($user['depid'] === '01'),
        'can_view'   => true
    ];

    // สร้าง Session
    $_SESSION['logged_in'] = true;
    $_SESSION['user_id']   = $user['id'];
    $_SESSION['username']  = $user['user'];
    $_SESSION['email']     = $user['email'] ?? '';   // ✅ เพิ่ม email ใน Session
    $_SESSION['depname']   = $user['depname'];
    $_SESSION['depid']     = $user['depid'];
    $_SESSION['role']      = $role;

    echo json_encode([
        'success' => true,
        'message' => 'เข้าสู่ระบบสำเร็จ',
        'data'    => [
            'user_id'     => $user['id'],
            'username'    => $user['user'],
            'email'       => $user['email'] ?? '',   // ✅ ส่ง email กลับไปให้ localStorage
            'depname'     => $user['depname'],
            'depid'       => $user['depid'],
            'role'        => $role,
            'permissions' => $permissions
        ]
    ]);

} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>