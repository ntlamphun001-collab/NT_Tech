// =======================================================
// เนื้อหาทั้งหมดในไฟล์ wangphang-scripts.js (ฉบับสมบูรณ์)
// =======================================================

// ✅ ยกเลิก Firebase — ใช้ PHP API แทน
const API_URL = 'api_station_detail.php'; // PHP endpoint สำหรับหน้า station detail
console.log("✅ ใช้ MySQL/PHP API แทน Firebase");

// 🔥 Cloudinary Configuration (ถูกเพิ่มกลับเข้ามาเพื่อแก้ ReferenceError)
// ⚠️ กรุณาแก้ไขค่าเหล่านี้ด้วยข้อมูลจาก Cloudinary ของคุณ
const CLOUDINARY_CONFIG = {
    cloudName: 'dtsx2jqzl',      // ⬅️ แก้ไข Cloud Name ของคุณที่นี่
    uploadPreset: 'nt_engineering', // ⬅️ แก้ไข Upload Preset ของคุณที่นี่
    folder: 'nt-engineering/wangphang', // โฟลเดอร์ใน Cloudinary
    maxFiles: 10
};


// ========================================================
// 🧠 ส่วนควบคุมอัตโนมัติ (Universal Brain) - นำมาวางแทนจุดเดิม
// ========================================================

// 1. ดึงชื่อไฟล์จาก URL อัตโนมัติ (เช่น "wangphang.html" -> จะได้ "wangphang")
const stationID = window.location.pathname.split("/").pop().replace(".html", "");

// 2. แสดงสถานะใน Console เพื่อตรวจสอบ (กด F12 ดูได้)
console.log("📍 ระบบกำลังโหลดข้อมูลของสถานี:", stationID);

// 3. stationID สำหรับอ้างอิงในทุก API call (แทน Firestore doc ref)
// เรายังคงชื่อตัวแปรโครงสร้างเดิมไว้เพื่อไม่ให้โค้ดส่วนอื่นพัง

// 4. ตัวแปรเก็บข้อมูลรูปภาพปัจจุบัน (ยังคงต้องมีไว้เหมือนเดิม)
let currentModalImages = [];



// 2. ฟังก์ชันดึงสถิติอุปกรณ์ — ใช้ PHP API แทน Firestore
async function loadEquipmentCounts() {
    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'get_counts', station: stationID })
        });
        const result = await res.json();
        if (!result.success) throw new Error(result.message);

        const counts = result.data || {};

        // ✅ uiMapping เหมือนเดิมทุกจุด
        const uiMapping = {
            'count-air':         counts.air       || 0,
            'count-battery':     counts.battery   || 0,
            'count-generator':   counts.generator || 0,
            'count-transformer': counts.transformer || 0,
            'count-rectifier':   counts.rectifier || 0,
            'count-pea':         counts.peameter  || 0,
            'count-solar':       counts.solar     || 0
        };

        Object.keys(uiMapping).forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = uiMapping[id];
            } else {
                console.warn(`⚠️ ไม่พบ element: ${id}`);
            }
        });

        console.log(`📊 อัปเดตสถิติอุปกรณ์ของสถานี ${stationID} เรียบร้อยแล้ว`);
        console.log(`   Air: ${counts.air}, Battery: ${counts.battery}, Generator: ${counts.generator}`);
        console.log(`   Transformer: ${counts.transformer}, Rectifier: ${counts.rectifier}, PEA: ${counts.peameter}, Solar: ${counts.solar}`);

    } catch (error) {
        console.error('❌ เกิดข้อผิดพลาดในการโหลดข้อมูลสถิติ:', error);
    }
}

/**
 * 🎨 ฟังก์ชันสุ่มรูปภาพพื้นหลัง (Yellow / Blue)
 * ให้วางฟังก์ชันนี้ไว้ในไฟล์ wangphang-scripts.js ด้วยครับ
 */
function randomizeCardBackgrounds() {
    const backgroundImages = [
        'url("img/bg-yellow.png")',
        'url("img/bg-blue.png")'
    ];
    
    const cards = document.querySelectorAll('.stat-card-with-bg'); // สมมติว่าใช้คลาสนี้กับการ์ดที่ต้องการเปลี่ยนพื้นหลัง
    cards.forEach(card => {  // วนลูปแต่ละการ์ด
        const randomIndex = Math.floor(Math.random() * backgroundImages.length);  // สุ่มดัชนี
        card.style.backgroundImage = backgroundImages[randomIndex]; // ตั้งค่าพื้นหลัง
    });
}

// NEW: Helper function สำหรับควบคุมการแสดงผล UI (Placeholder vs. Data)
function toggleLocationUI(dataType, hasData, dataValue) {
    const placeholder = document.getElementById(dataType + '-placeholder');
    const display = document.getElementById(dataType + '-display');
    const mapFrame = document.getElementById('mapFrame');
    const mapPlaceholder = document.getElementById('map-placeholder');
    
    if (dataType === 'coord') {  // พิกัด
        if (hasData) { // มีข้อมูลพิกัด
            if (placeholder) placeholder.style.display = 'none';
            if (display) display.style.display = 'block';
            if (mapFrame) mapFrame.style.display = 'block';
            if (mapPlaceholder) mapPlaceholder.style.display = 'none';
            if (display) display.querySelector('div').textContent = dataValue;
        } else {
            if (placeholder) placeholder.style.display = 'flex'; // แสดง +
            if (display) display.style.display = 'none';
            if (mapFrame) mapFrame.style.display = 'none';
            if (mapPlaceholder) mapPlaceholder.style.display = 'flex';
        }
    } else if (dataType === 'address') {  // ที่อยู่
        if (hasData) {
            if (placeholder) placeholder.style.display = 'none';
            if (display) display.style.display = 'block';
            if (display) display.textContent = dataValue;
        } else {
            if (placeholder) placeholder.style.display = 'flex'; // แสดง +
            if (display) display.style.display = 'none';
            if (display) display.textContent = 'ยังไม่มีข้อมูล';
        }
    }
}



// 3. ฟังก์ชันดึงข้อมูลสถานี (ที่อยู่ พิกัด รูปภาพ รายละเอียด) — ใช้ PHP API
async function loadWangphangData() {
    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'get', station: stationID })
        });

        // ✅ ป้องกัน PHP ส่ง HTML error กลับมา (SyntaxError: Unexpected token '<')
        const text = await res.text();
        let result;
        try {
            result = JSON.parse(text);
        } catch (parseErr) {
            console.error("❌ API ส่ง non-JSON กลับมา:", text.substring(0, 200));
            // แสดง "-" ทั้งหมดเหมือนไม่มีข้อมูล แทนที่จะ crash
            toggleLocationUI('address', false, null);
            toggleLocationUI('coord', false, null);
            updateMainGalleryUI();
            document.querySelectorAll('[id^="val-"]').forEach(span => span.textContent = '-');
            return;
        }

        if (result.success && result.data) {
            const data = result.data;
            console.log("✅ Station data loaded from MySQL:", data);

            // 1. อัปเดตที่อยู่ (Address UI)
            const address = data.address && data.address !== '-' ? data.address : null;
            toggleLocationUI('address', !!address, address);

            // 2. อัปเดตพิกัดและแผนที่ (Coordinate UI)
            const hasCoord = data.latitude && data.longitude && data.latitude !== '' && data.longitude !== '';
            if (hasCoord) {
                const coordText = `สพ/ช : ${data.latitude}.${data.longitude}`;
                toggleLocationUI('coord', true, coordText);
                document.getElementById('mapFrame').src = `https://maps.google.com/maps?q=${data.latitude},${data.longitude}&z=15&output=embed`;
            } else {
                toggleLocationUI('coord', false, null);
                document.getElementById('mapFrame').src = '';
            }

            // 3. จัดการรูปภาพ (Image Gallery) — images เก็บเป็น JSON array เหมือนเดิม
            const rawImages = typeof data.images === 'string' ? JSON.parse(data.images || '[]') : (data.images || []);
            currentModalImages = rawImages.map(img => {
                const finalUrl = (img.url && !img.url.startsWith('data:image'))
                                    ? img.url
                                    : `https://via.placeholder.com/150/999999?text=${img.name ? img.name.replace(/\s/g, '+') : 'No+URL'}`;
                return { id: img.id, date: img.date, name: img.name, url: finalUrl };
            });
            updateMainGalleryUI();

            // 4. อัปเดตข้อมูลรายละเอียด (dbMap เหมือนเดิมทุกจุด)
            const dbMap = {
                'val-id': data['รหัส10หลัก'],
                'val-sector': data['ภาคขายและบริการ'],
                'val-short': data['ชื่อย่อสถานที่'],
                'val-th': data['ชื่อสถานที่ไทย'],
                'val-th-old': data['ชื่อสถานที่ไทยเดิม'],
                'val-en': data['ชื่อสถานที่อังกฤษ'],
                'val-en-old': data['ชื่อสถานที่อังกฤษเดิม'],
                'val-comp': data['ชื่อบริษัท'],
                'val-status': data['สถานะ'],
                'val-homing': data['Homing'],
                'val-center': data['ศูนย์บริการลูกค้า'],
                'val-rank': data['Rank'],
                'val-size': data['ขนาดเลขหมาย'],
                'val-proj': data['โครงการ'],
                'val-base': data['รหัสสถานีฐานบริษัท'],
                'val-siteth': data['SITE_NAMETH'],
                'val-sitelat': data['SITE_LAT'],
                'val-sitelong': data['SITE_LONG'],
                'val-sitetype': data['SITE_TYPE'],
                'val-owner': data['SITE_OWNER'],
                'val-creator': data['ผู้จัดทำ'],
                'val-equip': data['SITE_EQUIPMENT'],
                'val-sitetype2': data['SITE_TYPE2'],
                'val-loc': data['สถานที่ติดตั้ง'],
                'val-soi': data['ซอย'],
                'val-road': data['ถนน'],
                'val-village': data['หมู่บ้าน'],
                'val-tambon': data['แขวง/ตำบล'],
                'val-amphoe': data['เขต/อำเภอ'],
                'val-province': data['จังหวัด'],
                'val-zip': data['รหัสไปรณีย์'],
                'val-lat': data['Lat'],
                'val-long': data['Long'],
                'val-dept': data['ส่วนงานผู้ขอรหัส'],
                'val-date': data['วันที่อนุมัติ'],
                'val-note': data['หมายเหตุ']
            };

            Object.keys(dbMap).forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                    const value = dbMap[id];
                    element.textContent = (value !== null && value !== undefined && value !== '') ? value : '-';
                }
            });

        } else {
            // กรณีไม่พบข้อมูล — รีเซ็ตค่าทั้งหมดเหมือนเดิม
            toggleLocationUI('address', false, null);
            toggleLocationUI('coord', false, null);
            updateMainGalleryUI();
            const allValSpans = document.querySelectorAll('[id^="val-"]');
            allValSpans.forEach(span => span.textContent = '-');
        }
    } catch (error) {
        console.error("❌ Error loading data:", error);
    }
}

function updateMainGalleryUI() {  // อัปเดตรูปภาพใน Gallery
    const mainGallery = document.getElementById('main-image-gallery');
    const imagePlaceholder = document.getElementById('image-placeholder');
    
    if (currentModalImages.length > 0) {  // มีรูปภาพ
        if (mainGallery) mainGallery.style.display = 'grid';
        if (imagePlaceholder) imagePlaceholder.style.display = 'none';
        
        mainGallery.innerHTML = currentModalImages.map(img => `  
            <div class="gallery-item" data-id="${img.id}">
                <img src="${img.url}" onclick="openImageLightbox('${img.url}')" style="cursor: pointer;">
                <div class="image-info">
                    <div>${img.name || '#img_untitled'}</div>
                    <div class="image-date">${img.date || '-'}</div>
                </div>
            </div>
        `).join('');
    } else {
        if (mainGallery) mainGallery.style.display = 'none';
        if (imagePlaceholder) imagePlaceholder.style.display = 'flex';
    }
}

// 4. Toggle Sidebar และ Submenu
const toggleBtn = document.getElementById('toggleSidebar');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('sidebarOverlay');
const body = document.body;

if (window.innerWidth <= 768) {
    // mobile: เริ่มต้น sidebar ปิด
    sidebar.classList.add('collapsed');
    body.classList.add('sidebar-collapsed');
} else {
    // desktop: เริ่มต้น sidebar ปิด เหมือนกัน (ผู้ใช้กดเปิดเอง)
    sidebar.classList.add('collapsed');
    body.classList.add('sidebar-collapsed');
}

toggleBtn.addEventListener('click', function() {   // Toggle sidebar
    sidebar.classList.toggle('collapsed');

    const isCollapsed = sidebar.classList.contains('collapsed');

    if (window.innerWidth <= 768) {
        // mobile: sidebar-open ควบคุม overlay/slide
        body.classList.toggle('sidebar-open', !isCollapsed);
        overlay.classList.toggle('active', !isCollapsed);
    } else {
        // desktop: sidebar-collapsed ควบคุม margin ของ main-content
        body.classList.toggle('sidebar-collapsed', isCollapsed);
    }

    const icon = this.querySelector('i');
    if (isCollapsed) {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    } else {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
    }
});

overlay.addEventListener('click', function() { // ปิด sidebar เมื่อคลิกที่ overlay
    sidebar.classList.add('collapsed');
    body.classList.remove('sidebar-collapsed');
    body.classList.remove('sidebar-open');
    overlay.classList.remove('active');
    
    const icon = toggleBtn.querySelector('i');  // Reset icon to bars
    icon.classList.remove('fa-times');
    icon.classList.add('fa-bars');
});

document.querySelectorAll('.menu-item[data-submenu]').forEach(item => {   // จัดการเมนูที่มีซับเมนู
    const submenuId = item.getAttribute('data-submenu');
    const submenu = document.getElementById(submenuId);
    
    item.addEventListener('click', function(e) { // เพิ่ม e.stopPropagation() เพื่อป้องกันการกระจายเหตุการณ์
        e.stopPropagation();
        this.classList.toggle('active');
        submenu.classList.toggle('show');
    });
});

document.querySelectorAll('.menu-sub-item').forEach(item => {  // เพิ่ม active class ให้เมนูย่อย
    item.addEventListener('click', function() {
        document.querySelectorAll('.menu-sub-item').forEach(i => i.classList.remove('active'));
        this.classList.add('active');
    });
});


// 5. ข้อมูลจังหวัด อำเภอ ตำบล
const locationData = {
    'ลำพูน': {
        'ทุ่งหัวช้าง': ['ทุ่งหัวช้าง', 'บ้านปวง'],
        'บ้านธิ': ['บ้านธิ'],
        'บ้านโฮ่ง': ['ศรีเตี้ย', 'บ้านโฮ่ง'],
        'ป่าซาง': ['ป่าซาง', 'บ้านเรือน'],
        'เมืองลำพูน': ['ในเมือง', 'มะเขือแจ้', 'อุโมงค์', 'บ้านกลาง', 'ป่าสัก'],
        'แม่ทา': ['ทากาศ', 'ทาสบเส้า', 'ทาปลาดุก'],
        'ลี้': ['ลี้', 'แม่ตืน'],
        'เวียงหนองล่อง': ['วังผาง', 'เวียงหนองล่อง']
    },
    'เชียงใหม่': {
        'เมืองเชียงใหม่': ['ศรีภูมิ', 'ช้างคลาน', 'หนองหอย', 'ช้างเผือก'],
        'สันทราย': ['สันทรายหลวง', 'สันทรายน้อย', 'หนองแหย่ง', 'แม่แฝก'],
        'แม่ริม': ['แม่ริม', 'สันโป่ง', 'ดอนแก้ว', 'ขี้เหล็ก'],
        'หางดง': ['หางดง', 'หนองแก๋ว', 'สบแม่ข่า', 'บ้านแหวน']
    }
};


// 6. ฟังก์ชันแก้ไขและลบที่อยู่
function editAddress() {
    const currentAddress = document.getElementById('addressContent').textContent.trim();
    
    const modalHTML = `
        <div id="addressModal" style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.6);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        ">
            <div style="
                background: white;
                padding: 30px;
                border-radius: 12px;
                width: 90%;
                max-width: 600px;
                max-height: 90vh;
                overflow-y: auto;
            ">
                <h3 style="margin: 0 0 20px 0;">ที่อยู่ (ระบะละเอียด)</h3>
                
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: 600;">ที่อยู่</label>
                    <textarea id="addressDetail" rows="3" style="
                        width: 100%;
                        padding: 10px;
                        border: 1px solid #ddd;
                        border-radius: 5px;
                        font-size: 14px;
                        font-family: inherit;
                    " placeholder="กรอกที่อยู่รายละเอียด...">${currentAddress}</textarea>
                </div>
                
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: 600;">ซอย/หมู่</label>
                    <input type="text" id="soi" style="
                        width: 100%;
                        padding: 10px;
                        border: 1px solid #ddd;
                        border-radius: 5px;
                        font-size: 14px;
                    " placeholder="เช่น หมู่ 3, ซอย 5">
                </div>
                
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: 600;">จังหวัด</label>
                    <select id="province" onchange="updateAmphoe()" style="
                        width: 100%;
                        padding: 10px;
                        border: 1px solid #ddd;
                        border-radius: 5px;
                        font-size: 14px;
                    ">
                        <option value="">เลือกจังหวัด</option>
                        <option value="ลำพูน">ลำพูน</option>
                        <option value="เชียงใหม่">เชียงใหม่</option>
                    </select>
                </div>
                
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: 600;">อำเภอ</label>
                    <select id="amphoe" onchange="updateTambon()" style="
                        width: 100%;
                        padding: 10px;
                        border: 1px solid #ddd;
                        border-radius: 5px;
                        font-size: 14px;
                    " disabled>
                        <option value="">เลือกอำเภอ</option>
                    </select>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: 600;">ตำบล</label>
                    <select id="tambon" style="
                        width: 100%;
                        padding: 10px;
                        border: 1px solid #ddd;
                        border-radius: 5px;
                        font-size: 14px;
                    " disabled>
                        <option value="">เลือกตำบล</option>
                    </select>
                </div>
                
                <div style="display: flex; gap: 10px; justify-content: flex-end;">
                    <button onclick="closeAddressModal()" style="
                        padding: 10px 20px;
                        background: #ddd;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                    ">ยกเลิก</button>
                    <button onclick="saveAddress()" style="
                        padding: 10px 20px;
                        background: #FFD101;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                        font-weight: 600;
                    ">บันทึก</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    parseAndSetAddress(currentAddress);
}

function parseAndSetAddress(address) {
    const provinceMatch = address.match(/จ\.(\S+)/);
    const amphoeMatch = address.match(/อ\.(\S+)/);
    const tambonMatch = address.match(/ต\.(\S+)/);
    const soiMatch = address.match(/(ม\.\d+|ซอย\s*\S+)/);
    
    if (provinceMatch) {
        const province = provinceMatch[1];
        const provinceSelect = document.getElementById('province');
        if (provinceSelect) {
            provinceSelect.value = province;
            updateAmphoe();
            
            setTimeout(() => {
                const amphoeSelect = document.getElementById('amphoe');
                if (amphoeMatch && amphoeSelect) {
                    const amphoe = amphoeMatch[1];
                    amphoeSelect.value = amphoe;
                    updateTambon();
                    
                    setTimeout(() => {
                        const tambonSelect = document.getElementById('tambon');
                        if (tambonMatch && tambonSelect) {
                            tambonSelect.value = tambonMatch[1];
                        }
                    }, 50);
                }
            }, 50);
        }
    }
    
    const soiInput = document.getElementById('soi');
    if (soiMatch && soiInput) {
        soiInput.value = soiMatch[1];
    }
}

function updateAmphoe() {
    const province = document.getElementById('province').value;
    const amphoeSelect = document.getElementById('amphoe');
    const tambonSelect = document.getElementById('tambon');
    
    if (!amphoeSelect || !tambonSelect) return;
    
    amphoeSelect.innerHTML = '<option value="">เลือกอำเภอ</option>';
    tambonSelect.innerHTML = '<option value="">เลือกตำบล</option>';
    tambonSelect.disabled = true;
    
    if (province && locationData[province]) {
        amphoeSelect.disabled = false;
        const amphoes = Object.keys(locationData[province]);
        amphoes.forEach(amphoe => {
            const option = document.createElement('option');
            option.value = amphoe;
            option.textContent = amphoe;
            amphoeSelect.appendChild(option);
        });
    } else {
        amphoeSelect.disabled = true;
    }
}

function updateTambon() {
    const province = document.getElementById('province').value;
    const amphoe = document.getElementById('amphoe').value;
    const tambonSelect = document.getElementById('tambon');
    
    if (!tambonSelect) return;
    
    tambonSelect.innerHTML = '<option value="">เลือกตำบล</option>';
    
    if (province && amphoe && locationData[province] && locationData[province][amphoe]) {
        tambonSelect.disabled = false;
        const tambons = locationData[province][amphoe];
        tambons.forEach(tambon => {
            const option = document.createElement('option');
            option.value = tambon;
            option.textContent = tambon;
            tambonSelect.appendChild(option);
        });
    } else {
        tambonSelect.disabled = true;
    }
}

function closeAddressModal() {
    const modal = document.getElementById('addressModal');
    if (modal) modal.remove();
}

async function saveAddress() {
    const detail = document.getElementById('addressDetail').value;
    const soi = document.getElementById('soi').value;
    const tambon = document.getElementById('tambon').value;
    const amphoe = document.getElementById('amphoe').value;
    const province = document.getElementById('province').value;
    
    let fullAddress = [];
    if (detail) fullAddress.push(detail);
    if (soi) fullAddress.push(soi);
    if (tambon) fullAddress.push(`ต.${tambon}`);
    if (amphoe) fullAddress.push(`อ.${amphoe}`);
    if (province) fullAddress.push(`จ.${province}`);
    
    const addressText = fullAddress.join(' ') || '-';
    
    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'save', station: stationID, data: { address: addressText } })
        });
        const text = await res.text();
        const result = safeParseJSON(text, 'บันทึกที่อยู่');
        if (!result) return;
        if (!result.success) throw new Error(result.message);

        toggleLocationUI('address', !!addressText && addressText !== '-', addressText);
        closeAddressModal();
        alert('✅ บันทึกที่อยู่สำเร็จแล้ว');
    } catch (error) {
        console.error('Error saving address:', error);
        alert('❌ เกิดข้อผิดพลาดในการบันทึกที่อยู่: ' + error.message);
    }
}

async function deleteAddress() {
    if (confirm('ต้องการลบที่อยู่หรือไม่?')) {
        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'save', station: stationID, data: { address: '-' } })
            });
            const text = await res.text();
            const result = safeParseJSON(text, 'ลบที่อยู่');
            if (!result) return;
            if (!result.success) throw new Error(result.message);

            toggleLocationUI('address', false, null);
            alert('✅ ลบที่อยู่สำเร็จแล้ว');
        } catch (error) {
            console.error('Error deleting address:', error);
            alert('❌ เกิดข้อผิดพลาดในการลบที่อยู่: ' + error.message);
        }
    }
}


// 7. ฟังก์ชันแก้ไขและลบพิกัด
function editCoordinate() {
    const currentCoordText = document.getElementById('coordinateContent').textContent.trim();
    let lat = '';
    let lng = '';
    
    const matches = currentCoordText.match(/([\-]?\d+\.\d+)\.([\-]?\d+\.\d+)/);
    if (matches && matches.length === 3) {
        lat = matches[1]; 
        lng = matches[2]; 
    }

    const modalHTML = `
        <div id="coordinateModal" style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.6);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        ">
            <div style="
                background: white;
                padding: 30px;
                border-radius: 12px;
                width: 90%;
                max-width: 600px;
                max-height: 90vh;
                overflow-y: auto;
            ">
                <h3 style="margin: 0 0 20px 0;">รายละเอียดพิกัด</h3>
                
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: 600;">พิกัด (Lat,Long)</label>
                    <div style="display: flex; gap: 10px;">
                        <input type="text" id="coordLat" value="${lat}" style="
                            flex: 1;
                            padding: 10px;
                            border: 1px solid #ddd;
                            border-radius: 5px;
                            font-size: 14px;
                        " placeholder="Lat (ละติจูด)">
                        <input type="text" id="coordLng" value="${lng}" style="
                            flex: 1;
                            padding: 10px;
                            border: 1px solid #ddd;
                            border-radius: 5px;
                            font-size: 14px;
                        " placeholder="Long (ลองจิจูด)">
                    </div>
                </div>

                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 10px; font-weight: 600;">ตำแหน่งบนแผนที่</label>
                    <div class="map-container-modal" style="position: relative; height: 250px; border-radius: 8px; overflow: hidden; background: #eee;">
                        <iframe 
                            id="modalMapFrame"
                            src=""
                            frameborder="0" 
                            style="border:0; width:100%; height:100%;"
                            allowfullscreen>
                        </iframe>
                        <div id="loadingMap" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(255,255,255,0.8); display: flex; align-items: center; justify-content: center; font-weight: 600;">กำลังโหลดแผนที่...</div>
                    </div>
                </div>
                
                <div style="display: flex; gap: 10px; justify-content: flex-end;">
                    <button onclick="closeCoordinateModal()" style="
                        padding: 10px 20px;
                        background: #ddd;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                    ">ยกเลิก</button>
                    <button onclick="saveCoordinate()" style="
                        padding: 10px 20px;
                        background: #FFD101;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                        font-weight: 600;
                    ">บันทึก</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    updateModalMap(lat, lng);
    
    document.getElementById('coordLat').addEventListener('input', function() {
        updateModalMap(this.value, document.getElementById('coordLng').value);
    });
    document.getElementById('coordLng').addEventListener('input', function() {
        updateModalMap(document.getElementById('coordLat').value, this.value);
    });
}

function closeCoordinateModal() {
    const modal = document.getElementById('coordinateModal');
    if (modal) modal.remove();
}

async function saveCoordinate() {
    const lat = document.getElementById('coordLat').value.trim();
    const lng = document.getElementById('coordLng').value.trim();
    
    if (lat && lng) {
        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'save', station: stationID, data: { latitude: lat, longitude: lng } })
            });
            const text = await res.text();
            const result = safeParseJSON(text, 'บันทึกพิกัด');
            if (!result) return;
            if (!result.success) throw new Error(result.message);

            const coordText = `สพ/ช : ${lat}.${lng}`;
            toggleLocationUI('coord', true, coordText);
            document.getElementById('mapFrame').src = `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`;
            closeCoordinateModal();
            alert('✅ บันทึกพิกัดสำเร็จแล้ว');
        } catch (error) {
            console.error('Error saving coordinate:', error);
            alert('❌ เกิดข้อผิดพลาดในการบันทึกพิกัด: ' + error.message);
        }
    } else {
        alert('❌ กรุณากรอกทั้ง Latitude และ Longitude');
    }
}

function updateModalMap(lat, lng) {
    const mapFrame = document.getElementById('modalMapFrame');
    const loadingMap = document.getElementById('loadingMap');
    
    if (!mapFrame || !loadingMap) return;
    
    if (lat && lng && !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lng))) {
        loadingMap.style.display = 'flex'; 
        
        // 💡 แก้ไข: ใช้ URL Google Map ที่ถูกต้อง
        // ✅ แก้ไขตัวแปร mapUrl สำหรับแสดงตัวอย่างในหน้าจอแก้ไข
        const mapUrl = `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`;
        
        mapFrame.src = mapUrl;
        
        mapFrame.onload = function() {
            loadingMap.style.display = 'none';
        }
        
        setTimeout(() => loadingMap.style.display = 'none', 1000); 
        
    } else {
        mapFrame.src = ''; 
        loadingMap.textContent = 'กรุณาใส่ค่า Latitude และ Longitude ที่ถูกต้อง';
        loadingMap.style.display = 'flex';
    }
}

async function deleteCoordinate() {
    if (confirm('ต้องการลบพิกัดหรือไม่?')) {
        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'save', station: stationID, data: { latitude: '', longitude: '' } })
            });
            const text = await res.text();
            const result = safeParseJSON(text, 'ลบพิกัด');
            if (!result) return;
            if (!result.success) throw new Error(result.message);

            toggleLocationUI('coord', false, null);
            document.getElementById('mapFrame').src = '';
            alert('✅ ลบพิกัดสำเร็จแล้ว');
        } catch (error) {
            console.error('Error deleting coordinate:', error);
            alert('❌ เกิดข้อผิดพลาดในการลบพิกัด: ' + error.message);
        }
    }
}


// 8. Image Gallery Modal Functions
function createImageItemHTML(image) {
    const imageName = image.name ? image.name.substring(0, 15) : 'img_untitled';
    const imageDate = image.date || new Date().toLocaleDateString('th-TH');
    
    // 💡 NEW: ใช้ URL ที่ถูกตรวจสอบแล้ว (img.url คือ finalUrl จาก loadWangphangData)
    const imageSource = image.url; 
    
    return `
        <div class="modal-gallery-item" data-id="${image.id}">
            <img src="${imageSource}" alt="${imageName}">
            <button class="delete-icon" onclick="deleteModalImage('${image.id}')"><i class="fas fa-trash"></i></button>
        </div>
    `;
}

function openImageGalleryModal() {
    let imagesHTML = currentModalImages.map(createImageItemHTML).join('');
    
    imagesHTML += `
        <div class="modal-gallery-item modal-upload-placeholder" onclick="openCloudinaryWidget()">
            <i class="fas fa-plus"></i>
        </div>
    `;
    
    const modalHTML = `
        <div id="imageGalleryModal" style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.6);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        ">
            <div style="
                background: white;
                padding: 30px;
                border-radius: 12px;
                width: 90%;
                max-width: 700px;
                max-height: 90vh;
                overflow-y: auto;
            ">
                <h3 style="margin: 0 0 20px 0;">รายละเอียดรูปภาพ</h3>
                
                <div class="image-gallery-modal" id="modalImageGrid">
                    ${imagesHTML}
                </div>
                
                <input type="file" id="imageUploadInput" accept="image/*" multiple style="display: none;" onchange="handleImageUpload(event)">
                
                <div style="margin-top: 30px; display: flex; gap: 10px; justify-content: flex-end;" class="modal-footer">
                    <button class="cancel-btn" onclick="closeImageGalleryModal()">ยกเลิก</button>
                    <button class="save-btn" onclick="saveImageGallery()">บันทึก</button>
                </div>
            </div>
        </div>
    `;
    
    if (document.body) {
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    } else {
        console.error("❌ Cannot open modal: document.body is not available.");
    }
}

function closeImageGalleryModal() {
    const modal = document.getElementById('imageGalleryModal');
    if (modal) modal.remove();
}

// 💡 NEW: ฟังก์ชันเปิด Cloudinary Widget (ถูกผูกกับปุ่ม + Add)
function openCloudinaryWidget() {
    // ⚠️ ตรวจสอบว่าใส่ค่า Config แล้วหรือยัง
    if (CLOUDINARY_CONFIG.cloudName === 'YOUR_CLOUD_NAME_HERE' || 
        CLOUDINARY_CONFIG.uploadPreset === 'YOUR_UPLOAD_PRESET_HERE') {
        alert('⚠️ กรุณาแก้ไข CLOUDINARY_CONFIG ใน wangphang-scripts.js ก่อน');
        return;
    }
    
    if (typeof cloudinary === 'undefined') {
        alert('❌ Cloudinary library ยังไม่ถูกโหลด');
        return;
    }
    
    const widget = cloudinary.createUploadWidget({
        cloudName: CLOUDINARY_CONFIG.cloudName,
        uploadPreset: CLOUDINARY_CONFIG.uploadPreset,
        folder: CLOUDINARY_CONFIG.folder,
        multiple: true,
        maxFiles: CLOUDINARY_CONFIG.maxFiles - currentModalImages.length, 
        sources: ['local', 'camera'],
        clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
        styles: {
            palette: {
                window: "#FFFFFF",
                tabIcon: "#FFD101",
                link: "#4285f4",
                action: "#FFD101",
            }
        }
    }, (error, result) => {
        if (result && result.event === 'success') {
            const uploadedUrl = result.info.secure_url;
            const newImage = { 
                id: 'cld_' + result.info.public_id, 
                url: uploadedUrl, 
                name: result.info.original_filename + '.' + result.info.format, 
                date: new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'numeric', day: 'numeric' })
            };
            
            // 💾 เพิ่ม URL จริงที่ได้จาก Cloudinary ลงใน Array ชั่วคราว
            currentModalImages.push(newImage);
            
            // 🔄 อัปเดต UI ใน Modal และรีเฟรช Modal
            updateModalGrid();
        }
        
        if (error) {
            console.error('Upload error:', error);
        }
    });
    
    widget.open();
}

// ฟังก์ชันนี้ไม่ถูกใช้แล้ว (แทนที่ด้วย Cloudinary Widget)
async function handleImageUpload(event) {
    // โค้ดถูกแทนที่ด้วย openCloudinaryWidget
}

function updateModalGrid() {
    const grid = document.getElementById('modalImageGrid');
    if (!grid) return;
    
    let imagesHTML = currentModalImages.map(createImageItemHTML).join('');
    
    imagesHTML += `
        <div class="modal-gallery-item modal-upload-placeholder" onclick="openCloudinaryWidget()">
            <i class="fas fa-plus"></i>
        </div>
    `;
    grid.innerHTML = imagesHTML;
}

function deleteModalImage(id) {
    if (confirm('ต้องการลบรูปภาพนี้หรือไม่?')) {
        currentModalImages = currentModalImages.filter(img => img.id !== id);
        updateModalGrid();
    }
}

// Helper function to render the main image gallery UI based on currentModalImages
function updateMainGalleryUI() {
    const mainGallery = document.getElementById('imageGalleryContainer').querySelector('.image-gallery');
    const imagePlaceholder = document.getElementById('image-placeholder');
    
    if (currentModalImages.length > 0) {
        // แสดงข้อมูลจริง
        if (mainGallery) mainGallery.style.display = 'grid';
        if (imagePlaceholder) imagePlaceholder.style.display = 'none';
        
        const newMainGalleryHTML = currentModalImages.map(img => {
            const imageSource = img.url; 
            
            return `
                <div class="gallery-item" data-id="${img.id}">
                    <img src="${imageSource}" 
                         alt="Image" 
                         onclick="openImageLightbox('${imageSource}')" 
                         style="cursor: pointer;">
                         
                    <div class="image-info">
                        <div>${img.name ? img.name.substring(0, 15) : '#img_untitled'}</div>
                        <div class="image-date">${img.date || new Date().toLocaleDateString('th-TH')}</div>
                    </div>
                    <button class="delete-icon"><i class="fas fa-trash"></i></button> 
                </div>
            `;
        }).join('');
        
        if (mainGallery) mainGallery.innerHTML = newMainGalleryHTML;
        initMainGalleryListeners();
    } else {
        // แสดง Placeholder
        if (mainGallery) mainGallery.style.display = 'none';
        if (imagePlaceholder) imagePlaceholder.style.display = 'flex'; // แสดง Placeholder รูปดาวน์โหลด
    }
}

// ฟังก์ชันผูก Event Listener ให้ปุ่มลบใน Gallery หลัก
function initMainGalleryListeners() {
    document.querySelectorAll('#imageGalleryContainer .gallery-item .delete-icon').forEach(button => {
        const newButton = button.cloneNode(true);
        button.replaceWith(newButton);
    });

    document.querySelectorAll('#imageGalleryContainer .gallery-item .delete-icon').forEach(button => {
        button.addEventListener('click', function() {
            const itemId = this.closest('.gallery-item').getAttribute('data-id');
            if (itemId) {
                deleteImageFromMainGallery(itemId);
            }
        });
    });
}

async function saveImageGallery() {
    try {
        // 1. เตรียมข้อมูล — ลบ Placeholder ออกเหมือนเดิม
        const imagesToSave = currentModalImages.map(img => {
            const cleanImg = { ...img };
            if (cleanImg.url && cleanImg.url.includes('via.placeholder.com')) {
                delete cleanImg.url;
            }
            return cleanImg;
        }).filter(img => img.id);

        // 2. บันทึกลง MySQL ผ่าน PHP API
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'save', station: stationID, data: { images: imagesToSave } })
        });
        const text = await res.text();
        const result = safeParseJSON(text, 'บันทึกรูปภาพ');
        if (!result) return;
        if (!result.success) throw new Error(result.message);

        // 3. อัปเดต UI และแจ้งผล
        updateMainGalleryUI();
        closeImageGalleryModal();
        alert('✅ บันทึกรูปภาพสำเร็จแล้ว');

    } catch (error) {
        console.error('Error saving image gallery:', error);
        alert('❌ เกิดข้อผิดพลาดในการบันทึกรูปภาพ: ' + error.message);
    }
}

async function deleteImageFromMainGallery(id) {
    if (confirm('ต้องการลบรูปภาพนี้ออกจากหน้าหลักหรือไม่?')) {
        currentModalImages = currentModalImages.filter(img => img.id !== id);
        
        try {
            const imagesToSave = currentModalImages.map(img => {
                const cleanImg = { ...img };
                if (cleanImg.url && cleanImg.url.includes('via.placeholder.com')) {
                    delete cleanImg.url;
                }
                return cleanImg;
            }).filter(img => img.id);

            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'save', station: stationID, data: { images: imagesToSave } })
            });
            const text = await res.text();
            const result = safeParseJSON(text, 'ลบรูปภาพ');
            if (!result) return;
            if (!result.success) throw new Error(result.message);

            const elementToRemove = document.querySelector(`.gallery-item[data-id="${id}"]`);
            if (elementToRemove) {
                elementToRemove.remove();
                alert('✅ ลบรูปภาพสำเร็จแล้ว');
            }
        } catch (error) {
            console.error('Error deleting image:', error);
            alert('❌ เกิดข้อผิดพลาดในการลบรูปภาพ: ' + error.message);
        }
    }
}

// ในส่วนของ Image Gallery Modal Functions

// ===== NEW: ฟังก์ชันเปิดรูปภาพเต็มจอ (Lightbox) =====
function openImageLightbox(imageUrl) {
    // ตรวจสอบว่า URL ถูกต้องหรือไม่ (ป้องกันการเปิด Placeholder URL)
    if (!imageUrl || imageUrl.includes('via.placeholder.com')) {
        alert('❌ ไม่สามารถดูรูปภาพขนาดใหญ่ได้: URL รูปภาพไม่ถูกต้องหรือเป็น Placeholder');
        return;
    }
    
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
        ">
            <img src="${imageUrl}" style="
                max-width: 90%;
                max-height: 90%;
                object-fit: contain;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.5);
                pointer-events: none; /* ป้องกันการคลิกบนรูปภาพไม่ให้ปิด Modal */
            ">
            <button id="closeLightboxBtn" style="
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
            ">✕</button>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', lightboxHTML);

    // ผูก Event สำหรับปิด Lightbox
    const lightbox = document.getElementById('imageLightbox');
    if (lightbox) {
        lightbox.addEventListener('click', function(e) {
            // ปิดเมื่อคลิกที่พื้นหลังหรือปุ่มปิด
            if (e.target.id === 'imageLightbox' || e.target.id === 'closeLightboxBtn' || e.target.closest('#closeLightboxBtn')) {
                 this.remove();
            }
        });
    }
}


// =======================================================
// ส่วนงานใหม่: Toggle ดูเพิ่มเติม และ Pop-up แก้ไขข้อมูลสถานี
// =======================================================

function initToggleViewMore() {
    const toggleBtn = document.getElementById('toggleBtn');
    const moreContent = document.getElementById('moreContent');
    
    if (toggleBtn && moreContent) {
        // บังคับให้ซ่อนข้อมูลเมื่อเริ่มโหลดหน้าเว็บ
        moreContent.style.display = 'none'; 

        toggleBtn.onclick = function() {
            // ตรวจสอบสถานะการแสดงผลปัจจุบัน
            const isHidden = (moreContent.style.display === 'none' || moreContent.style.display === '');
            
            if (isHidden) {
                // 🔼 กางออก -> เปลี่ยนเป็นลูกศรชี้ขึ้น (fa-chevron-up)
                moreContent.style.display = 'block';
                this.innerHTML = '<i class="fa-solid fa-chevron-up"></i> ย่อข้อมูลลง';
                this.classList.add('active');
            } else {
                // 🔽 พับเก็บ -> เปลี่ยนเป็นลูกศรชี้ลง (fa-chevron-down)
                moreContent.style.display = 'none';
                this.innerHTML = '<i class="fa-solid fa-chevron-down"></i> ดูเพิ่มเติม';
                this.classList.remove('active');
            }
        };
    }
}

function editAllInfo() {
    // ฟังก์ชันช่วยดึงค่าจาก element ตาม id (ดึงจาก val- ที่แสดงบนหน้าจอ)
    const getData = (id) => {
        const el = document.getElementById(id);
        return el ? el.textContent.trim() : "";
    };

    const modalHTML = `
        <div id="editInfoModal" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); display:flex; align-items:center; justify-content:center; z-index:10002; padding: 20px;">
            <div style="background:white; padding:30px; border-radius:12px; width:100%; max-width:950px; max-height:90vh; overflow-y:auto; box-shadow: 0 5px 25px rgba(0,0,0,0.3);">
                <h3 style="margin-bottom:20px; border-bottom: 2px solid #FFD101; padding-bottom:10px; color:#333;">
                    <i class="fas fa-edit"></i> แก้ไขข้อมูลสถานีโดยละเอียด (ครบ 36 หัวข้อ)
                </h3>
                
                <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:15px;">
                    <div><label>1. รหัส 10 หลัก</label><input type="text" id="edit-id" value="${getData('val-id')}" class="form-input"></div>
                    <div><label>2. ภาคขายและบริการ</label><input type="text" id="edit-sector" value="${getData('val-sector')}" class="form-input"></div>
                    <div><label>3. ชื่อย่อสถานที่</label><input type="text" id="edit-short" value="${getData('val-short')}" class="form-input"></div>
                    <div><label>4. ชื่อสถานที่ (ไทย)</label><input type="text" id="edit-th" value="${getData('val-th')}" class="form-input"></div>
                    <div><label>5. ชื่อสถานที่ไทยเดิม</label><input type="text" id="edit-th-old" value="${getData('val-th-old')}" class="form-input"></div>
                    <div><label>6. ชื่อสถานที่อังกฤษ</label><input type="text" id="edit-en" value="${getData('val-en')}" class="form-input"></div>
                    <div><label>7. ชื่อสถานที่อังกฤษเดิม</label><input type="text" id="edit-en-old" value="${getData('val-en-old')}" class="form-input"></div>
                    <div><label>8. ชื่อบริษัท</label><input type="text" id="edit-comp" value="${getData('val-comp')}" class="form-input"></div>
                    <div><label>9. สถานะ</label><input type="text" id="edit-status" value="${getData('val-status')}" class="form-input"></div>
                    
                    <div><label>10. Homing</label><input type="text" id="edit-homing" value="${getData('val-homing')}" class="form-input"></div>
                    <div><label>11. ศูนย์บริการลูกค้า</label><input type="text" id="edit-center" value="${getData('val-center')}" class="form-input"></div>
                    <div><label>12. Rank</label><input type="text" id="edit-rank" value="${getData('val-rank')}" class="form-input"></div>
                    <div><label>13. ขนาดเลขหมาย</label><input type="text" id="edit-size" value="${getData('val-size')}" class="form-input"></div>
                    <div><label>14. โครงการ</label><input type="text" id="edit-proj" value="${getData('val-proj')}" class="form-input"></div>
                    <div><label>15. รหัสสถานีฐานบริษัท</label><input type="text" id="edit-base" value="${getData('val-base')}" class="form-input"></div>
                    
                    <div><label>16. SITE_NAMETH</label><input type="text" id="edit-siteth" value="${getData('val-siteth')}" class="form-input"></div>
                    <div><label>17. SITE_LAT</label><input type="text" id="edit-sitelat" value="${getData('val-sitelat')}" class="form-input"></div>
                    <div><label>18. SITE_LONG</label><input type="text" id="edit-sitelong" value="${getData('val-sitelong')}" class="form-input"></div>
                    <div><label>19. SITE_TYPE (1)</label><input type="text" id="edit-sitetype" value="${getData('val-sitetype')}" class="form-input"></div>
                    <div><label>20. SITE_EQUIPMENT</label><input type="text" id="edit-equip" value="${getData('val-equip')}" class="form-input"></div>
                    <div><label>21. SITE_TYPE (2)</label><input type="text" id="edit-sitetype2" value="${getData('val-sitetype2')}" class="form-input"></div>
                    <div><label>22. SITE OWNER</label><input type="text" id="edit-owner" value="${getData('val-owner')}" class="form-input"></div>
                    
                    <div><label>23. สถานที่ติดตั้ง</label><input type="text" id="edit-loc" value="${getData('val-loc')}" class="form-input"></div>
                    <div><label>24. ซอย</label><input type="text" id="edit-soi" value="${getData('val-soi')}" class="form-input"></div>
                    <div><label>25. ถนน</label><input type="text" id="edit-road" value="${getData('val-road')}" class="form-input"></div>
                    <div><label>26. หมู่บ้าน</label><input type="text" id="edit-village" value="${getData('val-village')}" class="form-input"></div>
                    <div><label>27. แขวง/ตำบล</label><input type="text" id="edit-tambon" value="${getData('val-tambon')}" class="form-input"></div>
                    <div><label>28. เขต/อำเภอ</label><input type="text" id="edit-amphoe" value="${getData('val-amphoe')}" class="form-input"></div>
                    <div><label>29. จังหวัด</label><input type="text" id="edit-province" value="${getData('val-province')}" class="form-input"></div>
                    <div><label>30. รหัสไปรษณีย์</label><input type="text" id="edit-zip" value="${getData('val-zip')}" class="form-input"></div>
                    <div><label>31. Lat (พิกัด)</label><input type="text" id="edit-lat" value="${getData('val-lat')}" class="form-input"></div>
                    <div><label>32. Long (พิกัด)</label><input type="text" id="edit-long" value="${getData('val-long')}" class="form-input"></div>
                    
                    <div><label>33. ส่วนงานผู้ขอรหัส</label><input type="text" id="edit-dept" value="${getData('val-dept')}" class="form-input"></div>
                    <div><label>34. วันที่อนุมัติ</label><input type="text" id="edit-date" value="${getData('val-date')}" class="form-input"></div>
                    <div><label>35. ผู้จัดทำ</label><input type="text" id="edit-creator" value="${getData('val-creator')}" class="form-input"></div>
                    
                    <div style="grid-column: span 1;"><label>36. หมายเหตุ</label>
                        <textarea id="edit-note" class="form-input" style="height: 60px;">${getData('val-note')}</textarea>
                    </div>
                </div>

                <div style="margin-top:25px; text-align:right; border-top:1px solid #eee; padding-top:20px; display: flex; gap: 10px; justify-content: flex-end;">
                    <button onclick="document.getElementById('editInfoModal').remove()" style="padding:10px 25px; background:#ddd; border:none; border-radius:6px; cursor:pointer; font-weight:600;">ยกเลิก</button>
                    <button onclick="saveAllInfo()" style="padding:10px 25px; background:#FFD101; border:none; border-radius:6px; cursor:pointer; font-weight:600; color:#333;">บันทึกข้อมูลทั้งหมด</button>
                </div>
            </div>
        </div>
        <style>
            .form-input { width:100%; padding:10px; border:1px solid #ddd; border-radius:6px; margin-top:5px; font-size: 14px; font-family:inherit; outline: none; }
            .form-input:focus { border-color: #FFD101; box-shadow: 0 0 5px rgba(255,209,1,0.3); }
            label { font-size:13px; font-weight:600; color:#555; }
        </style>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}
// ฟังก์ชันบันทึกข้อมูลทั้งหมดจาก Modal

async function saveAllInfo() {
    const updatedData = {
        'รหัส10หลัก': document.getElementById('edit-id').value,
        'ภาคขายและบริการ': document.getElementById('edit-sector').value,
        'ชื่อย่อสถานที่': document.getElementById('edit-short').value,
        'ชื่อสถานที่ไทย': document.getElementById('edit-th').value,
        'ชื่อสถานที่ไทยเดิม': document.getElementById('edit-th-old').value,
        'ชื่อสถานที่อังกฤษ': document.getElementById('edit-en').value,
        'ชื่อสถานที่อังกฤษเดิม': document.getElementById('edit-en-old').value,
        'ชื่อบริษัท': document.getElementById('edit-comp').value,
        'สถานะ': document.getElementById('edit-status').value,
        'Homing': document.getElementById('edit-homing').value,
        'ศูนย์บริการลูกค้า': document.getElementById('edit-center').value,
        'Rank': document.getElementById('edit-rank').value,
        'ขนาดเลขหมาย': document.getElementById('edit-size').value,
        'โครงการ': document.getElementById('edit-proj').value,
        'รหัสสถานีฐานบริษัท': document.getElementById('edit-base').value,
        'SITE_NAMETH': document.getElementById('edit-siteth').value,
        'SITE_LAT': document.getElementById('edit-sitelat').value,
        'SITE_LONG': document.getElementById('edit-sitelong').value,
        'SITE_TYPE': document.getElementById('edit-sitetype').value,
        'SITE_EQUIPMENT': document.getElementById('edit-equip').value,
        'SITE_TYPE2': document.getElementById('edit-sitetype2').value,
        'SITE_OWNER': document.getElementById('edit-owner').value,
        'สถานที่ติดตั้ง': document.getElementById('edit-loc').value,
        'ซอย': document.getElementById('edit-soi').value,
        'ถนน': document.getElementById('edit-road').value,
        'หมู่บ้าน': document.getElementById('edit-village').value,
        'แขวง/ตำบล': document.getElementById('edit-tambon').value,
        'เขต/อำเภอ': document.getElementById('edit-amphoe').value,
        'จังหวัด': document.getElementById('edit-province').value,
        'รหัสไปรณีย์': document.getElementById('edit-zip').value,
        'Lat': document.getElementById('edit-lat').value,
        'Long': document.getElementById('edit-long').value,
        'ส่วนงานผู้ขอรหัส': document.getElementById('edit-dept').value,
        'วันที่อนุมัติ': document.getElementById('edit-date').value,
        'ผู้จัดทำ': document.getElementById('edit-creator').value,
        'หมายเหตุ': document.getElementById('edit-note').value
        // ✅ ลบ firebase.firestore.FieldValue.serverTimestamp() ออก (ไม่ใช้ Firebase แล้ว)
    };

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'save', station: stationID, data: updatedData })
        });
        const text = await res.text();
        const result = safeParseJSON(text, 'บันทึกข้อมูลทั้งหมด');
        if (!result) return;
        if (!result.success) throw new Error(result.message);

        loadWangphangData();
        document.getElementById('editInfoModal').remove();
        alert('✅ บันทึกข้อมูลทั้งหมดสำเร็จแล้ว');
    } catch (error) {
        console.error("❌ เกิดข้อผิดพลาดในการบันทึก:", error);
        alert('❌ ไม่สามารถบันทึกข้อมูลได้: ' + error.message);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    loadEquipmentCounts();
    loadWangphangData(); // ✅ แก้ชื่อฟังก์ชันให้ตรงกับที่เราเปลี่ยนในจุดที่ 2
    initToggleViewMore();
});

// ========================================
// ✅ Helper: safe JSON parse (ป้องกัน PHP ส่ง HTML กลับมา)
// ========================================
function safeParseJSON(text, context) {
    try {
        return JSON.parse(text);
    } catch (e) {
        console.error(`❌ ${context}: API ส่ง non-JSON กลับมา:`, text.substring(0, 300));
        alert(`❌ เกิดข้อผิดพลาดในการ${context}: เซิร์ฟเวอร์ตอบกลับผิดรูปแบบ\nกรุณาตรวจสอบ PHP error log`);
        return null;
    }
}

// ========================================
// ✅ ควบคุมการแสดงผลปุ่ม Admin (แทน Firebase onAuthStateChanged)
// ========================================
function toggleEditUI(isLoggedIn) {
    const adminElements = [
        '.add-btn', '.edit-btn', '.delete-btn',
        '.upload-firebase-btn', '.add-btn-small',
        '#addExcelBtn', '#deleteAllBtn'
    ];
    adminElements.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
            el.style.display = isLoggedIn ? 'block' : 'none';
        });
    });
}

// ✅ แทนที่ firebase.auth().signOut() → เรียก api_logout.php
function handleLogout() {
    if (confirm("คุณต้องการออกจากระบบใช่หรือไม่?")) {
        fetch('api_logout.php', { method: 'POST' })
            .then(() => {
                console.log("Logout successful!");
                window.location.href = 'login.html';
            })
            .catch(err => {
                console.error("Logout Error:", err);
                window.location.href = 'login.html';
            });
    }
}

// ✅ แทนที่ firebase.auth().onAuthStateChanged → ตรวจสอบ PHP Session
fetch('api_check_session.php')
    .then(r => r.json())
    .then(result => {
        if (result.logged_in) {
            console.log("Logged in as:", result.user || 'user');
            toggleEditUI(true);
        } else {
            console.log("Guest mode: Read-only");
            toggleEditUI(false);
        }
    })
    .catch(() => toggleEditUI(false));