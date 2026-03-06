/**
 * ============================================
 * ไฟล์: register.js
 * หน้าที่: จัดการการสมัครสมาชิก (User เท่านั้น)
 * ============================================
 * - ไม่มีตัวเลือก Admin (ถูกปิดไว้ตั้งแต่ฝั่ง frontend)
 * - เพิ่มช่อง Email สำหรับแสดงใต้ชื่อ User ในหน้าต่างๆ
 */

// ============================================
// 🔒 ปิดการเข้าถึง DevTools — เหมือน login.js
// ============================================
(function () {
    document.addEventListener('contextmenu', function (e) {
        e.preventDefault();
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'F12') { e.preventDefault(); return false; }
        if (e.ctrlKey && e.shiftKey && e.key === 'I') { e.preventDefault(); return false; }
        if (e.ctrlKey && e.shiftKey && e.key === 'J') { e.preventDefault(); return false; }
        if (e.ctrlKey && e.shiftKey && e.key === 'C') { e.preventDefault(); return false; }
        if (e.ctrlKey && e.key === 'u') { e.preventDefault(); return false; }
        if (e.ctrlKey && e.key === 's') { e.preventDefault(); return false; }
    });

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
    console.log("🚀 Register Script Loaded");

    // ============================================
    // 1. เชื่อมต่อ Elements
    // ============================================
    const registerBtn      = document.getElementById("registerBtn");
    const backBtn          = document.getElementById("backBtn");
    const usernameInput    = document.getElementById("usernameInput");
    const emailInput       = document.getElementById("emailInput");
    const passwordInput    = document.getElementById("passwordInput");
    const confirmPwInput   = document.getElementById("confirmPasswordInput");

    // ============================================
    // 2. ฟังก์ชันสมัครสมาชิก
    // ============================================
    async function handleRegister(event) {
        event.preventDefault();

        const username        = usernameInput.value.trim();
        const email           = emailInput.value.trim();
        const password        = passwordInput.value.trim();
        const confirmPassword = confirmPwInput.value.trim();

        if (!username || !email || !password || !confirmPassword) {
            alert("⚠️ กรุณากรอกข้อมูลให้ครบทุกช่อง");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert("⚠️ รูปแบบอีเมลไม่ถูกต้อง");
            return;
        }

        if (password !== confirmPassword) {
            alert("⚠️ รหัสผ่านไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง");
            return;
        }

        if (password.length < 6) {
            alert("⚠️ รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
            return;
        }

        const originalText = registerBtn.innerText;
        registerBtn.innerText = "กำลังสมัครสมาชิก...";
        registerBtn.disabled = true;

        try {
            const response = await fetch('api_register.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: username,
                    email: email,
                    password: password
                    // ไม่ส่ง role — ฝั่ง PHP กำหนด depid ให้เป็น User อัตโนมัติ
                })
            });

            const result = await response.json();
            console.log("📨 Register API Response:", result);

            if (result.success) {
                alert("✅ สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ");
                window.location.href = "login.html";
            } else {
                alert("❌ " + result.message);
                registerBtn.innerText = originalText;
                registerBtn.disabled = false;
            }

        } catch (error) {
            console.error("❌ Connection Error:", error);
            alert("❌ เกิดข้อผิดพลาดในการเชื่อมต่อ\nกรุณาตรวจสอบการเชื่อมต่อหรือ API");
            registerBtn.innerText = originalText;
            registerBtn.disabled = false;
        }
    }

    // ============================================
    // 3. ผูก Event Listeners
    // ============================================
    if (registerBtn) registerBtn.addEventListener("click", handleRegister);
    if (backBtn)     backBtn.addEventListener("click", () => { window.location.href = "login.html"; });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Enter") registerBtn.click();
    });

    console.log("✅ Register event listeners attached");
});