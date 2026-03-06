# NT.Tech Login System - SQL Version

## 📋 สรุปการเปลี่ยนแปลง

### ✅ สิ่งที่เพิ่มเข้ามา
1. **ระบบฐานข้อมูล SQL** แทน Firebase
2. **ฟีเจอร์ Register** - สมัครสมาชิกใหม่
3. **ระบบสิทธิ์ผู้ใช้** (Admin/User)
4. **Session Management** - จัดการสถานะการ Login
5. **API RESTful** - เชื่อมต่อ Frontend กับ Backend

### ❌ สิ่งที่ยกเลิก
- Firebase ทั้งหมด (Auth, Firestore, Storage)
- Firebase Scripts ใน HTML
- firebase-config.js

### ✨ การออกแบบ
- **คงเดิม 100%** - โครงสร้าง HTML, CSS, และตำแหน่งองค์ประกอบทั้งหมด
- **เพิ่ม** - ปุ่ม "สมัครสมาชิก" ที่มีดีไซน์เข้ากับระบบเดิม

---

## 🗄️ โครงสร้างฐานข้อมูล

### ตาราง: `users`

```sql
+------------+--------------+-------------------------------+
| Field      | Type         | Description                   |
+------------+--------------+-------------------------------+
| id         | INT(11)      | Primary Key (Auto Increment)  |
| user       | VARCHAR(50)  | ชื่อผู้ใช้ (Unique)           |
| password   | VARCHAR(255) | รหัสผ่าน (เข้ารหัส bcrypt)    |
| depname    | VARCHAR(100) | ชื่อแผนก (lpn)                |
| depid      | VARCHAR(2)   | รหัสสิทธิ์ (01/02)            |
| created_at | TIMESTAMP    | วันที่สร้างบัญชี              |
| last_login | TIMESTAMP    | วันที่ Login ล่าสุด            |
+------------+--------------+-------------------------------+
```

### สิทธิ์การใช้งาน (depid)

| depid | บทบาท | สิทธิ์                                    |
|-------|-------|-------------------------------------------|
| 01    | Admin | เพิ่ม / ลบ / แก้ไข / ดูข้อมูลได้         |
| 02    | User  | ดูข้อมูลอย่างเดียว (เข้าถึงทุกหน้าได้)   |

---

## 🚀 วิธีติดตั้งและใช้งาน

### 1. เตรียมเซิร์ฟเวอร์
- ติดตั้ง **XAMPP**, **WAMP**, หรือ **MAMP**
- เปิด Apache และ MySQL

### 2. สร้างฐานข้อมูล
1. เปิด phpMyAdmin (http://localhost/phpmyadmin)
2. นำเข้าไฟล์ `database_setup.sql`
3. หรือรันคำสั่งใน SQL:
   ```sql
   source /path/to/database_setup.sql
   ```

### 3. ตั้งค่าการเชื่อมต่อ
แก้ไขไฟล์ `db_connect.php`:
```php
define('DB_HOST', 'localhost');      // ที่อยู่เซิร์ฟเวอร์
define('DB_USER', 'root');           // Username ฐานข้อมูล
define('DB_PASS', '');               // Password ฐานข้อมูล
define('DB_NAME', 'nt_tech_db');     // ชื่อฐานข้อมูล
```

### 4. วางไฟล์ในโฟลเดอร์เว็บ
คัดลอกไฟล์ทั้งหมดไปยัง:
- **XAMPP**: `C:\xampp\htdocs\nt-tech\`
- **WAMP**: `C:\wamp64\www\nt-tech\`
- **MAMP**: `/Applications/MAMP/htdocs/nt-tech/`

### 5. เปิดเว็บไซต์
เข้าที่: http://localhost/nt-tech/login.html

---

## 🔐 บัญชีทดสอบ

### Admin (สิทธิ์เต็ม)
- **Username**: `admin`
- **Password**: `admin123`
- **สิทธิ์**: เพิ่ม / ลบ / แก้ไข / ดู

### User (ดูอย่างเดียว)
- **Username**: `user01`
- **Password**: `user123`
- **สิทธิ์**: ดูข้อมูลอย่างเดียว

---

## 📁 โครงสร้างไฟล์

```
HTDOCS/
├── img/                         (โฟลเดอร์รูปภาพ - คงเดิม)
├── db_connect.php              ✨ เชื่อมต่อฐานข้อมูล
├── database_setup.sql          ✨ สคริปต์สร้างฐานข้อมูล
├── api_login.php               ✨ API Login
├── api_register.php            ✨ API Register
├── api_check_session.php       ✨ API ตรวจสอบ Session
├── api_logout.php              ✨ API Logout
├── login.html                  ✅ หน้า Login (แก้ไข)
├── login.css                   ✅ สไตล์ (เพิ่มปุ่ม Register)
├── login.js                    ✅ JavaScript Login (แก้ไข)
├── register.html               ✨ หน้า Register (ใหม่)
└── register.js                 ✨ JavaScript Register (ใหม่)
```

---

## 🔧 การใช้งาน API

### 1. Login (POST)
**Endpoint**: `api_login.php`

**Request Body**:
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response (Success)**:
```json
{
  "success": true,
  "message": "เข้าสู่ระบบสำเร็จ",
  "data": {
    "user_id": 1,
    "username": "admin",
    "depname": "ฝ่ายบริหาร",
    "depid": "01",
    "role": "admin",
    "permissions": {
      "can_create": true,
      "can_edit": true,
      "can_delete": true,
      "can_view": true
    }
  }
}
```

### 2. Register (POST)
**Endpoint**: `api_register.php`

**Request Body**:
```json
{
  "username": "newuser",
  "password": "password123",
  "depname": "ฝ่ายไอที",
  "depid": "02"
}
```

**Response (Success)**:
```json
{
  "success": true,
  "message": "ลงทะเบียนสำเร็จ",
  "data": {
    "user_id": 3,
    "username": "newuser",
    "depname": "ฝ่ายไอที",
    "depid": "02",
    "role": "user"
  }
}
```

### 3. Check Session (GET)
**Endpoint**: `api_check_session.php`

**Response (Logged In)**:
```json
{
  "success": true,
  "logged_in": true,
  "data": {
    "user_id": 1,
    "username": "admin",
    "depname": "ฝ่ายบริหาร",
    "depid": "01",
    "role": "admin"
  }
}
```

### 4. Logout (POST)
**Endpoint**: `api_logout.php`

**Response**:
```json
{
  "success": true,
  "message": "ออกจากระบบสำเร็จ"
}
```

---

## 🛡️ ความปลอดภัย

### ฟีเจอร์ความปลอดภัยที่มีอยู่:

1. **รหัสผ่านเข้ารหัส**
   - ใช้ `password_hash()` ด้วย bcrypt algorithm
   - ไม่สามารถถอดรหัสกลับได้

2. **ป้องกัน SQL Injection**
   - ใช้ Prepared Statements
   - ฟังก์ชัน `clean_input()` สำหรับทำความสะอาดข้อมูล

3. **Session Management**
   - ใช้ PHP Session สำหรับจัดการสถานะ Login
   - ตรวจสอบสิทธิ์ในทุก Request

4. **Validation**
   - ตรวจสอบข้อมูลทั้ง Frontend และ Backend
   - จำกัดความยาว Username และ Password

---

## 📊 การทดสอบ

### ขั้นตอนการทดสอบ:

1. **ทดสอบ Register**
   - เปิดหน้า `register.html`
   - กรอกข้อมูลและสมัครสมาชิก
   - ตรวจสอบว่าข้อมูลถูกบันทึกในฐานข้อมูล

2. **ทดสอบ Login**
   - เปิดหน้า `login.html`
   - Login ด้วยบัญชีที่สร้าง
   - ตรวจสอบว่าเข้าสู่ระบบสำเร็จ

3. **ทดสอบ Session**
   - Login เข้าระบบ
   - รีเฟรชหน้า
   - ตรวจสอบว่ายังคง Login อยู่

4. **ทดสอบ Logout**
   - Login เข้าระบบ
   - เรียก `api_logout.php`
   - ตรวจสอบว่าถูก Logout

---

## 🐛 แก้ไขปัญหา

### ปัญหาที่พบบ่อย:

1. **ไม่สามารถเชื่อมต่อฐานข้อมูล**
   - ตรวจสอบว่า MySQL เปิดอยู่
   - ตรวจสอบ Username/Password ใน `db_connect.php`
   - ตรวจสอบว่าฐานข้อมูล `nt_tech_db` มีอยู่

2. **หน้าเว็บแสดง Error**
   - เปิด Developer Tools (F12)
   - ดู Console สำหรับ Error
   - ตรวจสอบ Network Tab สำหรับ API Response

3. **Login ไม่ได้**
   - ตรวจสอบว่า API มี Error หรือไม่
   - ตรวจสอบ Username/Password ถูกต้อง
   - ดู PHP Error Log

4. **Session หาย**
   - ตรวจสอบว่า `session_start()` ถูกเรียกใน API ทุกตัว
   - ตรวจสอบ Cookie Settings ในเบราว์เซอร์

---

## 📞 สรุปฟังก์ชันที่เพิ่มเข้ามา

### Backend (PHP):
1. **db_connect.php** - เชื่อมต่อฐานข้อมูล MySQL
2. **api_login.php** - ตรวจสอบ Login และสร้าง Session
3. **api_register.php** - ลงทะเบียนผู้ใช้ใหม่
4. **api_check_session.php** - ตรวจสอบสถานะ Login
5. **api_logout.php** - ออกจากระบบ
6. **clean_input()** - ป้องกัน SQL Injection

### Frontend (JavaScript):
1. **checkLoginStatus()** - ตรวจสอบว่า Login อยู่หรือไม่
2. **handleLogin()** - ส่งข้อมูล Login ไป API
3. **handleRegister()** - ส่งข้อมูล Register ไป API
4. **validateForm()** - ตรวจสอบความถูกต้องของข้อมูล
5. **goToRegister()** - เปิดหน้าสมัครสมาชิก
6. **goBackToLogin()** - กลับไปหน้า Login

### Database:
1. **ตาราง users** - เก็บข้อมูลผู้ใช้
2. **Password Hashing** - เข้ารหัสรหัสผ่าน
3. **Unique Username** - ป้องกัน Username ซ้ำ
4. **Role-Based Access** - ระบบสิทธิ์ Admin/User

---

## 📝 หมายเหตุ

- โครงสร้างและการออกแบบคงเดิม 100%
- เพิ่มเฉพาะปุ่ม Register และฟีเจอร์ที่จำเป็น
- รหัสผ่านเข้ารหัสด้วย bcrypt (ปลอดภัยสูง)
- รองรับภาษาไทยด้วย UTF-8
- Session หมดอายุเมื่อปิดเบราว์เซอร์

---

## ✅ Checklist การติดตั้ง

- [ ] ติดตั้ง XAMPP/WAMP/MAMP
- [ ] เปิด Apache และ MySQL
- [ ] สร้างฐานข้อมูลจาก `database_setup.sql`
- [ ] ตั้งค่าการเชื่อมต่อใน `db_connect.php`
- [ ] วางไฟล์ใน htdocs
- [ ] ทดสอบการ Register
- [ ] ทดสอบการ Login
- [ ] ทดสอบการ Logout

---

**พัฒนาโดย**: Thanika Charoensuk 
**วันที่**: 2026  
**เวอร์ชัน**: 2.0 (SQL-based)