# 🏛️ MITS Event Management System (EMS)

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16.1.4-black?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19.2.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-5.2-000000?style=for-the-badge&logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma_ORM-7.3.0-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

**Comprehensive Technical Architecture, Institutional Workflows & Engineering Documentation**  
*Engineered for the Office of Dean Student Welfare (DSW), Madhav Institute of Technology & Science (MITS), Gwalior.*

[Features](#-key-features--capabilities) • [Architecture](#-functional-architecture--page-routes) • [RBAC](#-role-based-access-control-rbac) • [API Docs](#-rest-api-reference) • [Database](#-database-schema--erd) • [Setup](#-local-installation--setup) • [Demo Accounts](#-quick-access-demo-credentials)

</div>

---

## 📌 Executive Summary

The **MITS Event Management System (EMS)** is an enterprise-grade university governance and student activity automation platform. Prior to this platform, campus clubs, technical chapters, and departmental cells operated across fragmented physical paperwork, paper-based venue booking registers, manual sanction signatures, and disconnected bill settlement slips.

This platform unifies all campus activities into a single verifiable system:
- **Digital Event Blueprints**: Standardized multi-day event proposals, dignitary rosters, and equipment requisitioning with institutional letterhead generation.
- **Auditorium Clash Prevention**: Live time-slot validation preventing double-booking across campus auditoriums and seminar halls.
- **Tiered Administrative Sanctions**: Strict multi-level approval pipeline traversing **Club Coordinators & Faculty Advisors → Department HODs → Dean Student Welfare (DSW)**.
- **Accreditation Evidence Archives**: Tamper-proof activity dossiers with Google Drive links for attendance logs, geotagged photographs, winner awards, and audited invoices for **NAAC** and **NIRF** audits.
- **Distinct Visual Identity**: Built on a tactile **Neo-Brutalist "Cartoonish & Professional"** design system featuring solid `#0f172a` borders, hard offset shadows, vibrant pastel sticker badges, and micro-animations.

---

## ✨ Key Features & Capabilities

- 🔐 **Multi-Role Authentication**: JWT-based sessions with RBAC for 6 user tiers (`ADMIN`, `DSW`, `HOD`, `FACULTY`, `CLUB_COORDINATOR`, `STUDENT`) plus Google OAuth 2.0 integration.
- ⚡ **1-Click Demo Evaluation Switcher**: Instant role autofill on the login screen for rapid testing without manual credential lookups.
- 📅 **Multi-Day Scheduling Engine**: Dynamic duration selectors (1 to 7 days) with per-day venue allocation and overlap checking.
- 🛡️ **Role-Aware Student Shielding**: Unapproved or pending proposals are completely shielded from general students until final administrative sanction.
- 📊 **Executive Analytics Hub**: Real-time KPI counters, SDG distribution graphs, student turnout metrics, and expenditure breakdowns.
- 🏛️ **Institutional Letterhead Output**: Formal proposal dossiers formatted with official MITS headers for academic records.
- 📑 **NAAC & NIRF Compliant Archives**: Post-event documentation system capturing attendees, winners, expenditures, and cloud-stored receipts.
- 🔔 **In-App Notification Feed**: Live status alerts keeping coordinators, faculty, and administrators synced on proposal changes.

---

## 🖥️ Functional Architecture & Page Routes

### 1. Public Landing Portal (`/`)
- Public showcase displaying active campus councils, upcoming flagship events, and institute-wide statistics.
- Direct quick-links to login, registration, and student event calendars.

### 2. Authentication & 1-Click Demo Desk (`/login` & `/register`)
- Dual-mode sign in (JWT credentials & Google OAuth).
- Dedicated **1-Click Demo Switcher** panel allowing evaluators to jump between DSW, HOD, Faculty, Coordinator, and Student roles in one tap.

### 3. Operational Command Dashboard (`/dashboard`)
- Customized intelligence command center showing role-specific KPIs (Active Events, Venues Booked, Pending Sanctions).
- Fast action buttons for proposing events, auditing submissions, and previewing reservations.

### 4. Campus Events & Proposals Hub (`/dashboard/events`)
- Searchable and categorized directory of campus initiatives.
- Enrolled students only see officially approved events; coordinators and faculty see their club's submissions; administrators track all institutional proposals.

### 5. Multi-Day Event Proposal Desk (`/dashboard/events/create`)
- Guarded creation form for coordinators and faculty (restricted for students and DSW).
- Dynamic 1–7 day duration selector with venue clash validation, guest speaker rosters, budget estimation, and SDG tagging.

### 6. Administrative Approvals Desk (`/dashboard/approvals` & `/dashboard/events/[id]`)
- Multi-tier visual tracker showing: **Submission ➔ HOD Endorsement ➔ DSW Final Sanction**.
- Interactive sanction modal for HODs and DSW with audit remarks and timestamps.

### 7. Post-Event Activity Reports & Accreditation Archive (`/dashboard/reports`)
- Permanent evidence archive recording attendee turnout, competition winners, expenditures, and verified Google Drive links.

### 8. Student Clubs & Councils Directory (`/dashboard/clubs`)
- Technical chapters (ACM, IEEE, GDSC) and cultural societies directory with coordinator rosters and historical event archives.

### 9. Auditorium & Venue Scheduling Matrix (`/dashboard/venues`)
- Live venue grid with capacities, sound/projection amenities, and real-time conflict detection.

### 10. Academic Departments Hub (`/dashboard/departments`)
- Departmental registry mapping departments (CSE, IT, EE, ME, etc.) to appointed HODs and facilities.

### 11. Institutional Analytics & Reports (`/dashboard/analytics`)
- High-level charts (via Recharts) displaying event category distributions, monthly turnout, and budget metrics.

### 12. User & Access Governance (`/dashboard/users`)
- Administrative control panel to create users, assign roles, and delegate club coordinators.

---

## 👥 Role-Based Access Control (RBAC)

| Capability / Action | SUPER_ADMIN | DSW (Dean) | HOD | FACULTY (Advisor) | CLUB_COORDINATOR | STUDENT |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Browse Approved Events** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **View Schedules & Venues** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Draft & Propose Events** | ✅ | ❌ *(Approver)* | ✅ *(Dept)* | ✅ *(Assigned Club)* | ✅ *(Assigned Club)* | ❌ *(Denied)* |
| **View Multi-Tier Approvals Tracker** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ *(Hidden)* |
| **View Audit Remarks & Rejections** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ *(Hidden)* |
| **Stage 2 Approval (HOD Endorsement)** | ✅ | ❌ | ✅ *(Own Dept)* | ❌ | ❌ | ❌ |
| **Stage 3 Approval (DSW Sanction)** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Submit Activity Reports** | ✅ | ❌ *(Auditor)* | ❌ | ✅ *(Advisor)* | ✅ *(Host Club)* | ❌ *(Denied)* |
| **Inspect Financial Bills & Receipts** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ *(Hidden)* |
| **Manage Clubs & Assign Coordinators** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Add / Edit Campus Auditoriums** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Manage Departments & Assign HODs** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **User Role Assignment** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## 🔄 End-to-End Operational Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor Coord as Club Coordinator / Faculty
    actor HOD as Department HOD
    actor DSW as Dean Student Welfare (DSW)
    actor Student as Enrolled Student
    participant System as MITS EMS Platform
    participant DB as PostgreSQL Database

    Note over Coord,System: Phase 1: Proposal & Scheduling
    Coord->>System: Draft Proposal (Title, SDGs, Schedules, Dignitaries, Equipment)
    System->>DB: Check Venue Availability & Insert Event (Status: PENDING_HOD_APPROVAL)
    
    Note over HOD,System: Phase 2: Department Endorsement
    HOD->>System: Open Approvals Desk & Inspect Proposed Schedule
    alt HOD Endorses Event
        HOD->>System: Sanction & Forward to DSW with Audit Remarks
        System->>DB: Update Status -> PENDING_DSW_APPROVAL
    else HOD Rejects
        HOD->>System: Reject with Explanation
        System->>DB: Update Status -> REJECTED
    end

    Note over DSW,System: Phase 3: Final Institutional Sanction
    DSW->>System: Review Dossier at Apex Approval Desk
    DSW->>System: Issue Final Sanction Clearance
    System->>DB: Update Status -> APPROVED
    
    Note over Student,System: Phase 4: Public Visibility
    System-->>Student: Event Appears in Campus Calendar & Club Profile
    
    Note over Coord,System: Phase 5: Post-Event Activity Report
    Coord->>System: Submit Report (Headcount, Winners, Drive Photos, Bills)
    System->>DB: Store Activity Report linked to Event Record
    DSW->>System: Audit Activity Report & Scanned Vouchers for NAAC Archive
```

---

## ⚙️ Technology Stack Breakdown

| Layer | Technologies Used | Key Responsibilities |
| :--- | :--- | :--- |
| **Frontend Framework** | **Next.js 16.1.4** (App Router, Turbopack) | Server & Client Components, dynamic code-splitting, layout hierarchies. |
| **UI Library** | **React 19.2.3** | Component state, hooks, concurrent rendering. |
| **Styling & Theme** | **Tailwind CSS v4** + Neo-Brutalism | `2.5px solid #0f172a` borders, `4px 4px 0px #0f172a` offset shadows, comic dots, dark mode. |
| **Animations & Charts**| **Framer Motion 12** + **Recharts 3** | Fluid micro-interactions, responsive institutional analytics charts. |
| **Icons & Feedback** | **Lucide React** + **React Hot Toast** | Crisp UI iconography, non-blocking toast notifications. |
| **Backend Runtime** | **Node.js 20+** + **Express.js 5.2** | REST API gateway, JWT auth middleware, RBAC enforcement. |
| **Database ORM** | **Prisma ORM 7.3.0** (`@prisma/client`) | Type-safe SQL client, schema migrations, relational joins, upsert seeding. |
| **Database Engine** | **PostgreSQL 18** | Relational data persistence, foreign key cascades, ACID transactions. |
| **Authentication** | **JWT** + **Bcrypt.js** + **Google OAuth** | Stateless Bearer tokens, role claims, 10-round salted password hashing. |

---

## 🗄️ Database Schema & ERD

```mermaid
erDiagram
    DEPARTMENT ||--o| USER : "headed_by_hod"
    DEPARTMENT ||--o{ CLUB : "hosts_clubs"
    DEPARTMENT ||--o{ VENUE : "owns_venues"
    DEPARTMENT ||--o{ EVENT : "departmental_events"
    DEPARTMENT ||--o{ USER : "faculty_members"

    USER ||--o{ CLUB : "advises_club"
    USER ||--o{ EVENT : "coordinates_event"
    USER ||--o{ APPROVAL : "signs_off_approval"
    CLUB ||--o{ USER : "club_coordinators"
    CLUB ||--o{ EVENT : "hosts_events"
    CLUB }o--o{ EVENT : "collaborates_on"

    EVENT ||--o{ EVENTSCHEDULE : "scheduled_at"
    VENUE ||--o{ EVENTSCHEDULE : "hosts_slot"
    EVENT ||--o{ APPROVAL : "audit_history"
    EVENT ||--o| REPORT : "activity_report"
    REPORT ||--o{ WINNER : "awards_winners"

    USER {
        Int id PK
        String email UK
        String password
        String name
        Role role "ADMIN, DSW, HOD, FACULTY, CLUB_COORDINATOR, STUDENT"
    }

    DEPARTMENT {
        Int id PK
        String name UK
        String code UK
        Int hodId FK
    }

    CLUB {
        Int id PK
        String name UK
        String description
        Int facultyAdvisorId FK
        Int departmentId FK
        ClubStatus status "PENDING, ACTIVE, INACTIVE"
    }

    VENUE {
        Int id PK
        String name UK
        Int capacity
        String facilities
        Boolean isDepartmentRestricted
        Int departmentId FK
    }

    EVENT {
        Int id PK
        String title
        String description
        DateTime startDateTime
        DateTime endDateTime
        Int durationDays
        EventStatus status "PENDING, PENDING_HOD_APPROVAL, PENDING_DSW_APPROVAL, APPROVED, REJECTED, COMPLETED, CANCELLED"
        Int clubId FK
        Int departmentId FK
        Int coordinatorId FK
        Float estimatedCost
    }

    EVENTSCHEDULE {
        Int id PK
        Int eventId FK
        Int venueId FK
        Int dayNumber
        DateTime startTime
        DateTime endTime
    }

    APPROVAL {
        Int id PK
        Int eventId FK
        Int approvedById FK
        Role roleAtApproval
        ApprovalStatus status "APPROVED, REJECTED"
        String remarks
        DateTime date
    }

    REPORT {
        Int id PK
        Int eventId FK
        String overview
        String objective
        Int numberOfAttendees
        Int numberOfParticipants
        Float totalExpenditure
        String photoLink
        String posterLink
        String attendanceSheetLink
        String certificateLink
    }

    WINNER {
        Int id PK
        Int reportId FK
        String name
        Int position
        WinnerType type "INDIVIDUAL, TEAM"
    }
```

---

## 📡 REST API Reference

The backend runs on `http://localhost:5000` by default.

### 1. Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Public | Authenticate with email & password; returns JWT token and user profile. |
| `POST` | `/api/auth/register` | Public | Create new student or coordinator account. |
| `POST` | `/api/auth/google` | Public | Google OAuth 2.0 authentication token exchange. |

### 2. Events & Proposals (`/api/events`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/events` | All *(Filtered)* | List events with filters (`upcoming`, `past`). Unapproved events hidden for students. |
| `GET` | `/api/events/:id` | All *(Filtered)* | Retrieve single event dossier with schedule and guest lists. Guarded for students. |
| `POST` | `/api/events` | Coord, Faculty, HOD, Admin | Submit new multi-day event proposal. Blocked for Students and DSW. |
| `PUT` | `/api/events/:id/status` | HOD, DSW, Admin | Update approval status (`APPROVED` / `REJECTED`) with audit remarks. |
| `DELETE` | `/api/events/:id` | Coord, Admin | Remove pending event proposal. |

### 3. Activity Reports & Accreditation (`/api/reports`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/reports` | Authenticated | List all verified archived activity reports with expenditure summaries. |
| `GET` | `/api/reports/:id` | Authenticated | Retrieve full report dossier including winners and cloud drive links. |
| `POST` | `/api/reports` | Coord, Faculty, Admin | Submit post-event report. Blocked for DSW (approver only). |
| `PUT` | `/api/reports/:id` | Coord, Faculty, Admin | Update existing activity report. |

### 4. Clubs & Societies (`/api/clubs`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/clubs` | Public | Fetch list of active campus clubs, faculty advisors, and coordinators. |
| `GET` | `/api/clubs/:id` | Public | Detailed club profile including organized and collaborating events. |
| `POST` | `/api/clubs` | DSW, Admin | Register new student club. |
| `PUT` | `/api/clubs/:id` | DSW, Admin | Update club metadata, leadership rosters, and contact details. |
| `DELETE` | `/api/clubs/:id` | Admin | Deactivate a club record. |

### 5. Campus Auditoriums & Venues (`/api/venues`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/venues` | Authenticated | List campus venues with seating capacity and facilities. |
| `GET` | `/api/venues/schedule` | Authenticated | Live auditorium schedule matrix displaying booked time slots to prevent clashes. |
| `POST` | `/api/venues` | DSW, Admin | Register a new campus venue or seminar hall. |

### 6. Academic Departments (`/api/departments`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/departments` | Authenticated | List all academic departments and assigned HODs. |
| `POST` | `/api/departments` | Admin | Create department entry. |
| `PUT` | `/api/departments/:id` | Admin | Reassign HOD or update department code. |

### 7. User & Role Governance (`/api/users`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/users` | DSW, Admin | Retrieve list of all registered users and roles. |
| `POST` | `/api/users` | Admin | Create administrative or faculty user. |
| `PUT` | `/api/users/:id/role` | DSW, Admin | Reassign user permissions or promotion. |
| `POST` | `/api/users/:id/assign-club` | DSW, Admin | Associate coordinator with a specific club. |
| `DELETE` | `/api/users/:id` | DSW, Admin | Delete user account. |

### 8. Notifications (`/api/notifications`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/notifications` | Authenticated | Retrieve unread/recent user-targeted system notifications. |

### 9. Institutional Analytics (`/api/analytics`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/analytics` | Authenticated | Overview metrics on total events, student footfall, budget trends, and SDG spread. |

---

## 🔑 Quick-Access Demo Credentials

For rapid demonstration, use the **1-Click Auto-Fill** buttons on the login screen (`http://localhost:3000/login`) or use the following pre-seeded credentials:

| Role Title | Account Email | Password | Primary Institutional Function |
| :--- | :--- | :--- | :--- |
| **Dean Student Welfare (DSW)** | `dsw@dsw.com` | `admin123` | Final sanction authority, reports auditor, clubs supervisor. |
| **Head of Department (HOD)** | `hodcse@dsw.com` | `admin123` | Department venue & academic schedule endorsement authority. |
| **Faculty Club Advisor** | `faculty@dsw.com` | `admin123` | Faculty advisor to student clubs; reviews proposals. |
| **Faculty Advisor 2** | `faculty2@dsw.com` | `admin123` | Faculty advisor for technical chapters. |
| **Club Coordinator** | `hindisamiti@dsw.com` | `admin123` | Drafts event proposals, books venues, submits reports. |
| **Enrolled Student** | `student@dsw.com` | `admin123` | Views approved campus events and participation info. |

---

## 🚀 Local Installation & Setup

### Prerequisites
- **Node.js** (v18.x or v20.x LTS)
- **PostgreSQL** (v14 or higher) running on `localhost:5432`

---

### Step 1: Clone Repository
```bash
git clone https://github.com/theniteshgurjar/Event-Management.git
cd Event-Management
```

---

### Step 2: Database Setup
Create a PostgreSQL database named `mits_dsw`:
```sql
CREATE DATABASE mits_dsw;
```

*(Optional Windows Quick-Start)*: If using local standalone PostgreSQL binaries, you can run:
```bat
start-database.bat
```

---

### Step 3: Backend Configuration & Start
1. Navigate to `backend`:
   ```bash
   cd backend
   ```
2. Configure `.env`:
   ```env
   PORT=5000
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mits_dsw?schema=public"
   JWT_SECRET="mits_dsw_super_secret_jwt_key_2026"
   ADMIN_PASSWORD="admin123"
   ```
3. Install dependencies, push schema, and seed test data:
   ```bash
   npm install
   npm run db:push
   npm run seed
   ```
4. Start backend in development mode:
   ```bash
   npm run dev
   ```
   *Backend REST API will listen on `http://localhost:5000`.*

---

### Step 4: Frontend Configuration & Start
1. Open a new terminal and navigate to `frontend`:
   ```bash
   cd frontend
   ```
2. Ensure `.env.local` contains:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000
   ```
3. Install dependencies and launch development server:
   ```bash
   npm install
   npm run dev
   ```
   *Frontend application will start at `http://localhost:3000`.*

---

### Step 5: Production Build Verification
To ensure all routes and TypeScript typings compile cleanly for production:
```bash
cd frontend
npm run build
```

Expected compilation confirmation:
```text
✓ Compiled successfully (18/18 routes statically & dynamically generated)
```

---

## 📂 Repository Directory Structure

```text
Event-Management/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma            # Prisma ORM schema & relations
│   ├── src/
│   │   ├── controllers/             # Express route business logic
│   │   │   ├── analyticsController.js
│   │   │   ├── authController.js
│   │   │   ├── clubController.js
│   │   │   ├── departmentController.js
│   │   │   ├── eventController.js
│   │   │   ├── notificationController.js
│   │   │   ├── reportController.js
│   │   │   ├── userController.js
│   │   │   └── venueController.js
│   │   ├── middlewares/
│   │   │   └── authMiddleware.js    # JWT verification & RBAC guards
│   │   ├── routes/                  # Express API routers
│   │   ├── prisma.js                # Prisma client singleton
│   │   ├── seed.js                  # Initial database seeds
│   │   ├── seed_users.js            # Demo user accounts seed
│   │   └── server.js                # Express app entrypoint
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── app/                     # Next.js 16 App Router
│   │   │   ├── page.tsx             # Public landing page
│   │   │   ├── login/               # Authentication & 1-click demo desk
│   │   │   ├── register/            # Student / coordinator signup
│   │   │   └── dashboard/           # Authenticated application shell
│   │   │       ├── analytics/       # Institutional analytics
│   │   │       ├── approvals/       # Administrative sanction desk
│   │   │       ├── clubs/           # Clubs & student chapters
│   │   │       ├── departments/     # Academic departments
│   │   │       ├── events/          # Events catalog & creation desk
│   │   │       ├── reports/         # NAAC activity report archives
│   │   │       ├── users/           # User & role administration
│   │   │       └── venues/          # Auditorium matrix & clash engine
│   │   ├── components/              # Reusable Neo-Brutalist UI components
│   │   └── config/                  # API endpoints and client config
│   ├── package.json
│   └── tsconfig.json
├── start-database.bat               # Windows batch script for PostgreSQL
└── README.md                        # Master project documentation
```

---

## 🔒 Security & Audit Integrity Standards

1. **Defense-in-Depth Authorization**: Every endpoint verifies both the JWT token and the requester's role; frontend routes conditionally render controls while backend controllers strictly enforce `403 Forbidden` responses.
2. **Conflict Prevention Engine**: Time intervals for venue bookings are indexed (`@@index([venueId, startTime, endTime])`) and verified prior to slot allotment.
3. **Immutable Audit Trails**: Every decision remark, sanction, and rejection by HODs and DSW is timestamped and permanently recorded in the `Approval` table.
4. **Environment Isolation**: API endpoints are strictly decoupled into environment variables for zero code adjustments between local dev and cloud deployments.

---

## 📜 License & Credits

Developed for the **Office of Dean Student Welfare (DSW)** at **Madhav Institute of Technology & Science (MITS), Gwalior**.

Distributed under the **MIT License**. See `LICENSE` for details.
