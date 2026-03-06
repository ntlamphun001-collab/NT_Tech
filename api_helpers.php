/**
 * ============================================
 * ไฟล์: api-helpers.js
 * หน้าที่: ฟังก์ชันช่วยเรียก API แทน Firebase
 * 
 * ✅ แทนที่: Firebase Firestore
 * ✅ ใช้: SQL Database ผ่าน PHP API
 * ============================================
 */

// ========================================
// 📍 ฟังก์ชันตรวจสอบ Session
// หน้าที่: ตรวจสอบว่าผู้ใช้ Login อยู่หรือไม่
// ========================================
async function checkAuth() {
    try {
        const response = await fetch('api_check_session.php');
        const result = await response.json();
        
        if (!result.logged_in) {
            // ❌ ไม่ได้ Login → ส่งกลับไปหน้า Login
            alert('⚠️ กรุณา Login ก่อนใช้งาน');
            window.location.href = 'login.html';
            return null;
        }
        
        // ✅ Login แล้ว → คืนค่าข้อมูลผู้ใช้
        return result.data;
    } catch (error) {
        console.error('❌ Error checking auth:', error);
        window.location.href = 'login.html';
        return null;
    }
}

// ========================================
// 🔥 ฟังก์ชัน Logout
// หน้าที่: ออกจากระบบและกลับไปหน้า Login
// ========================================
async function handleLogout() {
    try {
        await fetch('api_logout.php', { method: 'POST' });
        localStorage.removeItem('userData');
        window.location.href = 'login.html';
    } catch (error) {
        console.error('❌ Error logging out:', error);
        alert('เกิดข้อผิดพลาดในการออกจากระบบ');
    }
}

// ========================================
// 📦 STATIONS API - จัดการข้อมูลชุมสาย
// ========================================

/**
 * ⭐ ดึงข้อมูลชุมสายทั้งหมดหรือกรองตาม depname
 * @param {string} depname - ชื่อชุมสาย (ถ้าไม่ส่ง จะดึงทั้งหมด)
 * @returns {Promise} - {success, data, count}
 */
async function getStations(depname = null) {
    try {
        const url = depname 
            ? `api_stations.php?depname=${encodeURIComponent(depname)}`
            : 'api_stations.php';
        
        const response = await fetch(url);
        const result = await response.json();
        
        console.log('✅ Get Stations:', result);
        return result;
    } catch (error) {
        console.error('❌ Error getting stations:', error);
        return { success: false, message: error.message };
    }
}

/**
 * ⭐ ดึงข้อมูลชุมสายเฉพาะ ID
 * @param {number} id - Station ID
 * @returns {Promise} - {success, data}
 */
async function getStation(id) {
    try {
        const response = await fetch(`api_stations.php?id=${id}`);
        const result = await response.json();
        
        console.log('✅ Get Station:', result);
        return result;
    } catch (error) {
        console.error('❌ Error getting station:', error);
        return { success: false, message: error.message };
    }
}

/**
 * ⭐ เพิ่มชุมสายใหม่
 * @param {object} data - ข้อมูลชุมสาย
 * @returns {Promise} - {success, message, station_id}
 */
async function addStation(data) {
    try {
        const response = await fetch('api_stations.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        
        console.log('✅ Add Station:', result);
        return result;
    } catch (error) {
        console.error('❌ Error adding station:', error);
        return { success: false, message: error.message };
    }
}

/**
 * ⭐ แก้ไขข้อมูลชุมสาย
 * @param {number} id - Station ID
 * @param {object} data - ข้อมูลที่ต้องการแก้ไข
 * @returns {Promise} - {success, message}
 */
async function updateStation(id, data) {
    try {
        data.id = id;
        const response = await fetch('api_stations.php', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        
        console.log('✅ Update Station:', result);
        return result;
    } catch (error) {
        console.error('❌ Error updating station:', error);
        return { success: false, message: error.message };
    }
}

/**
 * ⭐ ลบชุมสาย
 * @param {number} id - Station ID
 * @returns {Promise} - {success, message}
 */
async function deleteStation(id) {
    try {
        const response = await fetch('api_stations.php', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
        const result = await response.json();
        
        console.log('✅ Delete Station:', result);
        return result;
    } catch (error) {
        console.error('❌ Error deleting station:', error);
        return { success: false, message: error.message };
    }
}

// ========================================
// 🔧 EQUIPMENT API - จัดการข้อมูลอุปกรณ์
// ========================================

/**
 * ⭐ ดึงข้อมูลอุปกรณ์ตาม station_id
 * @param {number} station_id - Station ID
 * @returns {Promise} - {success, data, count}
 */
async function getEquipment(station_id = null) {
    try {
        const url = station_id 
            ? `api_equipment.php?station_id=${station_id}`
            : 'api_equipment.php';
        
        const response = await fetch(url);
        const result = await response.json();
        
        console.log('✅ Get Equipment:', result);
        return result;
    } catch (error) {
        console.error('❌ Error getting equipment:', error);
        return { success: false, message: error.message };
    }
}

/**
 * ⭐ ดึงข้อมูลอุปกรณ์เฉพาะ ID
 * @param {number} id - Equipment ID
 * @returns {Promise} - {success, data}
 */
async function getEquipmentById(id) {
    try {
        const response = await fetch(`api_equipment.php?id=${id}`);
        const result = await response.json();
        
        console.log('✅ Get Equipment By ID:', result);
        return result;
    } catch (error) {
        console.error('❌ Error getting equipment:', error);
        return { success: false, message: error.message };
    }
}

/**
 * ⭐ เพิ่มอุปกรณ์ใหม่
 * @param {object} data - ข้อมูลอุปกรณ์
 * @returns {Promise} - {success, message, equipment_id}
 */
async function addEquipment(data) {
    try {
        const response = await fetch('api_equipment.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        
        console.log('✅ Add Equipment:', result);
        return result;
    } catch (error) {
        console.error('❌ Error adding equipment:', error);
        return { success: false, message: error.message };
    }
}

/**
 * ⭐ แก้ไขข้อมูลอุปกรณ์
 * @param {number} id - Equipment ID
 * @param {object} data - ข้อมูลที่ต้องการแก้ไข
 * @returns {Promise} - {success, message}
 */
async function updateEquipment(id, data) {
    try {
        data.id = id;
        const response = await fetch('api_equipment.php', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        
        console.log('✅ Update Equipment:', result);
        return result;
    } catch (error) {
        console.error('❌ Error updating equipment:', error);
        return { success: false, message: error.message };
    }
}

/**
 * ⭐ ลบอุปกรณ์
 * @param {number} id - Equipment ID
 * @returns {Promise} - {success, message}
 */
async function deleteEquipment(id) {
    try {
        const response = await fetch('api_equipment.php', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
        const result = await response.json();
        
        console.log('✅ Delete Equipment:', result);
        return result;
    } catch (error) {
        console.error('❌ Error deleting equipment:', error);
        return { success: false, message: error.message };
    }
}

// ========================================
// 📊 ฟังก์ชันแสดงชื่อผู้ใช้และปุ่ม Logout
// ========================================
async function initializeUserInterface() {
    const userData = await checkAuth();
    if (!userData) return;
    
    // แสดงชื่อผู้ใช้
    const adminNameEl = document.querySelector('.admin-name');
    if (adminNameEl) {
        adminNameEl.textContent = userData.username;
    }
    
    // เพิ่มปุ่ม Logout ถ้ายังไม่มี
    const topBar = document.querySelector('.top-bar');
    if (topBar && !document.getElementById('logoutBtn')) {
        const logoutBtn = document.createElement('button');
        logoutBtn.id = 'logoutBtn';
        logoutBtn.className = 'logout-btn';
        logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> ออกจากระบบ';
        logoutBtn.onclick = handleLogout;
        topBar.appendChild(logoutBtn);
    }
    
    return userData;
}

// ========================================
// 🎯 ฟังก์ชันเริ่มต้น
// ========================================
console.log('✅ API Helpers Loaded (SQL Version)');