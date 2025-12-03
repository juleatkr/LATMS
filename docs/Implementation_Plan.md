# Implementation Plan: LATMS

## Phase 1: Project Setup & Foundation
- [ ] **Initialize Next.js Project**
    - Setup `create-next-app` with TypeScript.
    - Configure `i18n` routing (en/ar).
    - Setup CSS variables for "Premium" design system (Colors, Typography).
- [ ] **Database Schema Design**
    - Users (Employees, Managers, Admins).
    - LeaveRequests (Dates, Status, Type).
    - TicketRequests (Linked to Leave, Status, Quotes).
    - Documents (Passports, Tickets).

## Phase 2: Leave Module Development
- [ ] **UI Components**
    - Login Screen (Bilingual).
    - Dashboard Layout (Sidebar, Header).
    - Leave Application Form.
- [ ] **Backend Logic**
    - Leave Balance Calculation.
    - Approval Workflow API (Manager -> HR -> Ops).

## Phase 3: Ticket Module Development
- [ ] **Ticket Request Flow**
    - Auto-trigger from Leave Approval.
    - "Quote Submission" Interface for Ticket Staff.
    - "Quote Selection" Interface for Management.
    - Ticket Upload & Download.

## Phase 4: Polish & Deploy
- [ ] **PDF Generation** (Approval Letters).
- [ ] **Email Notifications**.
- [ ] **Final UI Polish** (Animations, Glassmorphism).
