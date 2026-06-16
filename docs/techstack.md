# ClassManager Technical Stack (Tech Stack)

This document provides a comprehensive overview of the technical stack, folder structures, and key architectural patterns utilized in the ClassManager production-ready codebase.

---

## 1. Frontend Architecture

The ClassManager user interface is built as a responsive Single Page Application (SPA) using React 19, TypeScript, Tailwind CSS v4, and Shadcn UI.

### Key Technologies
- **Core Library:** React 19.2 (Functional Components, Hooks, Context API)
- **Programming Language:** TypeScript (Strict mode enabled, `any` is prohibited)
- **Styling Framework:** Tailwind CSS v4 + `@tailwindcss/vite` plugin (utility-first, customized brand theme)
- **UI Components:** Shadcn/ui primitives styled with custom classes, backed by Radix UI primitives (e.g., `@radix-ui/react-dialog` for accessible overlay dialogs)
- **State Management:** Zustand for global client-side state (User authentication, access tokens, routing guards)
- **API Communication:** Axios with centralized interceptors for automatic Bearer token attaching and 401 token refresh loops
- **Data Table:** TanStack Table for sorting, filtering, and responsive student point management lists
- **Dashboard Charts:** Recharts for rendering point logs and weekly rank trends
- **Build System:** Vite 8 (Hot Module Replacement, local dev server with API proxying)

### Frontend Directory Structure
```
frontend/src/
├── assets/          # Static media assets (hero illustrations, logos)
├── components/      # Shared components (common/protected routes) and subcomponents
│   ├── ui/          # Shadcn components (button, dialog, input)
│   └── landing/     # Modular Landing Page components
├── context/         # React Context for local layout states
├── lib/             # Third-party configuration helpers (cn utility)
├── pages/           # High-level page components mapped by the router
│   ├── auth/        # Login and registration pages
│   └── LandingPage.tsx
├── services/        # Centralized Axios API service classes
├── stores/          # Zustand global store files (useAuthStore)
├── types/           # Centrally managed TypeScript Interfaces/Types (student, auth, api error)
├── utils/           # Helper utility functions (date formatting, constants)
├── App.tsx          # Main application coordinator
├── index.css        # Tailwind imports and theme extensions
└── main.tsx         # Virtual DOM mount point
```

---

## 2. Backend Architecture

The backend is a robust RESTful API built on Spring Boot 3.x and Java 21, adhering to Clean Architecture principles.

### Key Technologies
- **Framework:** Spring Boot 3.x (Spring Web, Spring Security, Spring Data JPA)
- **Build Tool:** Maven / Gradle
- **Database:** PostgreSQL (with Flyway database migrations and connection pool optimization via HikariCP)
- **Security & Authorization:** OAuth2 + JWT (stateless sessions, custom Bearer authentication filters, HttpOnly cookies for Refresh Tokens)
- **Scheduler:** Spring Boot Scheduler (CRON job running at 23:59 Asia/Ho_Chi_Minh every Sunday to automatically lock the weekly points snapshot)
- **Auditing:** Custom AOP Interceptors / Spring Security Auditing to record administrative actions into the `audit_logs` table

### Database Schema Core Models
1. **`users`**: Root user entity supporting Google OAuth2 and Phone OTP auth. Holds role (`ADMIN`, `TEACHER`, `STUDENT`) and status (`PENDING`, `APPROVED`, `REJECTED`).
2. **`teacher_profiles`**: Linked one-to-one with teachers.
3. **`classes`**: Linked to a teacher; enforces one active class per teacher at a time.
4. **`groups`**: Tổ thi đua within classes, holds leader reference (`leader_student_id`).
5. **`student_profiles`**: Linked to a user, class, and tổ. Holds answers to dynamic forms.
6. **`point_logs`**: Immutable history of point rewards/penalties (`point_value`, `reason`, `week_start_date`).
7. **`weekly_reports`**: Snapshot records of points and ranks created upon weekly locking.
8. **`form_templates`**: Holds dynamic form fields configured by versioning (`version`, `is_active`).
9. **`audit_logs`**: Immutable audit logs of administrative actions.

---

## 3. Security & Access Control Matrix

Access control is checked both at the Gateway / Spring Web Security filters (Role-based) and inside the Service Layer (Position-based: Tổ trưởng check).

### Role Access Control (RBAC)
- **ADMIN**: Approves/Rejects Teacher registrations.
- **TEACHER**: Manages classes, groups, dynamic form templates, student approvals, and locks weekly scoring.
- **STUDENT**: Fills dynamic questionnaires, views personal points and rank histories.
- **STUDENT (Tổ trưởng / GROUP_LEADER position)**: Grants point awards/penalties to members inside their respective Tổ (and self-grading).
