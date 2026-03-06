/**
 * ==============================================================================
 * 🚀 ส่วนที่ 1: การตั้งค่าเริ่มต้นและตัวแปร Global (Configuration & Global Variables)
 * ==============================================================================
 */

// แสดงข้อความใน Console เพื่อยืนยันว่าสคริปต์เวอร์ชันล่าสุดถูกโหลดแล้ว
console.log("🚀 Script Loaded: Version FULL FIXED & MARKED"); 

// ตรวจสอบและตั้งค่าแผนผังชื่อสถานี ป้องกันการประกาศซ้ำหากโหลดซ้ำ
window.STATION_MAP = window.STATION_MAP || { 'maeta': 'แม่ทา', 'khaohuaikaew': 'เขาห้วยแก้ว', 'umong': 'อุโมงค์', 'lamphun1': 'ชส.ลำพูน1' };
// ตรวจสอบและตั้งค่าแผนผังชื่อหมวดหมู่ ภาษาอังกฤษ -> ภาษาไทย
window.TYPE_MAP = window.TYPE_MAP || { 'air': 'Air Conditioner', 'battery': 'Battery', 'generator': 'Generator', 'transformer': 'Transformer', 'rectifier': 'Rectifier', 'peameter': 'PEA Meter', 'solarcell': 'Solar Cell' };
// ตรวจสอบและตั้งค่าแผนผังชื่อชีทใน Excel ที่ต้องอ่าน
window.SHEET_NAME_MAP = window.SHEET_NAME_MAP || { 'air': 'Air', 'battery': 'Battery', 'generator': 'Generator', 'transformer': 'Transformer', 'rectifier': 'Rectifier', 'peameter': 'PEA', 'solarcell': 'Solar' };

// สร้างตัวแปรอ้างอิงภายในเพื่อให้โค้ดส่วนที่เหลือเรียกใช้งานได้ง่าย
var STATION_MAP = window.STATION_MAP;
var TYPE_MAP = window.TYPE_MAP;
var SHEET_NAME_MAP = window.SHEET_NAME_MAP;

const CLOUDINARY_CONFIG = {  
    cloudName: 'dtsx2jqzl',          // ✅ แก้ไข: ตรงกับ Cloud Name จริงใน Cloudinary Console
    uploadPreset: 'nt_engineering',  // ✅ ตรงกับ Upload Preset ใน Cloudinary Console
    folder: 'nt-tech-assets',
    maxFiles: 10
};

// กำหนดหัวข้อคอลัมน์ที่จะแสดงในตารางแยกตามหมวดหมู่
const TABLE_CONFIGS = {
    default: [ // หมวดหมู่มาตรฐาน (Air, Battery, etc.)
        { key: 'newAssetCode', label: 'รหัสสินทรัพย์ใหม่' },
        { key: 'subAssetCode', label: 'รหัสย่อย' },
        { key: 'oldAssetCode', label: 'รหัสเดิม' },
        { key: 'assetDescription', label: 'คำอธิบาย 1' },
        { key: 'assetSpec', label: 'คำอธิบาย 2' }, 
        { key: 'serialNumber', label: 'Serial Number' },
        { key: 'capDate', label: 'Cap.date' },
        { key: 'quantity', label: 'ปริมาณ' },
        { key: 'unit', label: 'Unit' },
        { key: 'acquisitionValue', label: 'มูลค่าได้มา' },
        { key: 'bookValue', label: 'มูลค่าบัญชี' },
        { key: 'costCenter', label: 'ศ.ต้นทุน' },
        { key: 'assetLocationID', label: 'ที่ตั้ง' },
        { key: 'centerCode', label: 'รหัสศูนย์' },
        { key: 'remark', label: 'หมายเหตุ' }
    ],
    peameter: [ // หมวดหมู่ PEA Meter โดยเฉพาะ
        { key: 'peaName', label: 'ชื่อ กฟภ.' },
        { key: 'userNumber', label: 'หมายเลขผู้ใช้ไฟ' },
        { key: 'location', label: 'สถานที่ติดตั้ง' },
        { key: 'stationName', label: 'ชื่อชุมสาย/สถานี' },
        { key: 'stationCode', label: 'รหัสชุมสาย 10 หลัก' },
        { key: 'peaNumber', label: 'หมายเลข PEA' },
        { key: 'coordinates', label: 'พิกัดที่ตั้ง' },
        { key: 'remark', label: 'หมายเหตุ' }
    ]
};

// ตัวแปลหัวตารางจาก Excel (ไทย) ให้เป็น Key ภาษาอังกฤษในระบบ
const FIELD_DEFINITIONS = {
    newAssetCode: { label: 'รหัสสินทรัพย์ใหม่', possibleHeaders: ['รหัสสินทรัพย์ใหม่', 'รหัสทรัพย์สินใหม่'] },
    subAssetCode: { label: 'รหัสย่อย', possibleHeaders: ['รหัสสินทรัพย์ย่อย', 'รหัสทรัพย์สินย่อย'] },
    oldAssetCode: { label: 'รหัสเดิม', possibleHeaders: ['รหัสสินทรัพย์เดิม', 'รหัสทรัพย์สินเดิม'] },
    assetDescription: { label: 'คำอธิบาย 1', possibleHeaders: ['คำอธิบายของสินทรัพย์'] },
    assetSpec: { label: 'คำอธิบาย 2', possibleHeaders: ['คำอธิบายของสินทรัพย์'] }, 
    serialNumber: { label: 'Serial Number', possibleHeaders: ['Serial Number', 'S/N', 'Serial Numbe,r'] },
    capDate: { label: 'Cap.date', possibleHeaders: ['Cap.date'] },
    quantity: { label: 'ปริมาณ', possibleHeaders: ['ปริมาณ', 'Qty'] },
    unit: { label: 'Unit', possibleHeaders: ['Unit', 'หน่วย'] },
    acquisitionValue: { label: 'มูลค่าได้มา', possibleHeaders: ['มูลค่าการได้มา'] },
    bookValue: { label: 'มูลค่าบัญชี', possibleHeaders: ['มูลค่าตามบัญชี'] },
    costCenter: { label: 'ศ.ต้นทุน', possibleHeaders: ['ศ.ต้นทุน', 'Cost Center'] },
    assetLocationID: { label: 'ที่ตั้ง', possibleHeaders: ['ที่ตั้ง', 'Location'] },
    centerCode: { label: 'รหัสศูนย์', possibleHeaders: ['รหัสศูนย์', 'Center Code'] },
    remark: { label: 'หมายเหตุ', possibleHeaders: ['หมายเหตุ', 'Note', 'Remark'] },
    peaName: { label: 'ชื่อ กฟภ.', possibleHeaders: ['ชื่อ กฟภ.', 'กฟภ.'] },
    userNumber: { label: 'หมายเลขผู้ใช้ไฟ', possibleHeaders: ['หมายเลขผู้ใช้ไฟ'] },
    location: { label: 'สถานที่ติดตั้ง', possibleHeaders: ['สถานที่ติดตั้ง'] },
    stationName: { label: 'ชื่อชุมสาย/สถานี', possibleHeaders: ['ชื่อชุมสาย/สถานี'] },
    stationCode: { label: 'รหัสชุมสาย 10 หลัก', possibleHeaders: ['รหัสชุมสาย 10 หลัก'] },
    peaNumber: { label: 'หมายเลข PEA', possibleHeaders: ['หมายเลข PEA'] },
    coordinates: { label: 'พิกัดที่ตั้ง', possibleHeaders: ['พิกัดที่ตั้ง'] }
};



// ✅ ใช้ PHP API แทน Firebase Firestore
// API endpoint: api_equipment_inventory.php
const API_URL = 'api_equipment_inventory.php';
console.log("✅ ใช้ MySQL/PHP API แทน Firebase");

// ตัวแปรเก็บสถานะข้อมูลภายในแอป
let fullDataStorage = []; // เก็บข้อมูลอุปกรณ์ทั้งหมด
let currentUnitSerial = null; // เก็บ ID อุปกรณ์ที่เลือกอยู่
let imageStorage = {}; // เก็บรายการรูปภาพแยกตาม ID อุปกรณ์
let colIndices = {}; // เก็บตำแหน่งคอลัมน์ Index สำหรับข้อมูล Excel

/**
 * ✅ มาร์คจุดเพิ่ม: รับค่าจาก URL Parameters
 * ตัวอย่าง URL: equipment-detail.html?station=maeta&type=air
 */
const urlParams = new URLSearchParams(window.location.search);
const currentStationID = urlParams.get('station'); 
// ✅ แก้จาก const เป็น let เพื่อให้ตัวแปรนี้ "เปลี่ยนค่าได้" เวลาคลิกเมนู
let currentType = urlParams.get('type') || 'air';

// แสดงใน Console เพื่อเช็คความถูกต้อง
console.log(`📍 Current Station: ${currentStationID}, Type: ${currentType}`);

/**
 * ==============================================================================
 * 🛠️ ส่วนที่ 2: ฟังก์ชันช่วยเหลือ (Helpers)
 * ==============================================================================
 */

// ✅ มาร์คจุดแก้ไข #3: ฟังก์ชันกลางสำหรับสร้าง Document ID
// 🎯 ฟังก์ชันนี้จะถูกใช้ในทุกที่ที่ต้องการสร้าง ID เพื่อให้ได้ผลลัพธ์เหมือนกันเสมอ
function generateDocumentId(item, index, type) {
    // 🔍 อธิบาย: ฟังก์ชันนี้รับ 3 parameters:
    // - item: ข้อมูลอุปกรณ์ (object)
    // - index: ลำดับในตาราง (number)
    // - type: ประเภทอุปกรณ์ เช่น 'air', 'battery', 'peameter' (string)
    
    if (type === 'peameter') {
        // ✅ แก้ไขสำหรับ PEA: ใช้ userNumber หรือ peaNumber
        // 📌 userNumber เชื่อถือได้กว่าเพราะมีเสมอในไฟล์ PEA
        const uniqueId = item.userNumber || item.peaNumber;
        
        if (uniqueId && String(uniqueId).trim() !== '') {
            // ทำความสะอาดเลข (เอาอักขระพิเศษออก เหลือแค่ตัวเลข)
            const cleanId = String(uniqueId).replace(/[^0-9]/g, '');
            
            if (cleanId) {
                // ✅ ใช้ userNumber หรือ peaNumber ที่ทำความสะอาดแล้ว
                return `PEA_${cleanId}`;
            }
        }
        
        // ⚠️ Fallback: ถ้าไม่มีทั้ง userNumber และ peaNumber
        // ใช้ stationCode (4 ตัวแรก) + index
        if (item.stationCode) {
            const stationPart = String(item.stationCode).substring(0, 4);
            console.warn(`⚠️ PEA แถว ${index}: ไม่มี userNumber/peaNumber, ใช้ ${stationPart}_${index}`);
            return `PEA_${stationPart}_${index}`;
        }
        
        // ⚠️ Fallback สุดท้าย
        console.warn(`⚠️ PEA แถว ${index}: ใช้ TEMP_${index}`);
        return `PEA_TEMP_${index}`;
    } else {
        // 📌 สำหรับอุปกรณ์ประเภทอื่นๆ ใช้รหัสสินทรัพย์
        const mainCode = item.newAssetCode || "NOID";  // ⚠️ ใช้ "NOID" เป็นค่าเริ่มต้น
        
        // 🔍 ตรวจสอบ subAssetCode อย่างละเอียด
        let subCode;
        if (item.subAssetCode !== undefined && 
            item.subAssetCode !== null && 
            String(item.subAssetCode).trim() !== '') {
            subCode = item.subAssetCode;  // ใช้ค่าจริง
        } else {
            subCode = index;  // ใช้ index แทน
        }
        
        return `${mainCode}_${subCode}`;
    }
}

// ดึงค่า Query Parameters จาก URL (เช่น ?station=maeta&type=air)
function getQueryParams() {
    const params = {};
    const queryString = window.location.search.substring(1);
    const regex = /([^&=]+)=([^&]*)/g;
    let m;
    while (m = regex.exec(queryString)) {
        params[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
    }
    return params;
}

// ระบุประเภทอุปกรณ์ปัจจุบันโดยดูจากหัวข้อในหน้าเว็บ
function getCurrentTypeFromUI() {
    const title = document.querySelector('#inventoryTitle');
    if (!title) return 'air';
    for (const [key, label] of Object.entries(TYPE_MAP)) {
        if (label === title.textContent.trim()) return key;
    }
    return getQueryParams().type || 'air';
}

/**
 * ==============================================================================
 * 📁 ส่วนที่ 3: การจัดการไฟล์ Excel (Excel Processing Logic)
 * ==============================================================================
 */

// ฟังก์ชันหลักเมื่อมีการเลือกไฟล์ Excel
function handleExcelFile(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            
            window.allCategoryData = {}; // ล้างข้อมูลเก่าก่อนโหลดใหม่

            // วนลูปอ่านทุก Sheet ในไฟล์ Excel
            workbook.SheetNames.forEach(sheetName => {
                const typeKey = Object.keys(SHEET_NAME_MAP).find(key => 
                    sheetName.trim().toLowerCase().includes(SHEET_NAME_MAP[key].toLowerCase())
                );

                if (typeKey) {
                    const sheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true });
                    // ประมวลผลและเก็บข้อมูลแยกตามหมวดหมู่
                    window.allCategoryData[typeKey] = processExcelRows(jsonData);
                }
            });

            // แสดงข้อมูลหมวดหมู่ปัจจุบันทันทีหลังโหลดเสร็จ
            const currentType = getCurrentTypeFromUI();
            if (window.allCategoryData[currentType]) {
                fullDataStorage = window.allCategoryData[currentType];
                renderTable(fullDataStorage);
            }
            alert('✅ โหลดข้อมูลครบทุกชีทแล้ว!');
            updateActionButtons(); // แสดงปุ่ม Upload
        } catch (error) { console.error(error); }
    };
    reader.readAsArrayBuffer(file);
    const fileInput = document.getElementById('excelFileInput');
    if (fileInput) fileInput.value = ''; // ⭐ เคลียร์ค่า
}


// ประมวลผลแถวข้อมูลจาก Excel และแปลงเป็น Object มาตรฐาน
function processExcelRows(jsonData) {
    const excelHeaders = jsonData[0] || []; // แถวแรกเป็นหัวตาราง
    ensureDefaultColumns(); 

    // ค้นหา Index ของแต่ละคอลัมน์ในไฟล์ Excel
    const tempIndices = {};
    for (const [key, def] of Object.entries(FIELD_DEFINITIONS)) {
        let index = excelHeaders.findIndex((h, idx) => {
            const isMatch = def.possibleHeaders.some(ph => String(h).trim() === ph);
            // กรณีพิเศษ: คำอธิบายตัวที่ 2 ให้หาตำแหน่งที่อยู่ถัดจากตัวที่ 1
            if (key === 'assetSpec') return isMatch && idx > (tempIndices['assetDescription'] || -1);
            return isMatch;
        });
        if (index !== -1) tempIndices[key] = index;
    }

    let dataRows = jsonData.slice(1); // ตัดหัวตารางออก
    
    // แปลง Array เป็น Object เพื่อให้ใช้งานได้เหมือนข้อมูลจาก Firebase
    return dataRows.filter(row => row.some(c => c !== null && String(c).trim() !== ''))
        .map(row => {
            const obj = {};
            for (const [key, idx] of Object.entries(tempIndices)) {
                obj[key] = row[idx] || "";
            }
            return obj;
        });
}

// ตรวจสอบและตั้งค่า Index เริ่มต้นหากระบบยังไม่รู้ตำแหน่ง
function ensureDefaultColumns() {
    if (Object.keys(colIndices).length === 0) {
        let idx = 0;
        for (const key of Object.keys(FIELD_DEFINITIONS)) {
            colIndices[key] = idx++;
        }
    }
}

// แสดงปุ่ม "Upload to DB" เมื่อมีข้อมูลในคลังชั่วคราว
function updateActionButtons() {
    const upBtn = document.getElementById('uploadDBBtn');
    if(upBtn) upBtn.style.display = 'inline-block';
}

/**
 * ==============================================================================
 * 📊 ส่วนที่ 4: การดึงข้อมูลและแสดงผลตาราง (Data Fetching & Rendering)
 * ==============================================================================
 */

// ✅ fetchDataFromDB (ใช้ PHP API)
async function fetchDataFromDB(type) {
    const station     = currentStationID;
    const typeToLoad  = type || currentType;

    if (!station) {
        console.log("📍 Waiting for Station ID...");
        return;
    }

    try {
        const res  = await fetch(API_URL, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ action: 'fetch', station, type: typeToLoad })
        });
        const result = await res.json();
        if (!result.success) throw new Error(result.message);

        let data = [];
        imageStorage = {}; // ล้างรูปภาพเก่า

        result.data.forEach(item => {
            item._docId = item.doc_id; // เหมือน Firebase doc.id
            data.push(item);

            // สร้าง refId สำหรับ PEA Meter (โครงสร้างเดิม)
            let refId;
            if (currentType === 'peameter') {
                const uniqueId = item.userNumber || item.peaNumber;
                const cleanId  = uniqueId ? String(uniqueId).replace(/[^0-9]/g, '') : null;
                refId = cleanId ? `PEA_${cleanId}` : item.doc_id;
            } else {
                refId = item.doc_id;
            }

            if (item.images && item.images.length > 0) {
                imageStorage[refId] = item.images;
                console.log(`📸 โหลดรูปของ ID: ${refId} เข้าสู่ระบบแล้ว`);
            }
        });

        fullDataStorage = data;
        renderTable(data);

        const title = document.querySelector('#inventoryTitle');
        if (title) title.textContent = TYPE_MAP[currentType] || currentType;

    } catch (err) {
        console.error('❌ fetchDataFromDB error:', err);
    }
}

// สร้างหัวตาราง (Thead) แบบ Dynamic
function renderTableHeader(type) {
    const tableHead = document.querySelector('#eqTable thead tr');
    if (!tableHead) return [];
    const config = TABLE_CONFIGS[type] || TABLE_CONFIGS.default; // เลือก config ตามหมวดหมู่
    let html = '<th>#</th>'; 
    config.forEach(col => { html += `<th>${col.label}</th>`; }); // วาดหัวข้อคอลัมน์
    html += '<th>จัดการ</th>'; // เปลี่ยนชื่อคอลัมน์เป็น "จัดการ"
    tableHead.innerHTML = html;
    return config; 
}

// วาดเนื้อหาตาราง (Tbody) จากข้อมูล Object
function renderTable(data) {
    const params = getQueryParams();
    const currentType = params.type || 'air';
    const config = renderTableHeader(currentType); // วาดหัวก่อน
    const tableBody = document.getElementById('eqTableBody');
    if (!tableBody) return;

    let html = '';
    data.forEach((item, index) => {
        // ✅ มาร์คจุดแก้ไข #4: ใช้ฟังก์ชันกลาง generateDocumentId แทนการสร้าง ID เอง
        // 🎯 การเปลี่ยนแปลง: แทนที่จะสร้าง ID ด้วยตัวเอง ให้เรียกใช้ฟังก์ชัน generateDocumentId
        const refId = item._docId || generateDocumentId(item, index, currentType);

        html += `<tr data-row-index="${index}" data-serial="${refId}">`;
        html += `<td>${index + 1}</td>`; // ลำดับ
        
        // วาดข้อมูลในแต่ละช่องตาม Key ที่ระบุใน Config
        config.forEach(col => {
            const val = item[col.key]; 
            html += `<td>${(val !== undefined && val !== null && String(val).trim() !== '') ? val : '-'}</td>`;
        });

        // 🔥 จุดแก้ไขหลัก: ส่วนที่วาดปุ่ม Action (จัดการ)
        html += `<td>
            <button class="action-btn image-btn" onclick="openImageUploadForRow(${index})" title="เพิ่มรูป" style="color: #3498db;">
                <i class="fas fa-camera"></i>
            </button>
            <button class="action-btn edit-btn" onclick="editEquipmentUnit(${index})" title="แก้ไข" style="color: #f39c12;">
                <i class="fas fa-edit"></i>
            </button>
            <button class="action-btn delete-btn" onclick="deleteEquipmentUnit(${index})" title="ลบ" style="color: #e74c3c;">
                <i class="fas fa-trash"></i>
            </button>
        </td></tr>`;
    });
    tableBody.innerHTML = html;
    initTableListeners(); // ผูกการคลิกเลือกแถว
}

/**
 * ==============================================================================
 * 📝 ส่วนที่ 5: การแก้ไขข้อมูล (Edit & Modal Logic)
 * ==============================================================================
 */

// เปิด Modal แก้ไข/เพิ่มข้อมูล
function openEditModal(rowIndex) {
    const isNew = rowIndex === -1;
    const item = isNew ? {} : fullDataStorage[rowIndex];
    const serialTitle = isNew ? 'รายการใหม่' : (item.newAssetCode || 'Unknown');

    let formHTML = '';
    // สร้างฟอร์มกรอกข้อมูลตามลำดับใน FIELD_DEFINITIONS
    for (const [key, def] of Object.entries(FIELD_DEFINITIONS)) {
        const value = item[key] || '';
        formHTML += `
            <div style="margin-bottom: 12px;">
                <label style="display: block; margin-bottom: 5px; font-weight: 600; font-size: 13px; color:#555;">${def.label}</label>
                <input type="text" id="field-${key}" value="${value}" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
            </div>
        `;
    }
    
    const existingModal = document.getElementById('editModal');
    if (existingModal) existingModal.remove();

    // โครงสร้าง HTML ของ Modal
    const modalHTML = `
        <div id="editModal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 10001; display: flex; align-items: center; justify-content: center;">
            <div style="background: white; width: 90%; max-width: 600px; max-height: 90vh; border-radius: 12px; display: flex; flex-direction: column; overflow: hidden;">
                <div style="padding: 15px 20px; background: #FFD101; display: flex; justify-content: space-between;">
                    <h3 style="margin: 0; font-size: 18px; color: #333;">${isNew ? '✨ เพิ่มรายการใหม่' : '🛠️ แก้ไข: ' + serialTitle}</h3>
                    <button onclick="document.getElementById('editModal').remove()" style="background: none; border: none; font-size: 24px; cursor: pointer;">&times;</button>
                </div>
                <div style="padding: 20px; overflow-y: auto;">${formHTML}</div>
                <div style="padding: 15px 20px; border-top: 1px solid #eee; text-align: right;">
                    <button onclick="saveEditedData(${rowIndex})" style="padding: 8px 20px; background: #FFD101; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; margin-left: 10px;">บันทึก</button>
                    <button onclick="document.getElementById('editModal').remove()" style="padding: 8px 20px; background: #eee; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">ยกเลิก</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// บันทึกข้อมูลที่แก้ไข และจัดการเรื่องการเปลี่ยนรหัส ID
function saveEditedData(rowIndex) {
    const isNew = rowIndex === -1;
    let item = isNew ? {} : fullDataStorage[rowIndex];
    
    // จำ ID เก่าไว้เพื่อย้ายรูปภาพหากรหัสถูกเปลี่ยน
    let oldRefId = null;
    if (!isNew) {
        oldRefId = (item.newAssetCode) ? `${item.newAssetCode}_${item.subAssetCode}` : `NO-ID-${rowIndex}`;
    }

    // อัปเดตข้อมูลจาก Input ลง Object
    for (const [key, def] of Object.entries(FIELD_DEFINITIONS)) {
        const input = document.getElementById(`field-${key}`);
        if (input) item[key] = input.value; 
    }

    // กำหนด ID ใหม่
    const newRefId = (item.newAssetCode) ? `${item.newAssetCode}_${item.subAssetCode}` : `NO-ID-${isNew ? fullDataStorage.length : rowIndex}`;

    // ย้ายรูปภาพหากรหัสเปลี่ยน
    if (oldRefId && newRefId && oldRefId !== newRefId) {
        if (imageStorage[oldRefId]) {
            imageStorage[newRefId] = imageStorage[oldRefId];
            delete imageStorage[oldRefId];
        }
    }

    if (isNew) fullDataStorage.push(item);

    document.getElementById('editModal').remove();
    renderTable(fullDataStorage); // วาดตารางใหม่
    updateActionButtons();
    alert('✅ บันทึกข้อมูลสำเร็จ');
}

// ลบรายการออกจากคลังชั่วคราว
function deleteEquipmentUnit(rowIndex) {
    if (confirm(`⚠️ ยืนยันการลบรายการแถวที่ ${rowIndex + 1} ?`)) {
        fullDataStorage.splice(rowIndex, 1);
        renderTable(fullDataStorage);
    }
}

// ทางลัดเรียก Modal แก้ไข
function editEquipmentUnit(rowIndex) {
    openEditModal(rowIndex);
}

/**
 * ==============================================================================
 * 📸 ส่วนที่ 6: การจัดการรูปภาพ (Image & Cloudinary)
 * ==============================================================================
 */

// เปิดการอัปโหลดรูปภาพสำหรับแถวนั้นๆ
// ✅ มาร์คจุดแก้ไข: ฟังก์ชัน openImageUploadForRow (ประมาณบรรทัดที่ 290)
function openImageUploadForRow(rowIndex) {  
    if (event) event.stopPropagation();
    const item = fullDataStorage[rowIndex]; 
    
    // 🎯 ใช้ฟังก์ชัน generateDocumentId (ที่คุณออฟฟี้ทำไว้แล้ว) เพื่อสร้าง ID ให้ตรงกัน
    const refId = generateDocumentId(item, rowIndex, currentType);
    
    currentUnitSerial = refId; 
    showUnitImages(refId);     // สั่งพรีวิวรูปที่มีอยู่ของ ID นี้
    openUnitCloudinaryWidget(); 
}

// เรียกใช้ Cloudinary Widget
function openUnitCloudinaryWidget() {
    if (!currentUnitSerial) return;
    if (typeof cloudinary === 'undefined') { alert('Cloudinary SDK missing'); return; }
    
    const folderPath = `${CLOUDINARY_CONFIG.folder}/${currentUnitSerial}`; 
    cloudinary.createUploadWidget({
        cloudName: CLOUDINARY_CONFIG.cloudName, 
        uploadPreset: CLOUDINARY_CONFIG.uploadPreset, 
        folder: folderPath,
        maxFiles: CLOUDINARY_CONFIG.maxFiles,
        sources: ['local', 'camera']
    }, (error, result) => {
        if (!error && result && result.event === 'success') {
            const newImage = { 
                id: 'cld_' + result.info.public_id, 
                url: result.info.secure_url, 
                name: result.info.original_filename + '.' + result.info.format, 
                date: new Date().toLocaleDateString('th-TH')
            };
            saveUploadedImage(currentUnitSerial, newImage); // บันทึกรูปเข้าระบบ
        }
    }).open();
}

// ✅ แทนที่ saveUploadedImage → บันทึกรูปลง MySQL ผ่าน PHP API
async function saveUploadedImage(id, newImage) {
    if (!imageStorage[id]) imageStorage[id] = [];
    imageStorage[id].push(newImage);
    showUnitImages(id);

    try {
        const res = await fetch(API_URL, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({
                action:  'save_image',
                station: currentStationID,
                type:    currentType,
                doc_id:  id,
                images:  imageStorage[id]
            })
        });
        const result = await res.json();
        if (!result.success) throw new Error(result.message);
        console.log(`✅ บันทึกรูปภาพของ ${id} ลง MySQL สำเร็จ`);
    } catch (error) {
        console.error("❌ เกิดข้อผิดพลาดในการบันทึกรูป:", error);
        alert("ไม่สามารถบันทึกรูปลงฐานข้อมูลได้");
    }
}

// แสดงรายการรูปภาพในแกลเลอรีใต้ตาราง
function showUnitImages(id) {
    currentUnitSerial = id;
    const container = document.getElementById('metadataGalleryContainer');
    const viewer = document.getElementById('currentUnitViewer');
    const title = document.getElementById('galleryTitle');
    if(title) title.textContent = `รูปภาพ (ID: ${id})`;
    
    const images = imageStorage[id] || [];
    
    if (images.length === 0) {
        if(viewer) viewer.innerHTML = '<div class="viewer-placeholder">No images</div>';
        if(container) container.innerHTML = '<div style="padding:10px; color:#999;">ไม่มีรูปภาพ</div>';
        return;
    }

    // วาดรูปย่อ (Thumbnails)
    if(container) {
        container.innerHTML = images.map((img, idx) => `
            <div class="gallery-metadata-item ${idx===0?'selected':''}" onclick="changeViewerImage('${img.url}', this)">
                <div style="overflow:hidden;">
                    <div style="font-weight:500;">${img.name}</div>
                    <small style="color:#999;">${img.date}</small>
                </div>
                <button class="delete-icon" onclick="deleteImage('${img.id}', '${id}', event)"><i class="fas fa-trash"></i></button>
            </div>
        `).join('');
    }
    
    // แสดงรูปใหญ่
    if(viewer && images.length > 0) {
        viewer.innerHTML = `<img src="${images[0].url}" style="max-height:100%; max-width:100%;" onclick="openLightbox('${images[0].url}')">`;
    }
}

// เปลี่ยนรูปภาพใน Viewer เมื่อคลิกรูปย่อ
function changeViewerImage(url, el) {
    const viewer = document.getElementById('currentUnitViewer');
    if(viewer) viewer.innerHTML = `<img src="${url}" style="max-height:100%; max-width:100%;" onclick="openLightbox('${url}')">`;
    document.querySelectorAll('.gallery-metadata-item').forEach(i => i.classList.remove('selected'));
    if(el) el.classList.add('selected');
}

// ลบรูปภาพออกจาก Storage
function deleteImage(imgId, refId, e) {
    e.stopPropagation();
    if (confirm('ลบรูปภาพนี้?')) {
        imageStorage[refId] = imageStorage[refId].filter(i => i.id !== imgId);
        showUnitImages(refId);
    }
}

// ขยายรูปภาพแบบ Lightbox
function openLightbox(url) {
    const box = `<div id="lightbox" style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);z-index:10001;display:flex;justify-content:center;align-items:center;cursor:pointer;" onclick="this.remove()">
        <img src="${url}" style="max-width:90%;max-height:90%;border-radius:5px;">
    </div>`;
    document.body.insertAdjacentHTML('beforeend', box);
}

/**
 * ==============================================================================
 * 🚀 ส่วนที่ 7: การเริ่มต้นระบบและการอัปโหลด (App Initiation & Firebase Upload)
 * ==============================================================================
 */

// ✅ แทนที่ uploadDataToDB (MySQL ผ่าน PHP API)
async function uploadDataToDB() {
    if (fullDataStorage.length === 0) { alert('❌ ไม่มีข้อมูลให้ Upload'); return; }

    const station      = currentStationID;
    const typeToUpload = currentType;

    // เตรียม items พร้อม doc_id และ images
    const items = fullDataStorage.map((item, idx) => {
        const docId = generateDocumentId(item, idx, currentType);
        return {
            ...item,
            doc_id: docId,
            images: imageStorage[docId] || []
        };
    });

    try {
        const res = await fetch(API_URL, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({
                action:  'upload',
                station: station,
                type:    typeToUpload,
                items:   items
            })
        });
        const result = await res.json();
        if (!result.success) throw new Error(result.message);

        alert(`✅ Upload เสร็จสิ้น (สำเร็จ: ${result.uploaded}, ล้มเหลว: ${result.failed})`);
        fetchDataFromDB(currentType); // ดึงข้อมูลใหม่มาแสดง

        const uploadBtn = document.getElementById('uploadDBBtn');
        if (uploadBtn) uploadBtn.style.display = 'none';
        const fileInput = document.getElementById('excelFileInput');
        if (fileInput) fileInput.value = '';

    } catch (err) {
        console.error('❌ uploadDataToDB error:', err);
        alert('❌ เกิดข้อผิดพลาด: ' + err.message);
    }
}

// ผูกเหตุการณ์การคลิกแถวในตาราง
function initTableListeners() {
    document.querySelectorAll('#eqTableBody tr').forEach(row => {
        row.onclick = (e) => {
            if (e.target.closest('.action-btn')) return; // ข้ามถ้ากดปุ่มจัดการ
            const refId = row.getAttribute('data-serial');
            document.querySelectorAll('tr').forEach(r => r.classList.remove('selected'));
            row.classList.add('selected'); // มาร์คแถวที่เลือก
            showUnitImages(refId); // แสดงรูป
        };
        row.ondblclick = (e) => { // ดับเบิลคลิกเพื่อแก้ไข
            if (e.target.closest('.action-btn')) return;
            openEditModal(row.getAttribute('data-row-index'));
        };
    });
}

// จัดการแถบด้านข้าง (Sidebar)
// ✅ มาร์คจุดแก้ไข #2: ปรับปรุงการจัดการ Sidebar
function initSidebar() {
    const toggle = document.getElementById('toggleSidebar');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const body = document.body;
    
    // 🔍 Debug: ตรวจสอบว่าเจอ element ทั้งหมดหรือไม่
    console.log('🔍 Sidebar Elements Check:', {
        toggle: !!toggle,
        sidebar: !!sidebar,
        overlay: !!overlay
    });
    
    if (!toggle || !sidebar) {
        console.error('❌ ไม่พบ Sidebar elements ใน HTML');
        return;
    }
    
    // เริ่มต้น sidebar ปิดทุกขนาดจอ
    sidebar.classList.add('collapsed');
    body.classList.add('sidebar-collapsed');
    
    // ✅ เมื่อคลิกปุ่ม toggle
    toggle.onclick = () => { 
        sidebar.classList.toggle('collapsed'); 
        const isCollapsed = sidebar.classList.contains('collapsed');

        if (window.innerWidth <= 768) {
            // mobile: slide over + overlay
            body.classList.toggle('sidebar-open', !isCollapsed);
            if (overlay) overlay.classList.toggle('active', !isCollapsed);
        } else {
            // desktop: push main-content
            body.classList.toggle('sidebar-collapsed', isCollapsed);
        }

        // 🎨 เปลี่ยนไอคอนปุ่ม
        const icon = toggle.querySelector('i');
        if (sidebar.classList.contains('collapsed')) {
            if (icon) icon.className = 'fas fa-bars';  // ไอคอนเมนู
        } else {
            if (icon) icon.className = 'fas fa-times';  // ไอคอนปิด
        }
        
        console.log('✅ Sidebar toggled:', !sidebar.classList.contains('collapsed') ? 'OPEN' : 'CLOSED');
    };
    
    // ✅ คลิก overlay เพื่อปิด sidebar (บนมือถือ)
    if (overlay) {
        overlay.onclick = () => {
            sidebar.classList.add('collapsed');
            body.classList.remove('sidebar-open');
            body.classList.add('sidebar-collapsed');
            overlay.classList.remove('active');
            const icon = toggle.querySelector('i');
            if (icon) icon.className = 'fas fa-bars';
        };
    }
}

// เปลี่ยนหมวดหมู่จากเมนู
function switchCategory(type) {
    const url = new URL(window.location.href);
    url.searchParams.set('type', type);
    window.history.pushState({}, '', url); 

    // ✅ แก้ไข: อัปเดตตัวแปร Global ให้จำหมวดใหม่ที่เลือก
    currentType = type; 
    
    const title = document.querySelector('#inventoryTitle');
    if (title) title.textContent = TYPE_MAP[type] || type;
    
    // ดึงข้อมูลใหม่มาโชว์
    fetchDataFromDB(type); 
}

// รวมฟังก์ชันเริ่มต้นระบบ
function initApp() {
    initSidebar();
    // โหลดข้อมูลจาก URL ครั้งแรก
    const typeKey = getQueryParams().type || 'air';
    const title = document.querySelector('#inventoryTitle');
    if (title) title.textContent = TYPE_MAP[typeKey] || typeKey;
    
    initExcelFunctionality();
    
    // สร้างปุ่ม "เพิ่มรายการ"
    const addExcelBtn = document.getElementById('addExcelBtn');
    if (addExcelBtn && !document.getElementById('addManualBtn')) {
        // ✅ สร้าง wrapper ให้ปุ่มทั้งสองอยู่ชิดกัน
        const btnGroup = document.createElement('div');
        btnGroup.style.cssText = 'display: flex; gap: 8px; align-items: center; margin-left: auto;';
        addExcelBtn.parentNode.insertBefore(btnGroup, addExcelBtn);
        btnGroup.appendChild(addExcelBtn);

        const mBtn = document.createElement('button');
        mBtn.id = 'addManualBtn';
        mBtn.className = 'action-btn-main'; 
        mBtn.innerHTML = '<i class="fas fa-plus-circle"></i> เพิ่มรายการ';
        mBtn.style.cssText = "background-color: #2ecc71; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer; font-weight: bold;";
        mBtn.onclick = () => openEditModal(-1);
        btnGroup.appendChild(mBtn);
    }
    
    ensureDefaultColumns();
    fetchDataFromDB(typeKey); // โหลดข้อมูลจาก DB ทันที
}

// ผูกปุ่มเมนู Excel
function initExcelFunctionality() {
    const fInput = document.getElementById('excelFileInput');
    const addBtn = document.getElementById('addExcelBtn');
    const upBtn = document.getElementById('uploadDBBtn');
    
    if (addBtn) addBtn.onclick = () => fInput && fInput.click();
    if (fInput) fInput.addEventListener('change', (e) => {
        if (e.target.files[0]) handleExcelFile(e.target.files[0]);
    });
    if (upBtn) upBtn.onclick = uploadDataToDB;
}

// ========================================
// 🚪 ฟังก์ชันออกจากระบบ (Logout)
// มาร์คจุด: ฟังก์ชันนี้จะทำงานเมื่อคลิกปุ่ม "ออกจากระบบ"
// ========================================
// ✅ แทนที่ firebase.auth().signOut() → เรียก api_logout.php (Session)
function handleLogout() {
    if (confirm("คุณต้องการออกจากระบบใช่หรือไม่?")) {
        fetch('api_logout.php', { method: 'POST' })
            .then(() => {
                console.log("Logout successful!");
                window.location.href = 'login.html';
            })
            .catch(err => {
                console.error("Logout Error:", err);
                window.location.href = 'login.html'; // logout อยู่ดี
            });
    }
}
// ฟังก์ชันสำหรับควบคุมการแสดงผลปุ่มต่างๆ ตามสถานะการล็อกอิน
function toggleEditUI(isLoggedIn) {
    // รายชื่อ Class หรือ ID ของปุ่มที่ต้องการควบคุม
    const adminElements = [
        '.add-btn', '.edit-btn', '.delete-btn', 
        '.upload-firebase-btn', '.add-btn-small',
        '#addExcelBtn', '#deleteAllBtn'
    ];

    adminElements.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
            // ถ้าล็อกอินให้แสดงปุ่ม (block) ถ้าไม่ได้ล็อกอินให้ซ่อนปุ่ม (none)
            el.style.display = isLoggedIn ? 'block' : 'none';
        });
    });
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


// รันโปรแกรมเมื่อโหลดหน้าเว็บเสร็จสมบูรณ์
window.addEventListener('DOMContentLoaded', initApp);

// =======================================================
// สิ้นสุดเนื้อหาในไฟล์ equipment-scripts.js
// =======================================================