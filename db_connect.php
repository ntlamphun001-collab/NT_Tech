<?php
/**
 * ============================================
 * db_connect.php
 * รองรับทั้ง PDO และ mysqli
 * ============================================
 */

$host = 'localhost';
$dbname = 'nt_tech_db';
$username = 'root';
$password = '';
$charset = 'utf8mb4';

// ============================================
// PDO Connection (ใช้กับ api_station_detail.php)
// ============================================
$dsn = "mysql:host=$host;dbname=$dbname;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $conn = new PDO($dsn, $username, $password, $options);
} catch (PDOException $e) {
    ob_clean(); 
    http_response_code(500);
    die(json_encode([
        'success' => false,
        'message' => 'PDO connection failed: ' . $e->getMessage()
    ]));
}

// ============================================
// mysqli Connection (ใช้กับ api_stations.php, api_update_station.php เก่า)
// ⚠️ จะค่อยๆ เลิกใช้ในอนาคต แนะนำให้ใช้ PDO แทน
// ============================================
// $mysqli_conn = new mysqli($host, $username, $password, $dbname);
// if ($mysqli_conn->connect_error) {
//     die(json_encode(['success' => false, 'message' => 'mysqli connection failed']));
// }
// $mysqli_conn->set_charset($charset);

// ============================================
// Helper Function
// ============================================
function clean_input($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}
?>