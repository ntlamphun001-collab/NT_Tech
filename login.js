/**
 * ============================================
 * ไฟล์: login.js
 * หน้าที่: จัดการการ Login (ใช้ SQL แทน Firebase)
 * ============================================
 * 
 * ✅ ฟังก์ชันที่เพิ่มใหม่:
 * 2. handleLogin() - ส่งข้อมูลไปยัง API Login
 * 3. goToRegister() - เปิดหน้าสมัครสมาชิก
 */

// ============================================
// 🔒 ปิดการเข้าถึง DevTools — เพิ่มตรงนี้
// ============================================
(function () {
    // ปิด Right-click
    document.addEventListener('contextmenu', function (e) {
        e.preventDefault();
    });

    // ปิด Keyboard Shortcuts
    document.addEventListener('keydown', function (e) {
        if (e.key === 'F12') { e.preventDefault(); return false; }
        if (e.ctrlKey && e.shiftKey && e.key === 'I') { e.preventDefault(); return false; }
        if (e.ctrlKey && e.shiftKey && e.key === 'J') { e.preventDefault(); return false; }
        if (e.ctrlKey && e.shiftKey && e.key === 'C') { e.preventDefault(); return false; }
        if (e.ctrlKey && e.key === 'u') { e.preventDefault(); return false; }
        if (e.ctrlKey && e.key === 's') { e.preventDefault(); return false; }
    });

    // ตรวจจับการเปิด DevTools ผ่าน window size
    var devtoolsOpen = false;
    setInterval(function () {
        if (window.outerWidth - window.innerWidth > 160 || window.outerHeight - window.innerHeight > 160) {
            if (!devtoolsOpen) {
                devtoolsOpen = true;
                document.body.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:Prompt,sans-serif;font-size:24px;color:#333;">⛔ ไม่อนุญาตให้เข้าถึงหน้านี้</div>';
            }
        } else {
            devtoolsOpen = false;
        }
    }, 1000);
})();


// ============================================
// โค้ดเดิม — คงไว้ 100%
// ============================================
document.addEventListener("DOMContentLoaded", () => {
    console.log("🚀 Login Script Loaded (SQL Version)"); 
    
    // ============================================
    // 1. เชื่อมต่อ Elements กับ HTML
    // ============================================
    const loginButton = document.getElementById("loginBtn");
    const registerButton = document.getElementById("registerBtn");
    const usernameInput = document.getElementById("emailInput");
    const passwordInput = document.getElementById("passwordInput");

    if (!loginButton) console.error("ไม่เจอปุ่ม Login");
    if (!registerButton) console.error("ไม่เจอปุ่ม Register");
    if (!usernameInput) console.error("ไม่เจอช่อง Username");
    if (!passwordInput) console.error("ไม่เจอช่อง Password");

    // ============================================
    // 3. ฟังก์ชัน Login
    // ============================================
    async function handleLogin(event) {
        event.preventDefault();
        console.log("Login Button Clicked");

        const enteredUsername = usernameInput.value.trim();
        const enteredPassword = passwordInput.value.trim();

        if (!enteredUsername || !enteredPassword) {
            alert("กรุณากรอกชื่อผู้ใช้และรหัสผ่าน");
            return;
        }

        const originalText = loginButton.innerText;
        loginButton.innerText = "กำลังตรวจสอบ...";
        loginButton.disabled = true;

        try {
            const response = await fetch('api_login.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: enteredUsername,
                    password: enteredPassword
                })
            });

            const result = await response.json();

            if (result.success) {
                localStorage.setItem('userData', JSON.stringify(result.data));
                alert("เข้าสู่ระบบสำเร็จ!");
                setTimeout(() => { window.location.href = "index.html"; }, 1000);
            } else {
                alert(result.message);
                loginButton.innerText = originalText;
                loginButton.disabled = false;
            }

        } catch (error) {
            alert("เกิดข้อผิดพลาดในการเชื่อมต่อ\nกรุณาตรวจสอบการเชื่อมต่อหรือ API");
            loginButton.innerText = originalText;
            loginButton.disabled = false;
        }
    }

    // ============================================
    // 4. ฟังก์ชันไปหน้า Register
    // ============================================
    function goToRegister() {
        window.location.href = "register.html";
    }

    // ============================================
    // 5. ผูก Event Listeners
    // ============================================
    if (loginButton) loginButton.addEventListener("click", handleLogin);
    if (registerButton) registerButton.addEventListener("click", goToRegister);

    // รองรับการกด Enter
    document.addEventListener("keydown", (event) => {
        if (event.key === "Enter") loginButton.click();
    });

    console.log("All event listeners attached");
});