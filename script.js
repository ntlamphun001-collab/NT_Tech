// ========================================
// ⭐ script.js - SQL Version (แก้ไขแล้ว 100%)
// ไฟล์นี้ไม่มี Firebase เหลืออยู่เลย
// ========================================

// ========================================
// 🔐 ตรวจสอบ Session
// ========================================
(async function checkAuth() {
    console.log("🔐 Checking authentication...");
    
    try {
        const response = await fetch('api_check_session.php');
        const result = await response.json();
        
        console.log("📨 Session Check Result:", result);
        
        if (!result.logged_in) {
            console.log("❌ Not logged in - Redirecting to login page...");
            alert("⚠️ กรุณาเข้าสู่ระบบก่อนใช้งาน");
            window.location.href = "login.html";
            return;
        }
        
        console.log("✅ User is logged in:", result.data.username);
        
        const adminNameElement = document.querySelector('.admin-name');
        if (adminNameElement && result.data.username) {
            adminNameElement.textContent = result.data.username;
        }
        
        // ✅ แสดง Email ใต้ชื่อ User
        const adminEmailElement = document.querySelector('.admin-email');
        if (adminEmailElement) {
            adminEmailElement.textContent = result.data.email || '';
        }
        
        localStorage.setItem('userData', JSON.stringify(result.data));
        console.log("✅ Authentication check complete - Page ready");
        
    } catch (error) {
        console.error("❌ Authentication check failed:", error);
        alert("❌ ไม่สามารถตรวจสอบสิทธิ์ได้");
        window.location.href = "login.html";
    }
})();

// ========================================
// 🚪 ฟังก์ชัน Logout
// ========================================
async function handleLogout() {
    console.log("🚪 Logout requested");
    
    const confirmLogout = confirm("ต้องการออกจากระบบหรือไม่?");
    if (!confirmLogout) return;
    
    try {
        const response = await fetch('api_logout.php', {
            method: 'POST'
        });
        
        const result = await response.json();
        console.log("📨 Logout Result:", result);
        
        if (result.success) {
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

window.handleLogout = handleLogout;

function formatThaiDate(dateValue) {
    if (!dateValue || dateValue === '-' || dateValue === null || dateValue === undefined) return '-';

    try {
        // ⭐ จุดที่ 0: ตรวจ Excel Serial Number (ตัวเลขล้วน) ก่อนแปลงเป็น String
        if (typeof dateValue === 'number') {
            if (dateValue <= 0 || isNaN(dateValue)) return '-';
            if (dateValue > 1000 && dateValue < 200000) {
                const excelEpoch = new Date(1899, 11, 30);
                const dateObj = new Date(excelEpoch.getTime() + dateValue * 86400000);
                const d = String(dateObj.getDate()).padStart(2, '0');
                const mo = String(dateObj.getMonth() + 1).padStart(2, '0');
                let y = dateObj.getFullYear();
                if (y < 2300) y += 543;
                return `${d}/${mo}/${y}`;
            }
            return '-';
        }

        const strVal = String(dateValue).trim();
        if (strVal === '' || strVal === '0' || strVal === 'null' || strVal === 'undefined') return '-';

        // ⭐ จุดที่ 1: รูปแบบ DD/MM/YYYY
        const slashDMY = strVal.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
        if (slashDMY) {
            const d  = String(slashDMY[1]).padStart(2, '0');
            const mo = String(slashDMY[2]).padStart(2, '0');
            let y    = parseInt(slashDMY[3]);
            // ถ้าปี >= 2300 = พ.ศ. แล้ว ไม่ต้องบวกซ้ำ
            // ถ้าปี < 2300 = ค.ศ. ให้บวก 543
            if (y < 2300) y += 543;
            return `${d}/${mo}/${y}`;
        }

        // ⭐ จุดที่ 2: รูปแบบ YYYY-MM-DD หรือ YYYY-MM-DDThh:mm:ss (ISO จาก DB)
        const isoMatch = strVal.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (isoMatch) {
            const yearNum  = parseInt(isoMatch[1]);
            const monthNum = parseInt(isoMatch[2]);
            const dayNum   = parseInt(isoMatch[3]);
            // กรอง 0000-00-00 หรือ 1900-01-00 ที่ DB ส่งมาเมื่อค่า null
            if (yearNum === 0 || monthNum === 0 || dayNum === 0) return '-';
            if (yearNum === 1900 && monthNum === 1 && dayNum <= 1) return '-';
            const d  = String(dayNum).padStart(2, '0');
            const mo = String(monthNum).padStart(2, '0');
            let y    = yearNum;
            if (y < 2300) y += 543;
            return `${d}/${mo}/${y}`;
        }

        // ⭐ จุดที่ 3: Excel Serial Number ที่เป็น String เช่น "235832"
        const numVal = parseFloat(strVal);
        if (!isNaN(numVal) && numVal > 1000 && numVal < 200000 && /^\d+(\.\d+)?$/.test(strVal)) {
            const excelEpoch = new Date(1899, 11, 30);
            const dateObj = new Date(excelEpoch.getTime() + numVal * 86400000);
            const d  = String(dateObj.getDate()).padStart(2, '0');
            const mo = String(dateObj.getMonth() + 1).padStart(2, '0');
            let y    = dateObj.getFullYear();
            if (y < 2300) y += 543;
            return `${d}/${mo}/${y}`;
        }

        // ⭐ จุดที่ 4: Date Object
        if (dateValue instanceof Date && !isNaN(dateValue.getTime())) {
            const d  = String(dateValue.getDate()).padStart(2, '0');
            const mo = String(dateValue.getMonth() + 1).padStart(2, '0');
            let y    = dateValue.getFullYear();
            if (y < 2300) y += 543;
            return `${d}/${mo}/${y}`;
        }

        // ไม่รู้รูปแบบ
        console.warn('⚠️ Cannot parse date:', dateValue);
        return '-';

    } catch (error) {
        console.error('❌ Error formatting date:', dateValue, error);
        return '-';
    }
}

// ========================================
// 🔥 Cloudinary Configuration
// ========================================
const CLOUDINARY_CONFIG = {
    cloudName: 'dtsx2jqzl',
    uploadPreset: 'nt_engineering',
    folder: 'nt-engineering/stations',
    maxFiles: 10
};

// ========================================
// ✅ Toggle Sidebar
// ========================================
const toggleBtn = document.getElementById('toggleSidebar');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('sidebarOverlay');
const body = document.body;

if (window.innerWidth <= 768) {
    sidebar.classList.add('collapsed');
    body.classList.add('sidebar-collapsed');
}

toggleBtn.addEventListener('click', function() {
    sidebar.classList.toggle('collapsed');
    body.classList.toggle('sidebar-collapsed');
    
    if (window.innerWidth <= 768) {
        body.classList.toggle('sidebar-open');
        overlay.classList.toggle('active');
    }
    
    const icon = this.querySelector('i');
    if (sidebar.classList.contains('collapsed')) {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    } else {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
    }
});

overlay.addEventListener('click', function() {
    sidebar.classList.add('collapsed');
    body.classList.remove('sidebar-collapsed');
    body.classList.remove('sidebar-open');
    overlay.classList.remove('active');
    
    const icon = toggleBtn.querySelector('i');
    icon.classList.remove('fa-times');
    icon.classList.add('fa-bars');
});

document.querySelectorAll('.menu-item[data-submenu]').forEach(item => {
    const submenuId = item.getAttribute('data-submenu');
    if (!submenuId) return; 

    const submenu = document.getElementById(submenuId);
    if (!submenu) return; 

    item.addEventListener('click', function(e) {
        e.preventDefault(); 
        e.stopPropagation();
        this.classList.toggle('active');
        submenu.classList.toggle('show');
    });
});

if (window.innerWidth <= 768) {
    sidebar.classList.add('collapsed');
    body.classList.remove('sidebar-open');
    overlay.classList.remove('active');
    
    const icon = toggleBtn.querySelector('i');
    icon.classList.remove('fa-times');
    icon.classList.add('fa-bars');
}

// ========================================
// ✅ ฟังก์ชันค้นหา
// ========================================
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const searchType = document.getElementById('searchType');

function performSearch() {
    if (!searchInput || !searchType) return;
    const searchTerm = searchInput.value.toLowerCase();
    const type = searchType.value;
    const rows = document.querySelectorAll('tbody tr');
    
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        let found = false;
        
        let columnsToSearch = [];
        
        switch(type) {
            case 'all':
                columnsToSearch = [1, 2, 3, 4, 5, 6, 7];
                break;
            case 'code':
                columnsToSearch = [2];
                break;
            case 'shortname':
                columnsToSearch = [4];
                break;
            case 'thainame':
                columnsToSearch = [5];
                break;
            case 'engname':
                columnsToSearch = [6];
                break;
            case 'company':
                columnsToSearch = [7];
                break;
        }
        
        columnsToSearch.forEach(index => {
            if (cells[index] && cells[index].textContent.toLowerCase().includes(searchTerm)) {
                found = true;
            }
        });
        
        row.style.display = found ? '' : 'none';
    });
}

if (searchType) {
    searchType.addEventListener('change', function() {
        const placeholders = {
            'all': 'ค้นหาทั้งหมด...',
            'code': 'ค้นหารหัส 10 หลัก...',
            'shortname': 'ค้นหาชื่อย่อสถานที่...',
            'thainame': 'ค้นหาชื่อสถานที่ (ไทย)...',
            'engname': 'ค้นหาชื่อสถานที่ (อังกฤษ)...',
            'company': 'ค้นหาชื่อบริษัท...'
        };
        searchInput.placeholder = placeholders[this.value];
        performSearch();
        searchInput.focus();
    });
}
if (searchInput) {
    searchInput.addEventListener('input', performSearch);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') performSearch();
    });
}
if (searchBtn) searchBtn.addEventListener('click', performSearch);

// ========================================
// ✅ Excel Import
// ========================================
const addExcelBtn = document.getElementById('addExcelBtn');
const excelFileInput = document.getElementById('excelFileInput');
const tableBody = document.querySelector('tbody');

let fullDataStorage = [];

if (addExcelBtn) {
    addExcelBtn.addEventListener('click', function() {
        excelFileInput.click();
    });
}

if (excelFileInput) {
    excelFileInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            
            const firstSheetName = workbook.SheetNames[0];
            const firstSheet = workbook.Sheets[firstSheetName];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
            
            let dataRows = jsonData.slice(1).filter(row => {
                return row && row.length > 0 && row.some(cell => cell !== null && cell !== undefined && cell !== '');
            });
            
            console.log(`📊 พบข้อมูลทั้งหมด: ${dataRows.length} แถว`);
            
            fullDataStorage = dataRows;
            tableBody.innerHTML = ''; 
            
            dataRows.forEach((row, index) => {
                const tr = document.createElement('tr');
                tr.setAttribute('data-row-index', index);
                
                const tdCheckbox = document.createElement('td');
                tdCheckbox.innerHTML = '<input type="checkbox">';
                tr.appendChild(tdCheckbox);
                
                const tdNumber = document.createElement('td');
                tdNumber.textContent = row[0] || (index + 1);
                tr.appendChild(tdNumber);
                
                const badgeColors = ['status-open', 'status-paid', 'status-due', 'status-inactive'];
                const randomColor = badgeColors[Math.floor(Math.random() * badgeColors.length)];

                for (let i = 1; i <= 36; i++) {
                    const td = document.createElement('td');
                    let val = row[i] === undefined || row[i] === null ? '-' : row[i];
                    
                    if (i === 3 && val !== '-') {
                        td.innerHTML = `<span class="status-badge ${randomColor}">${val}</span>`;
                    } else {
                        td.textContent = val;
                    }
                    tr.appendChild(td);
                }

                const tdManage = document.createElement('td');
                tdManage.innerHTML = `
                    <div style="display: flex; gap: 8px;">
                        <button class="icon-btn edit-preview" style="color: #f39c12; background:none; border:none; cursor:pointer;">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="icon-btn delete-preview" style="color: #e74c3c; background:none; border:none; cursor:pointer;">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;
                tr.appendChild(tdManage);
                
                tr.style.cursor = 'pointer';
                tr.addEventListener('click', function(event) {
                    if (event.target.type === 'checkbox' || event.target.closest('button')) return;
                    showDetailModal(index);
                });
                
                tableBody.appendChild(tr);
            });
            
            alert(`✅ นำเข้าพรีวิวสำเร็จ! พบ ${dataRows.length} รายการ\nกรุณาตรวจสอบความถูกต้องก่อนกด Upload`);
            
            // ✅ แสดงปุ่ม Upload (listener ผูกไว้แล้วที่ global scope)
            const uploadBtn = document.getElementById('uploadBtn');
            if (uploadBtn) {
                uploadBtn.style.display = 'inline-flex';
            } else {
                console.warn('⚠️ ไม่พบปุ่ม Upload (uploadBtn) ใน HTML');
            }
            
        } catch (error) {
            console.error('Error processing Excel:', error);
            alert('❌ เกิดข้อผิดพลาดในการอ่านไฟล์: ' + error.message);
        }
    };
    
    reader.readAsArrayBuffer(file);
    });
} // end if(excelFileInput)

// ========================================
// ✅ Show Detail Modal
// ========================================
function showDetailModal(rowIndex) {
    const row = fullDataStorage[rowIndex];
    if (!row) return;

    window.currentRowIndex = rowIndex; 

    const isArray = Array.isArray(row);

    const lat = isArray ? row[31] : row.Lat; 
    const long = isArray ? row[32] : row.Long; 
    const latNum = parseFloat(lat);
    const longNum = parseFloat(long);

    const fieldMap = {
        'det-id': isArray ? row[1] : row.รหัส10หลัก,
        'det-sector': isArray ? row[2] : row.ภาคขายและบริการ,
        'det-short': isArray ? row[3] : row.ชื่อย่อสถานที่,
        'det-th': isArray ? row[4] : row.ชื่อสถานที่ไทย,
        'det-th-old': isArray ? row[5] : row.ชื่อสถานที่ไทยเดิม,
        'det-en': isArray ? row[6] : row.ชื่อสถานที่อังกฤษ,
        'det-en-old': isArray ? row[7] : row.ชื่อสถานที่อังกฤษเดิม,
        'det-comp': isArray ? row[8] : row.ชื่อบริษัท,
        'det-status': isArray ? row[9] : row.สถานะ,
        'det-homing': isArray ? row[10] : row.Homing,
        'det-center': isArray ? row[11] : row.ศูนย์บริการลูกค้า,
        'det-rank': isArray ? row[12] : row.Rank,
        'det-size': isArray ? row[13] : row.ขนาดเลขหมาย,
        'det-proj': isArray ? row[14] : row.โครงการ,
        'det-base': isArray ? row[15] : row.รหัสสถานีฐานบริษัท,
        'det-siteth': isArray ? row[16] : row.SITE_NAMETH,
        'det-sitelat': isArray ? row[17] : row.SITE_LAT,
        'det-sitelong': isArray ? row[18] : row.SITE_LONG,
        'det-sitetype': isArray ? row[19] : row.SITE_TYPE,
        'det-equip': isArray ? row[20] : row.SITE_EQUIPMENT,
        'det-owner': isArray ? row[22] : row.SITE_OWNER,
        'det-loc': isArray ? row[23] : row.สถานที่ติดตั้ง,
        'det-soi': isArray ? row[24] : row.ซอย,
        'det-road': isArray ? row[25] : row.ถนน,
        'det-village': isArray ? row[26] : row.หมู่บ้าน,
        'det-tambon': isArray ? row[27] : row.แขวงตำบล,
        'det-amphoe': isArray ? row[28] : row.เขตอำเภอ,
        'det-province': isArray ? row[29] : row.จังหวัด,
        'det-zip': isArray ? row[30] : row.รหัสไปรณีย์,
        'det-lat': lat,
        'det-long': long,
        'det-dept': isArray ? row[33] : row.ส่วนงานผู้ขอรหัส,
        'det-date': isArray ? formatThaiDate(row[34]) : formatThaiDate(row.วันที่อนุมัติ),
        'det-creator': isArray ? row[35] : row.ผู้จัดทำ,
        'det-note': isArray ? row[36] : row.หมายเหตุ
    };

    for (const [id, value] of Object.entries(fieldMap)) {
        const el = document.getElementById(id);
        if (el) {
            el.value = (value !== undefined && value !== null && value !== "") ? value : "";
        }
    }

    const mapFrame = document.getElementById('modalMapFrame'); 
    if (mapFrame) {
        if (!isNaN(latNum) && !isNaN(longNum) && latNum !== 0) {
            mapFrame.src = `https://maps.google.com/maps?q=${latNum},${longNum}&z=15&output=embed`;
            mapFrame.parentElement.style.display = 'block';
        } else {
            mapFrame.parentElement.style.display = 'none';
        }
    }

    const addImgBtn = document.getElementById('addImageBtn');
    if (addImgBtn) {
        addImgBtn.onclick = () => openCloudinaryWidget(rowIndex);
    }

    const modal = document.getElementById('detailsModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

// ========================================
// 📸 Cloudinary Upload Widget
// ========================================
function openCloudinaryWidget(rowIndex) {
    console.log('📸 Opening Cloudinary Widget for rowIndex:', rowIndex);
    
    if (CLOUDINARY_CONFIG.cloudName === 'YOUR_CLOUD_NAME_HERE' || 
        CLOUDINARY_CONFIG.uploadPreset === 'YOUR_UPLOAD_PRESET_HERE') {
        alert('⚠️ กรุณาแก้ไข CLOUDINARY_CONFIG ใน script.js ก่อน\n\ncloudName: ' + CLOUDINARY_CONFIG.cloudName + '\nuploadPreset: ' + CLOUDINARY_CONFIG.uploadPreset);
        console.error('❌ Cloudinary config not set');
        return;
    }
    
    if (typeof cloudinary === 'undefined') {
        alert('❌ Cloudinary library ยังไม่ถูกโหลด\nกรุณา Refresh หน้าเว็บ (F5)');
        console.error('❌ Cloudinary library not loaded');
        return;
    }
    
    console.log('✅ Creating widget with config:', {
        cloudName: CLOUDINARY_CONFIG.cloudName,
        uploadPreset: CLOUDINARY_CONFIG.uploadPreset
    });
    
    const widget = cloudinary.createUploadWidget({
        cloudName: CLOUDINARY_CONFIG.cloudName,  
        uploadPreset: CLOUDINARY_CONFIG.uploadPreset,
        folder: CLOUDINARY_CONFIG.folder,
        maxFiles: CLOUDINARY_CONFIG.maxFiles,
        multiple: true,
        sources: ['local', 'camera'],
        maxFileSize: 10000000,
        clientAllowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        styles: {
            palette: {
                window: "#FFFFFF",
                windowBorder: "#90A0B3",
                tabIcon: "#FFD101",
                menuIcons: "#5A616A",
                textDark: "#000000",
                textLight: "#FFFFFF",
                link: "#4285f4",
                action: "#FFD101",
                inactiveTabIcon: "#0E2F5A",
                error: "#F44235",
                inProgress: "#0078FF",
                complete: "#20B832",
                sourceBg: "#E4EBF1"
            }
        }
    }, (error, result) => {
        if (error) {
            console.error('Upload error:', error);
            alert('❌ เกิดข้อผิดพลาดในการอัปโหลด: ' + error.message);
            return;
        }
        
        if (result && result.event === 'success') {
            console.log('✅ Uploaded:', result.info.secure_url);
            
            const loadingDiv = document.createElement('div');
            loadingDiv.innerHTML = `
                <div style="position: fixed; top: 20px; right: 20px; background: #4CAF50; color: white; padding: 15px 20px; border-radius: 8px; z-index: 10002; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
                    ⏳ กำลังบันทึกรูปภาพ...
                </div>
            `;
            document.body.appendChild(loadingDiv);
            
            saveImageToDatabase(rowIndex, result.info.secure_url).then(() => {
                loadingDiv.remove();
            }).catch(() => {
                loadingDiv.remove();
            });
        }
    });
    
    console.log('📤 Opening widget...');
    widget.open();
}

// ========================================
// ⭐ แก้ไขจุดที่ 1: บันทึกรูปลง Database (ไม่ใช่ Firestore)
// ========================================
async function saveImageToDatabase(rowIndex, imageUrl) {
    try {
        const row = fullDataStorage[rowIndex];
        const code = row[1];
        
        // ✅ ดึงข้อมูลจาก API
        const response = await fetch(`api_get_stations.php?code=${encodeURIComponent(code)}`);
        const result = await response.json();

        if (!result.success || !result.data || result.data.length === 0) {
            alert('❌ ไม่พบข้อมูล');
            return;
        }

        const station = result.data[0];
        const currentImages = station.images ? JSON.parse(station.images) : [];
        
        // ✅ เพิ่ม URL ใหม่ (ไม่ใช่ splice)
        currentImages.push(imageUrl);

        // ✅ อัพเดตผ่าน API
        await fetch('api_update_station.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: station.id,
                images: JSON.stringify(currentImages)
            })
        });
        
        console.log('✅ Image saved to database');
        
        // อัปเดต fullDataStorage
        if (!fullDataStorage[rowIndex][38]) {
            fullDataStorage[rowIndex][38] = imageUrl;
        } else {
            fullDataStorage[rowIndex][38] += ',' + imageUrl;
        }
        
        // รีเฟรช Modal
        const modal = document.getElementById('detailsModal');
        if (modal) {
            modal.style.display = 'none';
        }
        showDetailModal(rowIndex);
        
    } catch (error) {
        console.error('Error saving image:', error);
        alert('❌ เกิดข้อผิดพลาด: ' + error.message);
    }
}

// ========================================
// ⭐ แก้ไขจุดที่ 2: ลบรูป
// ========================================
async function deleteImage(rowIndex, imageIndex) {
    if (!confirm('ต้องการลบรูปนี้หรือไม่?')) return;
    
    try {
        const row = fullDataStorage[rowIndex];
        const code = row[1];
        
        const response = await fetch(`api_get_stations.php?code=${encodeURIComponent(code)}`);
        const result = await response.json();

        if (!result.success || !result.data || result.data.length === 0) {
            alert('❌ ไม่พบข้อมูล');
            return;
        }
        
        const station = result.data[0];
        const currentImages = station.images ? JSON.parse(station.images) : [];

        // ✅ ลบรูปออก (ไม่ใช่ push)
        currentImages.splice(imageIndex, 1);

        await fetch('api_update_station.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: station.id,
                images: JSON.stringify(currentImages)
            })
        });
        
        console.log('✅ Image deleted');
        
        fullDataStorage[rowIndex][38] = currentImages.join(',');
        
        const modal = document.getElementById('detailsModal');
        if (modal) {
            modal.style.display = 'none';
        }
        showDetailModal(rowIndex);
        
    } catch (error) {
        console.error('Error deleting image:', error);
        alert('❌ เกิดข้อผิดพลาด: ' + error.message);
    }
}

// ========================================
// 🖼️ เปิดรูปเต็มจอ
// ========================================
function openImageModal(imageUrl) {
    const lightboxHTML = `
        <div id="imageLightbox" style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10001;
            cursor: pointer;
        " onclick="this.remove()">
            <img src="${imageUrl}" style="
                max-width: 90%;
                max-height: 90%;
                object-fit: contain;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.5);
            ">
            <button style="
                position: absolute;
                top: 20px;
                right: 20px;
                background: rgba(231, 76, 60, 0.9);
                color: white;
                border: none;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                cursor: pointer;
                font-size: 24px;
            ">×</button>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', lightboxHTML);
}

// ========================================
// ✅ Upload to Database
// ========================================
async function uploadToDatabase(dataRows) {
    try {
        // ตรวจสอบว่า dataRows เป็น Array of Arrays หรือ Array of Objects
        const isArrayRows = dataRows.length > 0 && Array.isArray(dataRows[0]);

        const filteredRows = dataRows.filter(row => {
            if (!row) return false;
            if (isArrayRows) {
                return Array.isArray(row) && row.length > 0 && row.some(cell =>
                    cell !== null && cell !== undefined && cell !== '' && cell !== ' ');
            } else {
                return typeof row === 'object' && Object.values(row).some(cell =>
                    cell !== null && cell !== undefined && cell !== '' && cell !== ' ');
            }
        });
        
        console.log(`📊 Original: ${dataRows.length}, Filtered: ${filteredRows.length}`);
        
        if (filteredRows.length === 0) {
            alert('❌ ไม่พบข้อมูลที่จะอัปโหลด');
            return;
        }
        
        const loadingMsg = document.createElement('div');
        loadingMsg.id = 'uploadLoading';
        loadingMsg.innerHTML = `
            <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 10000;">
                <div style="background: white; padding: 30px; border-radius: 10px; text-align: center;">
                    <div style="font-size: 20px; margin-bottom: 15px;">📤 กำลังอัปโหลด...</div>
                    <div style="font-size: 16px; color: #666;"><span id="uploadProgress">0</span> / ${filteredRows.length} แถว</div>
                    <div style="margin-top: 15px;">
                        <div style="width: 300px; height: 20px; background: #f0f0f0; border-radius: 10px; overflow: hidden;">
                            <div id="uploadProgressBar" style="width: 0%; height: 100%; background: #FFD101; transition: width 0.3s;"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(loadingMsg);

        const progressText = document.getElementById('uploadProgress');
        const progressBar = document.getElementById('uploadProgressBar');
        
        let uploadedCount = 0;
        let errorCount = 0;

        for (let i = 0; i < filteredRows.length; i++) {
            const row = filteredRows[i];

            let docData;

            if (isArrayRows) {
                // ---- Array row (จากไฟล์ Excel ที่ยังไม่ได้บันทึก) ----
                docData = {
                    ลำดับ: row[0] ? Number(row[0]) : null,
                    รหัส10หลัก: row[1] || null,
                    ภาคขายและบริการ: row[2] || null,
                    ชื่อย่อสถานที่: row[3] || null,
                    ชื่อสถานที่ไทย: row[4] || null,
                    ชื่อสถานที่ไทยเดิม: row[5] || null,
                    ชื่อสถานที่อังกฤษ: row[6] || null,
                    ชื่อสถานที่อังกฤษเดิม: row[7] || null,
                    ชื่อบริษัท: row[8] || null,
                    สถานะ: row[9] || null,
                    Homing: row[10] || null,
                    ศูนย์บริการลูกค้า: row[11] || null,
                    Rank: row[12] || null,
                    ขนาดเลขหมาย: row[13] || null,
                    โครงการ: row[14] || null,
                    รหัสสถานีฐานบริษัท: row[15] || null,
                    SITE_NAMETH: row[16] || null,
                    SITE_LAT: row[17] || null,
                    SITE_LONG: row[18] || null,
                    SITE_TYPE: row[19] || null,
                    SITE_EQUIPMENT: row[20] || null,
                    SITE_TYPE2: row[21] || null,
                    SITE_OWNER: row[22] || null,
                    สถานที่ติดตั้ง: row[23] || null,
                    ซอย: row[24] || null,
                    ถนน: row[25] || null,
                    หมู่บ้าน: row[26] || null,
                    แขวงตำบล: row[27] || null,
                    เขตอำเภอ: row[28] || null,
                    จังหวัด: row[29] || null,
                    รหัสไปรณีย์: row[30] || null,
                    Lat: row[31] ? Number(row[31]) : null,
                    Long: row[32] ? Number(row[32]) : null,
                    ส่วนงานผู้ขอรหัส: row[33] || null,
                    // ส่งค่าดิบไปให้ PHP แปลง — รองรับ Excel Serial, DD/MM/YYYY, ISO
                    วันที่อนุมัติ: (row[34] !== null && row[34] !== undefined && row[34] !== '') ? row[34] : null,       // ส่งค่าดิบ (number/string) ไป PHP ไม่ wrap String
                    ผู้จัดทำ: row[35] || null,
                    หมายเหตุ: row[36] || null,
                    images: row[37] ? String(row[37]).split(',').map(url => url.trim()).filter(url => url) : []
                };
            } else {
                // ---- Object row (จาก fullDataStorage ที่โหลดจาก DB) ----
                docData = {
                    ลำดับ: row.ลำดับ ? Number(row.ลำดับ) : null,
                    รหัส10หลัก: row.รหัส10หลัก || null,
                    ภาคขายและบริการ: row.ภาคขายและบริการ || null,
                    ชื่อย่อสถานที่: row.ชื่อย่อสถานที่ || null,
                    ชื่อสถานที่ไทย: row.ชื่อสถานที่ไทย || null,
                    ชื่อสถานที่ไทยเดิม: row.ชื่อสถานที่ไทยเดิม || null,
                    ชื่อสถานที่อังกฤษ: row.ชื่อสถานที่อังกฤษ || null,
                    ชื่อสถานที่อังกฤษเดิม: row.ชื่อสถานที่อังกฤษเดิม || null,
                    ชื่อบริษัท: row.ชื่อบริษัท || null,
                    สถานะ: row.สถานะ || null,
                    Homing: row.Homing || null,
                    ศูนย์บริการลูกค้า: row.ศูนย์บริการลูกค้า || null,
                    Rank: row.Rank || null,
                    ขนาดเลขหมาย: row.ขนาดเลขหมาย || null,
                    โครงการ: row.โครงการ || null,
                    รหัสสถานีฐานบริษัท: row.รหัสสถานีฐานบริษัท || null,
                    SITE_NAMETH: row.SITE_NAMETH || null,
                    SITE_LAT: row.SITE_LAT || null,
                    SITE_LONG: row.SITE_LONG || null,
                    SITE_TYPE: row.SITE_TYPE || null,
                    SITE_EQUIPMENT: row.SITE_EQUIPMENT || null,
                    SITE_TYPE2: row.SITE_TYPE2 || null,
                    SITE_OWNER: row.SITE_OWNER || null,
                    สถานที่ติดตั้ง: row.สถานที่ติดตั้ง || null,
                    ซอย: row.ซอย || null,
                    ถนน: row.ถนน || null,
                    หมู่บ้าน: row.หมู่บ้าน || null,
                    แขวงตำบล: row.แขวงตำบล || null,
                    เขตอำเภอ: row.เขตอำเภอ || null,
                    จังหวัด: row.จังหวัด || null,
                    รหัสไปรณีย์: row.รหัสไปรษณีย์ || row.รหัสไปรณีย์ || null,
                    Lat: row.Lat ? Number(row.Lat) : null,
                    Long: row.Long ? Number(row.Long) : null,
                    ส่วนงานผู้ขอรหัส: row.ส่วนงานผู้ขอรหัส || null,
                    วันที่อนุมัติ: row.วันที่อนุมัติ || null,
                    ผู้จัดทำ: row.ผู้จัดทำ || null,
                    หมายเหตุ: row.หมายเหตุ || null,
                    images: row.images || []
                };
            }

            try {
                const response = await fetch('api_add_station.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(docData)
                });
                
                const result = await response.json();
                
                if (result.success) {
                    uploadedCount++;
                } else {
                    errorCount++;
                    console.warn(`⚠️ Row ${i + 1} failed:`, result.message);
                }
            } catch (rowErr) {
                errorCount++;
                console.error(`❌ Row ${i + 1} error:`, rowErr);
            }

            progressText.textContent = uploadedCount;
            progressBar.style.width = `${((uploadedCount + errorCount) / filteredRows.length) * 100}%`;
        }

        document.getElementById('uploadLoading').remove();

        if (errorCount > 0) {
            alert(`✅ อัปโหลดเสร็จสิ้น!\n\nสำเร็จ: ${uploadedCount} แถว\nผิดพลาด: ${errorCount} แถว`);
        } else {
            alert(`✅ อัปโหลดสำเร็จทั้งหมด!\n\nอัปโหลด: ${uploadedCount} แถว`);
        }
        
        // รีเซ็ต fullDataStorage เพื่อป้องกันอัปโหลดซ้ำ
        fullDataStorage = [];
        loadRealtimeData();

    } catch (error) {
        console.error('Upload error:', error);
        const loadingElement = document.getElementById('uploadLoading');
        if (loadingElement) loadingElement.remove();
        alert(`❌ เกิดข้อผิดพลาด:\n${error.message}`);
    }
}

// ========================================
// ✅ Load Realtime Data
// ========================================
async function loadRealtimeData() {
    const tableBody = document.getElementById('mainTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '<tr><td colspan="39" style="text-align:center; padding:30px;">⏳ กำลังโหลดข้อมูลชุมสายทั้งหมด...</td></tr>';

    try {
        const response = await fetch('api_get_stations.php');
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.message || 'Failed to load data');
        }
        
        const stations = result.data || [];
        
        tableBody.innerHTML = ''; 
        fullDataStorage = [];

        stations.forEach((data, index) => {
            fullDataStorage.push(data);
            
            const tr = document.createElement('tr');
            const badgeColors = ['status-open', 'status-paid', 'status-due', 'status-inactive'];
            const randomColor = badgeColors[Math.floor(Math.random() * badgeColors.length)];

            tr.innerHTML = `
                <td><input type="checkbox"></td>
                <td>${data.ลำดับ || '-'}</td>
                <td>${data.รหัส10หลัก || '-'}</td>
                <td>${data.ภาคขายและบริการ || '-'}</td>
                <td><span class="status-badge ${randomColor}">${data.ชื่อย่อสถานที่ || '-'}</span></td>
                <td>${data.ชื่อสถานที่ไทย || '-'}</td>
                <td>${data.ชื่อสถานที่ไทยเดิม || '-'}</td>
                <td>${data.ชื่อสถานที่อังกฤษ || '-'}</td>
                <td>${data.ชื่อสถานที่อังกฤษเดิม || '-'}</td>
                <td>${data.ชื่อบริษัท || '-'}</td>
                <td>${data.สถานะ || '-'}</td>
                <td>${data.Homing || '-'}</td>
                <td>${data.ศูนย์บริการลูกค้า || '-'}</td>
                <td>${data.Rank || '-'}</td>
                <td>${data.ขนาดเลขหมาย || '-'}</td>
                <td>${data.โครงการ || '-'}</td>
                <td>${data.รหัสสถานีฐานบริษัท || '-'}</td>
                <td>${data.SITE_NAMETH || '-'}</td>
                <td>${data.SITE_LAT || '-'}</td>
                <td>${data.SITE_LONG || '-'}</td>
                <td>${data.SITE_TYPE || '-'}</td>
                <td>${data.SITE_EQUIPMENT || '-'}</td>
                <td>${data.SITE_TYPE || '-'}</td>
                <td>${data.SITE_OWNER || '-'}</td>
                <td>${data.สถานที่ติดตั้ง || '-'}</td>
                <td>${data.ซอย || '-'}</td>
                <td>${data.ถนน || '-'}</td>
                <td>${data.หมู่บ้าน || '-'}</td>
                <td>${data.แขวงตำบล || '-'}</td>
                <td>${data.เขตอำเภอ || '-'}</td>
                <td>${data.จังหวัด || '-'}</td>
                <td>${data.รหัสไปรษณีย์ || '-'}</td>
                <td>${data.Lat || '-'}</td>
                <td>${data.Long || '-'}</td>
                <td>${data.ส่วนงานผู้ขอรหัส || '-'}</td>
                <td>${formatThaiDate(data.วันที่อนุมัติ)}</td>
                <td>${data.ผู้จัดทำ || '-'}</td>
                <td>${data.หมายเหตุ || '-'}</td>
                <td>
                    <div style="display: flex; gap: 8px;">
                        <button onclick="editStation('${data.id}')" style="background:none; border:none; color:#f39c12; cursor:pointer;" title="แก้ไขข้อมูล"><i class="fas fa-edit"></i></button>
                        <button onclick="deleteStation('${data.id}', '${data.ชื่อสถานที่ไทย}')" style="background:none; border:none; color:#e74c3c; cursor:pointer;" title="ลบข้อมูล"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            `;

            const currentIndex = index;
            tr.addEventListener('click', (e) => {
                if (e.target.closest('button') || e.target.type === 'checkbox') return;
                showDetailModal(currentIndex);
            });
            
            tableBody.appendChild(tr);
        });

        console.log(`✅ โหลดข้อมูลสำเร็จ: ${stations.length} รายการ`);

    } catch (error) {
        console.error("❌ Error:", error);
        tableBody.innerHTML = '<tr><td colspan="39" style="text-align:center; color:red; padding:20px;">เกิดข้อผิดพลาดในการโหลดข้อมูล</td></tr>';
    }
}

// ========================================
// ✅ Delete Station
// ========================================
async function deleteStation(id, name) {
    if (confirm(`คุณต้องการลบข้อมูลของชุมสาย "${name}" ใช่หรือไม่?`)) {
        try {
            const response = await fetch('api_delete_station.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: id })
            });
            
            const result = await response.json();
            
            if (result.success) {
                alert('✅ ลบข้อมูลเรียบร้อยแล้ว');
                loadRealtimeData();
            } else {
                alert('❌ ' + result.message);
            }
        } catch (error) {
            alert('❌ เกิดข้อผิดพลาด: ' + error.message);
        }
    }
}

// ========================================
// ✅ Edit Station
// ========================================
function editStation(docId) {
    const index = fullDataStorage.findIndex(item => item.id == docId);
    
    if (index === -1) {
        alert("❌ ไม่พบข้อมูลที่ต้องการแก้ไข");
        return;
    }
    
    showDetailModal(index);
    console.log("กำลังแก้ไขข้อมูล ID:", docId);
}

// ========================================
// ✅ Update Overall Stats (เรียก api_get_equipment_stats.php)
// ========================================
async function updateOverallStats() {
    try {
        const response = await fetch('api_get_equipment_stats.php');
        const result = await response.json();

        if (!result.success) {
            console.warn("⚠️ Stats API error:", result.message);
            return;
        }

        const stats = result.data || {};

        const categories = [
            { id: 'count-air',         type: 'air',         label: 'Air Conditioner' },
            { id: 'count-battery',     type: 'battery',     label: 'Battery' },
            { id: 'count-generator',   type: 'generator',   label: 'Generator' },
            { id: 'count-transformer', type: 'transformer', label: 'Transformer' },
            { id: 'count-rectifier',   type: 'rectifier',   label: 'Rectifier' },
            { id: 'count-pea',         type: 'peameter',    label: 'PEA Meter' },
            { id: 'count-solar',       type: 'solar',       label: 'Solar Cell' },
            { id: 'count-property',    type: 'property',    label: 'Property' }
        ];

        categories.forEach(cat => {
            const el = document.getElementById(cat.id);
            if (el) {
                const count = stats[cat.type] || 0;
                el.textContent = count;

                // ✅ ทำให้ stat-card ทั้งหมดคลิกได้ เพิ่ม cursor + onclick
                const card = el.closest('.stat-card');
                if (card && !card.dataset.statsClickBound) {
                    card.style.cursor = 'pointer';
                    card.title = `คลิกเพื่อดูรายละเอียด ${cat.label}`;
                    card.addEventListener('click', () => openEquipmentStatsPopup(cat.type, cat.label));
                    card.dataset.statsClickBound = 'true';
                }
            }
        });

        console.log("📊 Stats updated:", stats);
        // Property breakdown
const elInuse  = document.getElementById('prop-inuse');
const elVacant = document.getElementById('prop-vacant');
const elRent   = document.getElementById('prop-rent');
const elIncome = document.getElementById('prop-income');
if (elInuse)  elInuse.textContent  = stats.property_inuse  || 0;
if (elVacant) elVacant.textContent = stats.property_vacant || 0;
if (elRent)   elRent.textContent   = stats.property_rent   || 0;
if (elIncome) elIncome.textContent = Number(stats.property_income || 0).toLocaleString();

    } catch (error) {
        console.error("❌ Stats Update Error:", error);
    }
}

// ========================================
// ✅ Popup แสดงรายละเอียดอุปกรณ์ทุกชุมสาย (เพิ่มใหม่)
// ========================================
async function openEquipmentStatsPopup(type, label) {
    // สร้าง overlay + modal
    const existingPopup = document.getElementById('equipStatsPopup');
    if (existingPopup) existingPopup.remove();

    const typeIconMap = {
        air: 'fa-temperature-low', battery: 'fa-battery-full',
        generator: 'fa-charging-station', transformer: 'fa-bolt',
        rectifier: 'fa-microchip', peameter: 'fa-tachometer-alt',
        solar: 'fa-solar-panel', property: 'fa-building'
    };
    const icon = typeIconMap[type] || 'fa-list';

    const popup = document.createElement('div');
    popup.id = 'equipStatsPopup';
    popup.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.6); z-index: 9999;
        display: flex; align-items: center; justify-content: center;
    `;
    popup.innerHTML = `
        <div style="background:#fff; border-radius:12px; width:92%; max-width:900px;
                    max-height:85vh; display:flex; flex-direction:column;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.3); overflow:hidden;">
            <!-- Header -->
            <div style="background:#FFD101; padding:16px 20px;
                        display:flex; justify-content:space-between; align-items:center; flex-shrink:0;">
                <div style="display:flex; align-items:center; gap:12px;">
                    <i class="fas ${icon}" style="font-size:20px; color:#333;"></i>
                    <div>
                        <div style="font-size:18px; font-weight:700; color:#333;">${label}</div>
                        <div style="font-size:12px; color:#555;">ยอดรวมทุกชุมสาย</div>
                    </div>
                </div>
                <button onclick="document.getElementById('equipStatsPopup').remove()"
                    style="background:none; border:none; font-size:26px; cursor:pointer; color:#333; line-height:1;">&times;</button>
            </div>
            <!-- Loading -->
            <div id="equipStatsBody" style="padding:30px; text-align:center; color:#666; flex:1; overflow-y:auto;">
                <i class="fas fa-spinner fa-spin" style="font-size:28px; color:#FFD101;"></i>
                <div style="margin-top:12px;">กำลังโหลดข้อมูล...</div>
            </div>
        </div>
    `;
    document.body.appendChild(popup);

    // ปิดเมื่อคลิก overlay
    popup.addEventListener('click', (e) => {
        if (e.target === popup) popup.remove();
    });
    if (type === 'property') {
        const res    = await fetch('api_properties.php');
        const result = await res.json();
        const body   = document.getElementById('equipStatsBody');
        if (!body) return;
        if (!result.success || !result.data || !result.data.length) {
            body.innerHTML = `<div style="padding:40px;color:#999;text-align:center;">ยังไม่มีข้อมูล Property</div>`;
            return;
        }
        const props  = result.data;
        const inuse  = props.filter(p => (p.status||'').includes('ใช้งาน')).length;
        const vacant = props.filter(p => (p.status||'').includes('ว่าง')).length;
        const rent   = props.filter(p => (p.status||'').includes('เช่า')).length;
        const income = props.reduce((s, p) => s + (parseFloat(p.rent)||0), 0);
        const sbadge = s => {
            const bg = s.includes('ใช้งาน') ? '#d4edda' : s.includes('ว่าง') ? '#fff3cd' : '#cce5ff';
            const cl = s.includes('ใช้งาน') ? '#155724' : s.includes('ว่าง') ? '#856404' : '#004085';
            return `<span style="background:${bg};color:${cl};padding:2px 8px;border-radius:12px;font-size:11px;">${s||'-'}</span>`;
        };
        body.innerHTML = `
            <div style="padding:16px 20px 8px;">
                <div style="font-weight:700;color:#333;margin-bottom:10px;">
                    ยอดรวม: <span style="color:#e74c3c;">${props.length}</span> แปลง
                </div>
                <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px;">
                    <div style="background:#d4edda;color:#155724;border-radius:8px;padding:6px 14px;font-size:13px;">✅ ใช้งาน <strong>${inuse}</strong></div>
                    <div style="background:#fff3cd;color:#856404;border-radius:8px;padding:6px 14px;font-size:13px;">🔍 ว่าง <strong>${vacant}</strong></div>
                    <div style="background:#cce5ff;color:#004085;border-radius:8px;padding:6px 14px;font-size:13px;">🔑 ให้เช่า <strong>${rent}</strong></div>
                    <div style="background:#fff8e1;color:#b8860b;border-radius:8px;padding:6px 14px;font-size:13px;">💰 รายได้/เดือน <strong>${income.toLocaleString()} บ.</strong></div>
                </div>
            </div>
            <div style="padding:0 20px 20px;overflow-x:auto;">
                <table style="width:100%;border-collapse:collapse;font-size:13px;">
                    <thead><tr style="background:#f8f9fa;">
                        <th style="padding:8px 10px;border-bottom:2px solid #FFD101;">#</th>
                        <th style="padding:8px 10px;border-bottom:2px solid #FFD101;">ชื่อที่ตั้ง</th>
                        <th style="padding:8px 10px;border-bottom:2px solid #FFD101;">อำเภอ/จังหวัด</th>
                        <th style="padding:8px 10px;border-bottom:2px solid #FFD101;text-align:right;">ค่าเช่า/เดือน</th>
                        <th style="padding:8px 10px;border-bottom:2px solid #FFD101;">สถานะ</th>
                    </tr></thead>
                    <tbody>
                        ${props.map((p,i) => `
                            <tr style="background:${i%2===0?'#fff':'#fafafa'}"
                                onmouseover="this.style.background='#fff8e1'"
                                onmouseout="this.style.background='${i%2===0?'#fff':'#fafafa'}'">
                                <td style="padding:7px 10px;border-bottom:1px solid #f5f5f5;color:#999;">${i+1}</td>
                                <td style="padding:7px 10px;border-bottom:1px solid #f5f5f5;" title="${p.name||''}">${p.name||'-'}</td>
                                <td style="padding:7px 10px;border-bottom:1px solid #f5f5f5;">${(p.amphoe||'')+' '+(p.changwat||'')}</td>
                                <td style="padding:7px 10px;border-bottom:1px solid #f5f5f5;text-align:right;">${parseFloat(p.rent)>0?parseFloat(p.rent).toLocaleString()+' บ.':'-'}</td>
                                <td style="padding:7px 10px;border-bottom:1px solid #f5f5f5;">${sbadge(p.status||'')}</td>
                            </tr>`).join('')}
                    </tbody>
                </table>
            </div>`;
        return;
    }
    try {
        // ดึงข้อมูลอุปกรณ์ทุกชุมสายของประเภทนี้
        const res = await fetch(`api_equipment_inventory.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'fetch_all_by_type', type: type })
        });
        const result = await res.json();

        const body = document.getElementById('equipStatsBody');
        if (!body) return;

        if (!result.success || !result.data || result.data.length === 0) {
            body.innerHTML = `<div style="padding:40px; color:#999; text-align:center;">
                <i class="fas fa-inbox" style="font-size:40px; margin-bottom:12px;"></i>
                <div>ยังไม่มีข้อมูล ${label} ในระบบ</div>
            </div>`;
            return;
        }

        const data = result.data;

        // สรุปยอดแต่ละชุมสาย
        const stationSummary = {};
        data.forEach(item => {
            const st = item.station || 'ไม่ระบุ';
            if (!stationSummary[st]) stationSummary[st] = 0;
            stationSummary[st]++;
        });

        // สร้างตาราง
        const stationLabels = {
            maeta: 'แม่ทา', lamphun1: 'ลำพูน1', makhueachae: 'มะเขือแจ้',
            umong: 'อุโมงค์', nikhom: 'นิคมลำพูน', lamphun2: 'ลำพูน2',
            pasak: 'ป่าสัก', maeta_r: 'แม่ทา(R)', thakat: 'ทากาศ',
            sritia: 'ศรีเตี้ย', li: 'ลี้', muangsampi: 'ม่วงสามปี',
            huaipuchek_r: 'ห้วยปูเจ็ก(R)', thunghuachang_t: 'ทุ่งหัวช้าง(T)',
            thunghuachang_r: 'ทุ่งหัวช้าง(R)', banpuang: 'บ้านปวง',
            pasang: 'ป่าซาง', banruan: 'บ้านเรือน', banthi: 'บ้านธิ',
            wiangnonglong: 'เวียงหนองล่อง', wangphang: 'วังผาง',
            banhong: 'บ้านโฮ่ง', khuntannoi_r: 'ขุนตาลน้อย(R)'
        };

        let summaryRows = Object.entries(stationSummary)
            .sort((a, b) => b[1] - a[1])
            .map(([st, cnt]) => `
                <tr>
                    <td style="padding:8px 12px; border-bottom:1px solid #f0f0f0;">
                        ${stationLabels[st] || st}
                    </td>
                    <td style="padding:8px 12px; border-bottom:1px solid #f0f0f0; text-align:center;">
                        <span style="background:#FFD101; color:#333; font-weight:700;
                                     padding:2px 12px; border-radius:20px; font-size:13px;">${cnt}</span>
                    </td>
                </tr>
            `).join('');

        // กำหนดคอลัมน์ตามประเภท
        const isPea = (type === 'peameter');
        const colHeaders = isPea
            ? ['ชื่อ กฟภ.', 'หมายเลขผู้ใช้ไฟ', 'สถานที่', 'ชุมสาย', 'หมายเหตุ']
            : ['รหัสสินทรัพย์', 'คำอธิบาย', 'Serial Number', 'ชุมสาย', 'หมายเหตุ'];

        const colKeys = isPea
            ? ['peaName', 'userNumber', 'location', 'station', 'remark']
            : ['newAssetCode', 'assetDescription', 'serialNumber', 'station', 'remark'];

        let detailRows = data.map(item => {
            const cells = colKeys.map(k => {
                const v = item[k] || '-';
                const label = stationLabels[v] || v;
                return `<td style="padding:7px 10px; border-bottom:1px solid #f5f5f5; font-size:12px;
                                   max-width:160px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;"
                             title="${label}">${label}</td>`;
            }).join('');
            return `<tr>${cells}</tr>`;
        }).join('');

        body.innerHTML = `
            <!-- ยอดสรุปแต่ละชุมสาย -->
            <div style="padding:16px 20px 8px;">
                <div style="font-weight:700; color:#333; margin-bottom:10px;">
                    <i class="fas fa-chart-bar" style="color:#FFD101; margin-right:6px;"></i>
                    ยอดรวม: <span style="color:#e74c3c;">${data.length}</span> รายการ จาก ${Object.keys(stationSummary).length} ชุมสาย
                </div>
                <div style="display:flex; flex-wrap:wrap; gap:8px; margin-bottom:16px;">
                    ${Object.entries(stationSummary).sort((a,b)=>b[1]-a[1]).map(([st,cnt])=>`
                        <div style="background:#f8f9fa; border:1px solid #e9ecef; border-radius:8px;
                                    padding:6px 14px; font-size:13px; display:flex; align-items:center; gap:8px;">
                            <span style="color:#555;">${stationLabels[st]||st}</span>
                            <span style="background:#FFD101; color:#333; font-weight:700;
                                         padding:1px 8px; border-radius:12px; font-size:12px;">${cnt}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            <!-- ตารางรายละเอียด -->
            <div style="padding:0 20px 20px; overflow-x:auto;">
                <table style="width:100%; border-collapse:collapse; font-size:13px;">
                    <thead>
                        <tr style="background:#f8f9fa;">
                            <th style="padding:8px 10px; text-align:left; border-bottom:2px solid #FFD101; color:#333; white-space:nowrap;">#</th>
                            ${colHeaders.map(h=>`<th style="padding:8px 10px; text-align:left; border-bottom:2px solid #FFD101; color:#333; white-space:nowrap;">${h}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map((item,i)=>{
                            const cells = colKeys.map(k=>{
                                const v = item[k]||'-';
                                const lbl = stationLabels[v]||v;
                                return `<td style="padding:7px 10px; border-bottom:1px solid #f5f5f5; font-size:12px;
                                                   max-width:160px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;"
                                             title="${lbl}">${lbl}</td>`;
                            }).join('');
                            // ✅ แก้ไข #1: เพิ่ม data-index และ cursor:pointer เพื่อให้คลิกแถวได้
                            return `<tr data-index="${i}" style="background:${i%2===0?'#fff':'#fafafa'}; cursor:pointer; transition:background 0.15s;"
                                        onmouseover="this.style.background='#fff8e1'" 
                                        onmouseout="this.style.background='${i%2===0?'#fff':'#fafafa'}'">
                                        <td style="padding:7px 10px; border-bottom:1px solid #f5f5f5; color:#999; font-size:11px;">${i+1}</td>${cells}
                                    </tr>`;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;

        // ✅ แก้ไข #2: ผูก click event กับทุกแถวในตาราง popup เพื่อแสดง detail
        document.querySelectorAll('#equipStatsPopup tbody tr[data-index]').forEach(tr => {
            tr.addEventListener('click', () => {
                const idx = parseInt(tr.getAttribute('data-index'));
                showEquipItemDetail(data[idx], stationLabels, label, icon);
            });
        });

    } catch (err) {
        console.error("❌ Popup load error:", err);
        const body = document.getElementById('equipStatsBody');
        if (body) body.innerHTML = `<div style="padding:30px; color:#e74c3c; text-align:center;">
            ❌ ไม่สามารถโหลดข้อมูลได้: ${err.message}
        </div>`;
    }
}

// ✅ แก้ไข #3: ฟังก์ชันใหม่ — แสดง popup รายละเอียดอุปกรณ์แต่ละชิ้นเมื่อคลิกแถว
function showEquipItemDetail(item, stationLabels, categoryLabel, icon) {
    // ลบ detail popup เดิมถ้ามี
    const existing = document.getElementById('equipItemDetailPopup');
    if (existing) existing.remove();

    // Field mapping ทั้งหมดที่อาจมีในฐานข้อมูล
    const fieldMap = [
        { key: 'newAssetCode',      label: 'รหัสสินทรัพย์ใหม่' },
        { key: 'subAssetCode',      label: 'รหัสย่อย' },
        { key: 'oldAssetCode',      label: 'รหัสเดิม' },
        { key: 'assetDescription',  label: 'คำอธิบาย 1' },
        { key: 'assetDescription2', label: 'คำอธิบาย 2' },
        { key: 'serialNumber',      label: 'Serial Number' },
        { key: 'capDate',           label: 'Cap.date' },
        { key: 'quantity',          label: 'ปริมาณ' },
        { key: 'unit',              label: 'Unit' },
        { key: 'acquisitionValue',  label: 'มูลค่าไต้มา' },
        { key: 'bookValue',         label: 'มูลค่าบัญชี' },
        { key: 'depreciationCost',  label: 'ศ.ต้นทุน' },
        { key: 'location',          label: 'ที่ตั้ง' },
        { key: 'centerCode',        label: 'รหัสศูนย์' },
        { key: 'remark',            label: 'หมายเหตุ' },
        { key: 'station',           label: 'ชุมสาย' },
        // PEA Meter fields
        { key: 'peaName',           label: 'ชื่อ กฟภ.' },
        { key: 'userNumber',        label: 'หมายเลขผู้ใช้ไฟ' },
        { key: 'meterNumber',       label: 'หมายเลขมิเตอร์' },
        { key: 'voltage',           label: 'แรงดัน' },
        { key: 'phase',             label: 'เฟส' },
    ];

    // สร้าง rows เฉพาะ field ที่มีค่า
    const rows = fieldMap
        .filter(f => item[f.key] && item[f.key] !== '-' && item[f.key] !== '')
        .map(f => {
            const val = f.key === 'station' ? (stationLabels[item[f.key]] || item[f.key]) : item[f.key];
            return `
                <div style="display:grid; grid-template-columns:160px 1fr; gap:8px;
                            padding:9px 12px; border-bottom:1px solid #f5f5f5; font-size:13px;">
                    <span style="color:#888; font-weight:500;">${f.label}</span>
                    <span style="color:#222; font-weight:600; word-break:break-all;">${val}</span>
                </div>`;
        }).join('');

    const detailPopup = document.createElement('div');
    detailPopup.id = 'equipItemDetailPopup';
    detailPopup.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.7); z-index: 10000;
        display: flex; align-items: center; justify-content: center;
    `;
    detailPopup.innerHTML = `
        <div style="background:#fff; border-radius:12px; width:90%; max-width:560px;
                    max-height:85vh; display:flex; flex-direction:column;
                    box-shadow: 0 12px 40px rgba(0,0,0,0.4); overflow:hidden;">
            <!-- Header -->
            <div style="background:#FFD101; padding:14px 20px;
                        display:flex; justify-content:space-between; align-items:center; flex-shrink:0;">
                <div style="display:flex; align-items:center; gap:10px;">
                    <i class="fas ${icon}" style="font-size:18px; color:#333;"></i>
                    <div>
                        <div style="font-size:15px; font-weight:700; color:#333;">${categoryLabel}</div>
                        <div style="font-size:11px; color:#555;">รายละเอียดอุปกรณ์</div>
                    </div>
                </div>
                <button id="closeEquipDetail"
                    style="background:none; border:none; font-size:26px; cursor:pointer; color:#333; line-height:1;">&times;</button>
            </div>
            <!-- Content -->
            <div style="overflow-y:auto; flex:1;">
                ${rows || '<div style="padding:30px; text-align:center; color:#999;">ไม่มีข้อมูลเพิ่มเติม</div>'}
            </div>
        </div>
    `;

    document.body.appendChild(detailPopup);

    // ปิดเมื่อคลิก overlay หรือปุ่ม X
    detailPopup.addEventListener('click', (e) => {
        if (e.target === detailPopup) detailPopup.remove();
    });
    document.getElementById('closeEquipDetail').addEventListener('click', () => detailPopup.remove());
}

// ========================================
// ⭐ แก้ไขจุดที่ 3: ลบข้อมูลทั้งหมด (ไม่ใช่ Firebase)
// ========================================
async function deleteAllData() {
    const confirmation = confirm('⚠️ คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลทั้งหมด?\n\nการกระทำนี้ไม่สามารถย้อนกลับได้!');
    
    if (!confirmation) return;
    
    const password = prompt('พิมพ์ "DELETE ALL" เพื่อยืนยัน');
    
    if (password !== 'DELETE ALL') {
        alert('❌ ยกเลิกการลบ');
        return;
    }
    
    try {
        console.log('🗑️ กำลังลบข้อมูลทั้งหมด...');
        alert('⏳ กำลังลบข้อมูล... กรุณารอสักครู่');
        
        // ✅ เรียก API Delete All แทน Firebase batch
        const response = await fetch('api_delete_all_stations.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ confirm: 'DELETE ALL' })
        });

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.message);
        }

        const deletedCount = result.deleted_count || 0;
        
        console.log(`✅ ลบข้อมูลทั้งหมดสำเร็จ! รวม ${deletedCount} รายการ`);
        alert(`✅ ลบข้อมูลทั้งหมดสำเร็จ!\n\nลบไปทั้งหมด ${deletedCount} รายการ`);
        
        loadRealtimeData();
        updateOverallStats();
        
    } catch (error) {
        console.error('❌ เกิดข้อผิดพลาดในการลบข้อมูล:', error);
        alert('❌ เกิดข้อผิดพลาดในการลบข้อมูล: ' + error.message);
    }
}

// ========================================
// ⭐ แก้ไขจุดที่ 4: เช็คและแสดงปุ่มลบทั้งหมด 
// ========================================
async function checkAndShowDeleteButton() {
    try {
        const response = await fetch('api_get_stations.php');
        const result = await response.json();
        
        const deleteBtn = document.getElementById('deleteAllBtn');
        
        if (deleteBtn) {
            if (result.success && result.data && result.data.length > 0) {
                deleteBtn.classList.add('show');
            } else {
                deleteBtn.classList.remove('show');
            }
        }
    } catch (error) {
        console.error('Error checking data:', error);
    }
}


// ========================================
// ✅ Save Updated Data
// ========================================
async function saveUpdatedData() {
    const rowIndex = window.currentRowIndex;
    const originalData = fullDataStorage[rowIndex];
    
    const docId = originalData.id; 

    if (!docId) {
        alert("❌ ไม่สามารถระบุ ID ของข้อมูลนี้ได้");
        return;
    }

    const updatedData = {
        id: docId,
        รหัส10หลัก: document.getElementById('det-id').value,
        ภาคขายและบริการ: document.getElementById('det-sector').value,
        ชื่อย่อสถานที่: document.getElementById('det-short').value,
        ชื่อสถานที่ไทย: document.getElementById('det-th').value,
        ชื่อสถานที่ไทยเดิม: document.getElementById('det-th-old').value,
        ชื่อสถานที่อังกฤษ: document.getElementById('det-en').value,
        ชื่อสถานที่อังกฤษเดิม: document.getElementById('det-en-old').value,
        ชื่อบริษัท: document.getElementById('det-comp').value,
        สถานะ: document.getElementById('det-status').value,
        Homing: document.getElementById('det-homing').value,
        ศูนย์บริการลูกค้า: document.getElementById('det-center').value,
        Rank: document.getElementById('det-rank').value,
        ขนาดเลขหมาย: document.getElementById('det-size').value,
        โครงการ: document.getElementById('det-proj').value,
        รหัสสถานีฐานบริษัท: document.getElementById('det-base').value,
        SITE_NAMETH: document.getElementById('det-siteth').value,
        SITE_LAT: document.getElementById('det-sitelat').value,
        SITE_LONG: document.getElementById('det-sitelong').value,
        SITE_TYPE: document.getElementById('det-sitetype').value,
        SITE_EQUIPMENT: document.getElementById('det-equip').value,
        SITE_OWNER: document.getElementById('det-owner').value,
        สถานที่ติดตั้ง: document.getElementById('det-loc').value,
        ซอย: document.getElementById('det-soi').value,
        ถนน: document.getElementById('det-road').value,
        หมู่บ้าน: document.getElementById('det-village').value,
        แขวงตำบล: document.getElementById('det-tambon').value,
        เขตอำเภอ: document.getElementById('det-amphoe').value,
        จังหวัด: document.getElementById('det-province').value,
        รหัสไปรณีย์: document.getElementById('det-zip').value,
        Lat: document.getElementById('det-lat').value,
        Long: document.getElementById('det-long').value,
        ส่วนงานผู้ขอรหัส: document.getElementById('det-dept').value,
        วันที่อนุมัติ: document.getElementById('det-date').value,
        ผู้จัดทำ: document.getElementById('det-creator').value,
        หมายเหตุ: document.getElementById('det-note').value
    };

    try {
        console.log("⏳ กำลังบันทึกข้อมูล ID:", docId);
        
        const response = await fetch('api_update_station.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert("✅ แก้ไขข้อมูลเรียบร้อยแล้ว");
            
            document.getElementById('detailsModal').style.display = 'none';
            loadRealtimeData(); 
        } else {
            alert("❌ " + result.message);
        }
        
    } catch (error) {
        console.error("❌ Error updating document:", error);
        alert("❌ เกิดข้อผิดพลาดในการบันทึก: " + error.message);
    }
}

// ========================================
// ✅ Event Listeners
// ========================================
const deleteAllBtn = document.getElementById('deleteAllBtn');
if (deleteAllBtn) {
    deleteAllBtn.addEventListener('click', deleteAllData);
}
// เพิ่มโค้ดนี้ถัดจากโค้ด deleteAllBtn
const uploadBtnEl = document.getElementById('uploadBtn');
if (uploadBtnEl) {
    uploadBtnEl.addEventListener('click', function() {
        // ตรวจสอบว่ามีข้อมูล Excel ที่ยังไม่ได้ upload (ต้องเป็น Array of Arrays)
        const hasExcelData = fullDataStorage.length > 0 && Array.isArray(fullDataStorage[0]);
        if (!hasExcelData) {
            alert('❌ ไม่มีข้อมูล Excel กรุณากด "Add Excel" นำเข้าไฟล์ก่อน');
            return;
        }
        uploadToDatabase(fullDataStorage);
    });
}

window.addEventListener('DOMContentLoaded', function() {
    checkAndShowDeleteButton();
});

window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
        overlay.classList.remove('active');
        body.classList.remove('sidebar-open');
    } else {
        if (!sidebar.classList.contains('collapsed')) {
            sidebar.classList.add('collapsed');
            body.classList.add('sidebar-collapsed');
            const icon = toggleBtn.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
    loadRealtimeData(); 
    updateOverallStats();
});

document.querySelectorAll('.pagination button').forEach(button => {
    button.addEventListener('click', function() {
        console.log('Pagination:', this.textContent);
    });
});

// ========================================
// ✅ Export Functions
// ========================================
window.saveUpdatedData = saveUpdatedData;
window.editStation = editStation;
window.deleteStation = deleteStation;
window.deleteImage = deleteImage;
window.openImageModal = openImageModal;
window.uploadToDatabase = uploadToDatabase;

console.log("✅ Script Loaded (100% SQL - No Firebase)");