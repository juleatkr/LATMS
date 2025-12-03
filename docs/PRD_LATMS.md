# Product Requirements Document (PRD)
## System Name: Leave & Air Ticket Management System (LATMS)
**Version:** 2.0 (Implemented)
**Date:** 2025-11-24
**Status:** Production Ready

### 1. Project Overview
**Goal:** To automate the end-to-end lifecycle of employee leave management, from initial application and approval to the final issuance of air tickets and settlement processing, ensuring policy compliance and operational efficiency for Al Obaidani Stores.

### 2. Key Objectives (Achieved)
*   ✅ **Unified Workflow:** Seamless transition from "Leave Approved" to "Ticket Request" without manual handovers.
*   ✅ **Smart Eligibility:** Auto-calculation of ticket entitlement based on employee data.
*   ✅ **Cost Optimization:** Multi-quote system (up to 3 quotes) for ticket bookings with individual selection capability.
*   ✅ **Email Notifications:** Comprehensive email system using mailto: links with standardized subject format.
*   ✅ **Settlement Workflow:** Integrated accounts notification for leave salary and ticket cost settlement.

### 3. User Roles & Responsibilities
| Role | Responsibilities | System Access |
| :--- | :--- | :--- |
| **Employee** | Apply for leave, view own tickets (issued only), download e-tickets. | Employee Dashboard |
| **Manager** | Review leave necessity, approve/reject leave requests. | Approvals Page |
| **HR Admin** | Verify leave balance, manage all leave requests, full ticket workflow management. | Admin Portal (Full Access) |
| **Admin** | Complete system administration, employee management, ticket processing. | Admin Portal (Full Access) |
| **Accounts** | Receive settlement requests, calculate amounts, update settlement status in system. | Admin Portal (Restricted) |
| **Travel Agent** | Receive quote requests, provide quotes, issue tickets. | Email-based |

### 4. Functional Requirements

#### 4.1 Leave Request Module ✅
*   **Inputs:** Leave Type, Dates (From/To), Reason, **Ticket Required (Yes/No)**.
*   **Logic:**
    *   Auto-calculate duration.
    *   Validate against Leave Balance.
    *   Auto-create ticket request if approved and ticket required.
*   **Filtering:** Search by name/staff code, filter by status.

#### 4.2 Approval Workflow ✅
**Implemented Linear Chain:**
1.  **Submission:** Employee submits request.
2.  **Level 1 (Manager):** Operational Approval
    *   Email notification to next approver
    *   Rejection email to employee if rejected
3.  **Level 2 (HR):** Policy Approval
    *   Final approval triggers ticket request creation
    *   Email notification capabilities
4.  **Auto-Trigger:** Upon approval, if `Ticket Required == Yes`, system creates linked "Ticket Request".

#### 4.3 Ticket Management Module ✅ (Enhanced)
**Stage 1: Request Generation**
*   Auto-populated from approved leave request
*   Status: `PENDING_QUOTE`
*   **Action:** HR clicks "📧 Request Quote" → Opens email to travel agent with:
    *   Subject: `[STAFF_CODE] | [ROUTE] | [NAME] | [ELIGIBILITY]`
    *   Body: Passenger details, travel details, ticket eligibility

**Stage 2: Quote Entry (HR/Admin)**
*   Staff clicks "💰 Enter Prices"
*   Enters up to 3 flight options with details:
    *   Airline, Price, Type (Direct/Transit), Departure time, Baggage, Refundable status
*   Status changes to: `QUOTE_RECEIVED`
*   Quotes displayed as individual cards with full details

**Stage 3: Quote Selection & Issuance**
*   Each quote has "✈️ Issue This Quote" button
*   Clicking opens email to travel agent with selected quote details
*   Subject: `[STAFF_CODE] | [ROUTE] | [NAME] | ISSUE TICKET`
*   Selected quote saved to ticket record
*   Optional: Mark as issued immediately or wait for physical ticket

**Stage 4: Mark as Issued**
*   "✓ Mark as Issued" button appears after quote selection
*   Confirms physical ticket received from travel agent
*   Status changes to: `TICKET_ISSUED`

**Stage 5: Settlement (Accounts Role)**
*   **"💰 Notify Accounts"** → Email to accounts with settlement details
*   Accounts logs in to **Admin Portal** (Restricted View)
*   Views issued tickets
*   **Action:** "✓ Mark Settlement Ready" → Status: `SETTLEMENT_READY`
*   **Action:** "✓ Mark as Settled" → Status: `SETTLED`
*   Status updates reflected on Employee Dashboard

**Stage 6: Notifications (Post-Issuance)**
*   **"📧 Notify Employee"** → Email to employee with ticket details
    *   Subject: `[STAFF_CODE] | [ROUTE] | [NAME] | TICKET ISSUED`
    *   Body: Flight details, collection instructions

#### 4.4 Employee Management ✅
*   Add/Edit/Delete employees
*   Fields: Staff Code, Name, Email, Password, Role, Department, Location, Annual Leave Balance, Ticket Eligibility
*   Filtering: Search, role filter, department filter
*   Role-based access control

#### 4.5 Email Notification System ✅
**Standardized Subject Format:** `[STAFF_CODE] | [ROUTE/TYPE] | [NAME] | [ACTION/STATUS]`

**Implemented Emails:**
1. **Quote Request** → Travel Agent
2. **Issue Ticket** → Travel Agent (with selected quote)
3. **Notify Employee** → Employee (ticket issued)
4. **Notify Accounts** → Accounts (settlement request)
5. **Notify Next Approver** → Manager/HR (leave approval)
6. **Send Rejection** → Employee (leave rejected)

**All emails use mailto: links with comprehensive body content**

### 5. Technical & Non-Functional Requirements

#### 5.1 Implemented Stack ✅
*   **Frontend:** Next.js 15 (React) - Server Components & Client Components
*   **Styling:** Vanilla CSS with CSS Variables - Premium dark theme with glassmorphism
*   **Backend:** Next.js API Routes (Serverless)
*   **Database:** Prisma ORM with PostgreSQL/SQLite
*   **Authentication:** NextAuth.js with credentials provider
*   **Email:** mailto: links (default email client)

#### 5.2 Security ✅
*   Session-based authentication
*   Role-based access control (RBAC)
*   API route protection with auth checks
*   **⚠️ TODO:** Password hashing (currently plain text - CRITICAL)

#### 5.3 Data Visibility ✅
| Role | Leave Requests | Ticket Requests |
|------|---------------|-----------------|
| Employee | Own requests only | Own issued tickets only |
| Manager | Pending approvals | None |
| HR/Admin | All requests | All tickets (all statuses) |

#### 5.4 Audit Trail ✅
*   Created/Updated timestamps on all records
*   Status tracking throughout workflow
*   Selected quote preservation
*   Console logging for debugging

### 6. Implementation Status

#### Phase 1: Core Leave Management ✅ COMPLETE
- [x] Leave application form
- [x] Leave balance tracking
- [x] Multi-level approval workflow
- [x] Leave request filtering
- [x] Email notifications for approvals

#### Phase 2: Ticket Workflow ✅ COMPLETE
- [x] Auto-ticket request creation
- [x] Quote entry system (up to 3 quotes)
- [x] Individual quote selection
- [x] Quote details display
- [x] Ticket issuance workflow
- [x] Employee notification
- [x] Accounts settlement notification
- [x] Email integration throughout

#### Phase 3: System Management ✅ COMPLETE
- [x] Employee CRUD operations
- [x] Role-based dashboards
- [x] Filtering and search
- [x] Dynamic user profiles in layouts
- [x] Next.js 15 compatibility (params awaiting)

### 7. Known Issues & Future Enhancements

#### Critical Issues
- [ ] **Password Hashing:** Implement bcrypt for password security
- [ ] **Email Configuration:** Replace placeholder email addresses with actual company emails

#### Future Enhancements
- [ ] PDF generation for tickets
- [ ] Settlement amount tracking and status updates
- [ ] Reporting and analytics dashboard
- [ ] Bilingual support (English/Arabic)
- [ ] Document upload (passport, visa copies)
- [ ] Passport validity checks
- [ ] Dynamic notification badges (current: hardcoded)
- [ ] Advanced filtering and sorting
- [ ] Export functionality (CSV/Excel)

### 8. API Routes Summary

#### Public Routes
- `/api/auth/[...nextauth]` - Authentication

#### Employee Routes
- `/api/leave` - GET (own), POST (create)
- `/api/tickets` - GET (own issued tickets)

#### Admin/HR Routes
- `/api/admin/employees` - GET (all), POST (create)
- `/api/admin/employees/[id]` - PUT (update), DELETE (delete)
- `/api/admin/leave` - GET (all)
- `/api/admin/leave/approve` - POST (approve/reject)
- `/api/admin/tickets` - GET (all), POST (update quotes)
- `/api/admin/tickets/[id]` - PUT (update status/quotes)

### 9. Deployment Notes
*   Database migrations required for schema changes
*   Environment variables needed: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
*   Node.js version: 18+ recommended
*   Next.js version: 15.x

---
**Document Maintained By:** Development Team  
**Last Updated:** 2025-11-24  
**Next Review:** Upon Phase 4 planning
