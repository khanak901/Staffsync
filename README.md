# StaffSync — Modern Human Resource Management Solution

StaffSync is an enterprise-grade, comprehensive web-based application built using the **MERN Stack** (MongoDB, Express.js, React.js, and Node.js) that streamlines and automates core human resource processes within modern organizations.

The system enforces granular Role-Based Access Control (RBAC) across **HR personnel**, **Managers**, and **Employees**, ensuring security, transparency, and high productivity.

---

## 🌟 Key Modules & Role Matrix

| Capability | Employee | Manager | HR Admin |
| :--- | :---: | :---: | :---: |
| **Authentication & Profile Management** | ✅ | ✅ | ✅ |
| **Digital Punch Clock (Clock-In / Clock-Out)** | ✅ | ✅ | ✅ |
| **Work Location Selector (Office / Remote / Client)** | ✅ | ✅ | ✅ |
| **Apply for Leave & Balance Tracking** | ✅ | ✅ | ✅ |
| **Review & Approve/Reject Team Leaves** | ❌ | ✅ | ✅ |
| **Employee Directory & Profile CRUD** | ❌ | View Only | Full CRUD |
| **Company-wide Attendance Monitoring** | ❌ | Team Only | ✅ Full Org |
| **Post Company & Department Announcements** | ❌ | ✅ | ✅ |
| **Schedule Training & Professional Programs** | ❌ | ✅ | ✅ |
| **Enroll in Training & Progress Slider** | ✅ | ✅ | ✅ |
| **Executive Analytics & Headcount Reports** | ❌ | View Only | ✅ Full Access |

---

## 🚀 Pre-Seeded One-Click Demo Credentials

All test accounts are pre-loaded with realistic attendance history, leave balances, pending approval requests, announcements, and training programs:

| Role | Name | Email | Password | Employee ID |
| :--- | :--- | :--- | :--- | :--- |
| **HR Admin** | Sarah Connor | `hr@staffsync.io` | `password123` | `EMP-HR-001` |
| **Manager** | Michael Scott | `manager@staffsync.io` | `password123` | `EMP-MGR-002` |
| **Employee** | Alex Morgan | `employee@staffsync.io` | `password123` | `EMP-DEV-003` |

> 💡 **Instant Persona Switcher:** When testing, you can also use the **"Demo Switcher"** button in the top navigation bar to switch between Sarah (HR), Michael (Manager), and Alex (Employee) with a single click without logging out!

---

## 🛠️ Technology Stack

- **Frontend:**
  - React.js (Vite)
  - Redux Toolkit (`@reduxjs/toolkit` & `react-redux`)
  - React Router v6
  - Bootstrap 5.3 & Lucide Icons
  - Axios with JWT Interceptors
- **Backend:**
  - Node.js & Express.js
  - Mongoose & MongoDB (with automatic local embedded data persistence fallback for 100% plug-and-play reliability)
  - JSON Web Tokens (JWT)
  - bcryptjs Password Hashing
  - CORS & Dotenv

---

## 📁 Database Collections & Models

1. **Users:** Authentication credentials, hashed password, role (`employee`, `manager`, `hr`), employee ID link, avatar.
2. **Employees:** First name, last name, email, department, designation, salary, joining date, reporting manager, address, emergency contact, leave balances, skills.
3. **Managers:** Department scope, direct reports list, departmental budget.
4. **Attendance:** Employee ID, date, checkIn, checkOut, total hours, status (`Present`, `Late`, `Half-day`, `Absent`, `On-Leave`), work location (`Office`, `Remote`, `Client-Site`), notes.
5. **Leaves:** Employee ID, leave type (`Sick`, `Casual`, `Annual`, `Maternity/Paternity`, `Unpaid`), date range, total working days, reason, status (`Pending`, `Approved`, `Rejected`), reviewer comments.
6. **Announcements:** Title, content, priority (`Low`, `Medium`, `High`, `Urgent`), target audience (`All` or Department), posted by, category, pinned state.
7. **Trainings:** Course title, description, instructor, department, dates, duration, capacity, enrolled employees with live progress percentage.
8. **Notifications:** Recipient ID, title, message, category, read status, link.

---

## ⚡ Quick Start Instructions

### Running the Full Application (Port 5000)
From the project root directory:
```bash
# Starts backend and serves the bundled React frontend on port 5000
npm start
```
Now open [http://localhost:5000](http://localhost:5000) in your browser.

### Running in Development Mode with Hot Reload
In terminal 1 (Backend API):
```bash
cd backend
npm start
```
In terminal 2 (Vite Frontend with hot reload):
```bash
cd frontend
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

---

## 📡 REST API Reference

### Authentication
- `POST /api/auth/login` - User authentication & JWT issuance
- `POST /api/auth/register` - Create user and employee profile
- `GET /api/auth/me` - Current session and profile data
- `PUT /api/auth/profile` - Update phone, address, emergency contacts, skills

### Employees
- `GET /api/employees` - Search & filter employee directory
- `GET /api/employees/:id` - Detailed employee profile
- `POST /api/employees` - HR onboard new employee
- `PUT /api/employees/:id` - Update employee compensation/records
- `DELETE /api/employees/:id` - Deactivate/remove employee
- `GET /api/employees/team/me` - Manager's direct reports

### Attendance
- `GET /api/attendance/today` - Today's check-in status for user
- `POST /api/attendance/clock-in` - Record check-in timestamp & location
- `POST /api/attendance/clock-out` - Record check-out & compute total hours
- `GET /api/attendance/my` - Employee's own attendance log
- `GET /api/attendance` - Company/team attendance board (HR & Manager)
- `POST /api/attendance/manual` - HR manual attendance entry

### Leaves
- `POST /api/leaves/apply` - Employee applies for leave
- `GET /api/leaves/my` - Employee's leave applications & balances
- `GET /api/leaves` - Organization leave queue (HR & Manager)
- `PUT /api/leaves/:id/review` - Approve or reject leave with comments

### Announcements
- `GET /api/announcements` - Organization announcements feed
- `POST /api/announcements` - Publish announcement (HR & Manager)
- `DELETE /api/announcements/:id` - Remove announcement (HR)

### Trainings
- `GET /api/trainings` - Catalog of training programs
- `POST /api/trainings` - Create training program (HR & Manager)
- `POST /api/trainings/:id/enroll` - Enroll in program
- `PUT /api/trainings/:id/progress` - Update completion progress (0-100%)

### Analytics
- `GET /api/analytics/dashboard` - Real-time HR KPIs, headcount, attendance rate, leave distribution, and payroll stats
