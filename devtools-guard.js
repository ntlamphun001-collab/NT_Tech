/**
 * ============================================
 * ไฟล์: devtools-guard.js
 * หน้าที่:
 *   1. ปิด DevTools เฉพาะ User (Admin เปิดได้)
 *   2. ซ่อนเฉพาะปุ่ม เพิ่ม/ลบ/แก้ไข/บันทึก เฉพาะ User
 *      — ไม่ซ่อน tr/td/แถวข้อมูลในตาราง
 * ============================================
 */

(function () {

    function getRole() {
        try {
            const userData = JSON.parse(localStorage.getItem('userData'));
            return userData ? userData.role : null;
        } catch (e) { return null; }
    }

    const isAdmin = getRole() === 'admin';

    // ===============================
    // 🔒 1. ปิด DevTools เฉพาะ User
    // ===============================
    if (!isAdmin) {
        document.addEventListener('contextmenu', function (e) { e.preventDefault(); });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'F12') { e.preventDefault(); return false; }
            if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) {
                e.preventDefault(); return false;
            }
            if (e.ctrlKey && (e.key === 'u' || e.key === 's')) {
                e.preventDefault(); return false;
            }
        });

        // ตรวจจับ DevTools — แสดง overlay แทนการลบหน้า
        var devtoolsOpen = false;
        setInterval(function () {
            var widthOpen  = window.outerWidth  - window.innerWidth  > 400;
            var heightOpen = window.outerHeight - window.innerHeight > 200;

            if (widthOpen && heightOpen) {
                if (!devtoolsOpen) {
                    devtoolsOpen = true;
                    if (!document.getElementById('devtools-overlay')) {
                        var ov = document.createElement('div');
                        ov.id = 'devtools-overlay';
                        ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.92);z-index:999999;display:flex;justify-content:center;align-items:center;font-family:Prompt,sans-serif;font-size:22px;color:#fff;text-align:center;flex-direction:column;gap:12px;';
                        ov.innerHTML = '<div>⛔</div><div>ไม่อนุญาตให้เข้าถึง Developer Tools</div><div style="font-size:14px;color:#aaa;">กรุณาปิด DevTools แล้วรีเฟรชหน้า</div>';
                        document.body.appendChild(ov);
                    }
                }
            } else {
                if (devtoolsOpen) {
                    devtoolsOpen = false;
                    var ov = document.getElementById('devtools-overlay');
                    if (ov) ov.remove();
                }
            }
        }, 1000);
    }

    // ===============================
    // 🔒 2. ซ่อนปุ่ม เพิ่ม/ลบ/แก้ไข เฉพาะ User
    //    ✅ ไม่แตะ tr, td, div ที่มี onclick (ข้อมูลตาราง)
    // ===============================
    if (!isAdmin) {

        // --- CSS: ซ่อนด้วย class/id ที่แน่ชัด ---
        var style = document.createElement('style');
        style.textContent = `
            /* ปุ่มจาก class ที่ชัดเจน */
            .edit-btn, .delete-btn, .add-btn, .add-btn-small,
            .btn-edit, .btn-delete, .btn-add, .btn-import, .btn-save,
            .import-btn, .save-btn, .upload-btn,
            #addBtn, #editBtn, #deleteBtn, #importBtn, #saveBtn,
            #uploadDBBtn, #addExcelBtn, #deleteAllBtn, #addManualBtn,
            input[type="file"] {
                display: none !important;
                pointer-events: none !important;
            }
        `;
        document.head.appendChild(style);

        // คำที่บ่งชี้ว่าเป็นปุ่มแก้ไข (เช็คเฉพาะ button และ a.btn)
        var editKeywords = [
            'เพิ่ม', 'แก้ไข', 'ลบทั้งหมด', 'บันทึกการแก้ไข', 'บันทึกข้อมูล',
            'อัปโหลด', 'อัพโหลด', 'ลงฐานข้อมูล', 'Upload ลงฐาน',
            '+ Import Excel', '+ Add', 'เพิ่มรายการ'
        ];

        var editIcons = [
            'fa-edit', 'fa-trash', 'fa-trash-alt', 'fa-save',
            'fa-file-import', 'fa-upload', 'fa-cloud-upload-alt',
            'fa-pen', 'fa-pencil-alt', 'fa-plus-circle'
        ];

        // ✅ ซ่อนเฉพาะ element ที่เป็น button หรือ input[type=button/submit]
        // ไม่แตะ tr, td, div, span ที่มี onclick (เพราะนั่นคือแถวข้อมูล)
        function hideEl(el) {
            el.style.setProperty('display', 'none', 'important');
            el.style.setProperty('pointer-events', 'none', 'important');
            if (el.disabled !== undefined) el.disabled = true;
        }

        function isActionButton(el) {
            var tag = el.tagName;
            // ✅ ตรวจเฉพาะ button และ a ที่มี class btn เท่านั้น
            // ไม่ตรวจ div, tr, td, span
            if (tag !== 'BUTTON' && !(tag === 'A' && el.classList.contains('btn'))) return false;

            var text    = (el.innerText || el.textContent || el.value || '').trim();
            var cls     = (el.className || '').toString().toLowerCase();
            var id      = (el.id || '').toLowerCase();
            var onclick = (el.getAttribute('onclick') || '');

            // เช็คจาก class/id ที่ชัดเจน
            var editClasses = ['edit', 'delete', 'add-btn', 'import', 'upload', 'save-btn'];
            if (editClasses.some(k => cls.includes(k) || id.includes(k))) return true;

            // เช็คจากข้อความในปุ่ม
            if (editKeywords.some(k => text.includes(k))) return true;

            // เช็คจาก icon ข้างใน (ปุ่มที่มี icon แก้ไข/ลบ)
            if (editIcons.some(ic => el.querySelector && el.querySelector('.' + ic))) return true;

            // เช็ค onclick เฉพาะ function ที่เป็นการแก้ไขชัดๆ
            var editFuncs = [
                'editAllInfo(', 'editAddress(', 'editCoordinate(',
                'openImageGalleryModal(', 'openCloudinaryWidget(',
                'deleteAddress(', 'deleteCoordinate(', 'deleteImage(',
                'deleteEquipmentUnit(', 'editEquipmentUnit(', 'openImageUploadForRow(',
                'uploadDataToDB(', 'openEditModal('
            ];
            if (editFuncs.some(f => onclick.includes(f))) return true;

            return false;
        }

        function hideEditButtons(container) {
            // ✅ ตรวจเฉพาะ button และ a.btn — ไม่แตะ tr/td/div
            container.querySelectorAll('button, a.btn, input[type="button"], input[type="submit"], input[type="file"]').forEach(function (el) {
                if (isActionButton(el)) hideEl(el);
            });
        }

        // รันเมื่อ DOM พร้อม
        function runOnReady() {
            hideEditButtons(document);
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', runOnReady);
        } else {
            runOnReady();
        }

        // MutationObserver — จับปุ่มที่สร้างทีหลังผ่าน JS
        var observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                mutation.addedNodes.forEach(function (node) {
                    if (node.nodeType !== 1) return;
                    var tag = node.tagName;
                    // ✅ ตรวจเฉพาะ button/input/a ที่เพิ่มเข้ามา
                    if (tag === 'BUTTON' || tag === 'INPUT' || tag === 'A') {
                        if (isActionButton(node)) hideEl(node);
                    }
                    // และหา button ลูกใน element ที่เพิ่มเข้ามา (เช่น modal, row)
                    hideEditButtons(node);
                });
            });
        });

        if (document.body) {
            observer.observe(document.body, { childList: true, subtree: true });
        } else {
            document.addEventListener('DOMContentLoaded', function () {
                observer.observe(document.body, { childList: true, subtree: true });
            });
        }

        console.log('🔒 User mode: Read-only (ตารางข้อมูลแสดงปกติ, ปุ่มแก้ไขถูกซ่อน)');
    }

})();