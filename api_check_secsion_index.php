<?php
/**
 * ============================================
 * ไฟล์: api_check_session.php
 * หน้าที่: ตรวจสอบสถานะการ Login
 * ============================================
 */
(async function checkAuth() {
    console.log("🔐 Checking authentication...");
    
    try {
        // ============================================
        // เรียก API เช็ค Session
        // ============================================
        const response = await fetch('api_check_session.php');
        const result = await response.json();
        
        console.log("📨 Session Check Result:", result);
        
        // ============================================
        // กรณีที่ 1: ไม่ได้ Login
        // ============================================
        if (!result.logged_in) {
            console.log("❌ Not logged in - Redirecting to login page...");
            alert("⚠️ กรุณาเข้าสู่ระบบก่อนใช้งาน");
            window.location.href = "login.html";
            return; // หยุดการทำงานของโค้ดที่เหลือ
        }
        
        // ============================================
        // กรณีที่ 2: Login แล้ว
        // ============================================
        console.log("✅ User is logged in:", result.data.username);
        
        // อัปเดตชื่อผู้ใช้ในหน้าเว็บ (ถ้ามี element)
        const adminNameElement = document.querySelector('.admin-name');
        if (adminNameElement && result.data.username) {
            adminNameElement.textContent = result.data.username;
        }
        
        // เก็บข้อมูลผู้ใช้ใน localStorage (สำหรับใช้ในหน้าอื่น)
        localStorage.setItem('userData', JSON.stringify(result.data));
        
        // ✅ ให้หน้าเว็บทำงานต่อได้ตามปกติ
        console.log("✅ Authentication check complete - Page ready");
        
    } catch (error) {
        // ============================================
        // กรณีที่ 3: เกิด Error ในการเชื่อมต่อ
        // ============================================
        console.error("❌ Authentication check failed:", error);
        alert("❌ ไม่สามารถตรวจสอบสิทธิ์ได้\nกรุณาตรวจสอบการเชื่อมต่อ");
        window.location.href = "login.html";
    }
})();

// ========================================
// 🚪 ฟังก์ชัน Logout (เพิ่มใหม่)
// ========================================
async function handleLogout() {
    console.log("🚪 Logout requested");
    
    const confirmLogout = confirm("ต้องการออกจากระบบหรือไม่?");
    if (!confirmLogout) return;
    
    try {
        // เรียก API Logout
        const response = await fetch('api_logout.php', {
            method: 'POST'
        });
        
        const result = await response.json();
        console.log("📨 Logout Result:", result);
        
        if (result.success) {
            // ลบข้อมูลใน localStorage
            localStorage.removeItem('userData');
            
            alert("✅ ออกจากระบบเรียบร้อย");
            window.location.href = "login.html";
        } else {
            alert("❌ เกิดข้อผิดพลาดในการออกจากระบบ");
        }
        
    } catch (error) {
        console.error("❌ Logout error:", error);
        alert("❌ เกิดข้อผิดพลาด: " + error.message);
    }
}

// ผูกฟังก์ชัน Logout กับปุ่มในหน้าเว็บ
window.handleLogout = handleLogout;

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
            'depname' => $_SESSION['depname'],
            'depid' => $_SESSION['depid'],
            'role' => $_SESSION['role']
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