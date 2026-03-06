<?php
/**
 * ============================================
 * fix_dates.php — แก้ไขวันที่ที่บันทึกผิดรูปแบบ
 * 
 * ปัญหา: วันที่ถูกบันทึกเป็น 0000-00-00 เพราะ
 *        DB ได้รับ "16/02/2567" แทน "2024-02-16"
 * 
 * วิธีใช้: วางไฟล์นี้ที่ root โปรเจกต์
 *          เปิดใน browser: localhost/nt-tech/fix_dates.php
 *          หรือรันผ่าน CLI: php fix_dates.php
 * 
 * ⚠️  ควร backup ตารางก่อนรัน:
 *     mysqldump -u root -p nt_tech stations > backup_stations.sql
 * ============================================
 */

session_start();
require_once 'db_connect.php';

header('Content-Type: text/html; charset=utf-8');

// ============================================
// ฟังก์ชันแปลงวันที่จากทุกรูปแบบ → YYYY-MM-DD
// ============================================
function fixDateValue($val) {
    if ($val === null || $val === '' || $val === '-' || $val === '0000-00-00') {
        return null;
    }
    $val = trim($val);

    // รูปแบบ DD/MM/YYYY (พ.ศ. หรือ ค.ศ.)
    if (preg_match('/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/', $val, $m)) {
        $day   = (int)$m[1];
        $month = (int)$m[2];
        $year  = (int)$m[3];
        if ($year > 2300) $year -= 543;           // พ.ศ. → ค.ศ.
        if ($year < 1800 || $year > 2200) return null;
        if ($month < 1 || $month > 12)   return null;
        if ($day   < 1 || $day   > 31)   return null;
        return sprintf('%04d-%02d-%02d', $year, $month, $day);
    }

    // รูปแบบ YYYY-MM-DD ถูกต้องแล้ว
    if (preg_match('/^(\d{4})-(\d{2})-(\d{2})$/', $val, $m)) {
        $year = (int)$m[1];
        if ($year === 0 || $year < 1800) return null;
        return $val;
    }

    // Excel Serial Number
    if (preg_match('/^\d+$/', $val)) {
        $serial = (int)$val;
        if ($serial > 1 && $serial < 400000) {
            $unixTime = ($serial - 25569) * 86400;
            $dt = new DateTime('@' . $unixTime);
            $year  = (int)$dt->format('Y');
            $month = (int)$dt->format('m');
            $day   = (int)$dt->format('d');
            if ($year >= 2500) $year -= 543;
            if ($year < 1800 || $year > 2200) return null;
            return sprintf('%04d-%02d-%02d', $year, $month, $day);
        }
    }

    return null;
}

// ============================================
// ดึงข้อมูลทั้งหมดที่มีปัญหา
// ============================================
try {
    $stmt = $conn->query("SELECT id, รหัส10หลัก, วันที่อนุมัติ FROM stations");
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $fixed   = 0;
    $skipped = 0;
    $errors  = [];
    $log     = [];

    foreach ($rows as $row) {
        $id          = $row['id'];
        $code        = $row['รหัส10หลัก'];
        $currentDate = $row['วันที่อนุมัติ'];

        // ถ้าเป็น null, 0000-00-00, หรือ "-" → ไม่มีวันที่ ข้ามไป
        if ($currentDate === null || $currentDate === '0000-00-00' || $currentDate === '-' || $currentDate === '') {
            $skipped++;
            continue;
        }

        // ถ้าเป็น YYYY-MM-DD ถูกต้องอยู่แล้ว → ไม่ต้องแก้
        if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $currentDate)) {
            $year = (int)substr($currentDate, 0, 4);
            if ($year >= 1800 && $year <= 2200) {
                $skipped++;
                continue;
            }
        }

        // แปลงค่า
        $newDate = fixDateValue($currentDate);

        $log[] = [
            'id'       => $id,
            'code'     => $code,
            'old'      => $currentDate,
            'new'      => $newDate ?? 'NULL',
        ];

        // UPDATE
        $update = $conn->prepare("UPDATE stations SET วันที่อนุมัติ = :date, updated_at = NOW() WHERE id = :id");
        $update->bindValue(':date', $newDate);
        $update->bindValue(':id',   $id, PDO::PARAM_INT);
        $update->execute();
        $fixed++;
    }

    // ============================================
    // แสดงผลลัพธ์
    // ============================================
    echo '<!DOCTYPE html><html lang="th"><head><meta charset="UTF-8">
    <title>Fix Dates</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 30px; background: #f5f5f5; }
        .card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 20px; }
        .success { color: #27ae60; font-weight: bold; font-size: 18px; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th { background: #FFD101; padding: 10px; text-align: left; }
        td { padding: 8px 10px; border-bottom: 1px solid #eee; }
        tr:hover { background: #fffbe6; }
        .badge-fix  { background: #27ae60; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px; }
        .badge-null { background: #e74c3c; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px; }
    </style></head><body>';

    echo '<div class="card">';
    echo '<p class="success">✅ แก้ไขวันที่เสร็จสิ้น</p>';
    echo '<p>แก้ไขสำเร็จ: <strong>' . $fixed . ' รายการ</strong></p>';
    echo '<p>ข้ามไป (ถูกต้องแล้ว/null): <strong>' . $skipped . ' รายการ</strong></p>';
    echo '</div>';

    if (!empty($log)) {
        echo '<div class="card">';
        echo '<h3>รายการที่แก้ไข</h3>';
        echo '<table><tr><th>ID</th><th>รหัส10หลัก</th><th>ค่าเดิม</th><th>ค่าใหม่</th></tr>';
        foreach ($log as $l) {
            $badge = ($l['new'] !== 'NULL')
                ? '<span class="badge-fix">แก้ไขแล้ว</span>'
                : '<span class="badge-null">ไม่สามารถแปลงได้ → NULL</span>';
            echo '<tr>';
            echo '<td>' . htmlspecialchars($l['id'])   . '</td>';
            echo '<td>' . htmlspecialchars($l['code'])  . '</td>';
            echo '<td>' . htmlspecialchars($l['old'])   . '</td>';
            echo '<td>' . htmlspecialchars($l['new'])   . ' ' . $badge . '</td>';
            echo '</tr>';
        }
        echo '</table></div>';
    } else {
        echo '<div class="card"><p>✅ ไม่พบรายการที่ต้องแก้ไข — ข้อมูลทั้งหมดถูกต้องแล้ว</p></div>';
    }

    echo '</body></html>';

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>