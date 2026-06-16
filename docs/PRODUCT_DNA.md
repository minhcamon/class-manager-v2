# Product DNA: ClassManager
## The Core Foundation of the Classroom Stewardship Workspace

ClassManager is built on a specific, non-negotiable set of product values, entity relationships, and behavioral principles. This document establishes the foundational DNA of the platform, governing all architectural, UX, and technical decisions.

---

## 1. Product Definition
ClassManager is a **Student Observation Platform for Homeroom Teachers** in secondary and high schools. It is an active, cycle-based stewardship ledger designed to document daily student observations, audit group standings, and generate objective, legally defensible conduct ratings (*Hạnh kiểm*).

---

## 2. The Core DNA Formula

The entire system architecture is built on five core operational entities:

*   **Primary Entity:** **Student** (The human subject of stewardship and evaluation).
*   **Primary Unit of Work:** **Observation** (A single real-world classroom event: behavior, attendance, academic progress, or social interaction).
*   **Primary Container:** **Class** (The teacher’s active jurisdiction).
*   **Primary Cycle:** **Week** (The operational rhythm of recording, auditing, and resetting).
*   **Primary Outcome:** **Conduct & Development Evaluation** (The ultimate goal: objective semester conduct ratings and student growth).

---

## 3. Core Mental Model: The Active Ledger (Sổ Ghi Nhận Chủ Nhiệm)

ClassManager operates on the mental model of a **double-entry ledger**, rather than a database table.
*   **Observations as Entries:** All behavioral, academic, and attendance events are recorded as immutable ledger entries. 
*   **Error Correction by Offset:** To maintain data integrity, errors are corrected using balancing offset entries rather than deletion.
*   **Temporal Partitions:** The ledger opens on Monday morning and closes on Friday afternoon. Closing the ledger snapshots active values into immutable historical logs, resetting the active board for the coming week.

---

## 4. Product Philosophy

Teachers do not manage databases, points, or spreadsheets. **Teachers observe students.**
*   Observations accumulate into Student Records.
*   Student Records form Class Health.
*   Class Health drives Weekly Reviews.
*   Weekly Reviews generate Semester Evaluations.

---

## 5. Product Principles

1.  **Stewardship over Administration:** The application must exist to guide and support students, not simply to comply with database logging.
2.  **Pedagogical Objectivity:** Every evaluation, flag, or point adjustment must be tied to a specific observation with context, protecting both the student and the teacher with objective evidence.
3.  **Cyclical Fresh Starts:** The week is the absolute temporal boundary. Student performance score indicators reset weekly, encouraging students to improve after a poor week and preventing past behavior from permanently dominating the active UI.
4.  **Delegated Trust:** The ledger supports student-led inputs (via *Tổ trưởng* / Group Leaders) but gates them through a teacher audit queue, maintaining teacher authority while decentralizing data entry.

---

## 6. Design Principles

1.  **Low Cognitive Friction:** Logging an observation must require minimal clicks and keystrokes. Interface actions must align with active, high-stress classroom environments.
2.  **Spatial Organization:** Navigation and layout should reflect the physical structure of the classroom rather than abstract databases.
3.  **Visual Restraint (The 90-8-2 Rule):** 
    *   **90% Neutrals:** Focus remains on text and structure.
    *   **8% Primary Accent:** Soft, authoritative Slate Navy (`#234B7C`) highlights active navigation and core CTA states.
    *   **2% Semantics:** Low-saturation pastel badges (Green/Amber/Red) represent behavior alerts and status tags.
4.  **Screen-Native Flatness:** No skeuomorphic illustrations (no fake leather books, paper textures, or three-dimensional desk models). The UI must remain clean, flat, and modern.

---

## 7. Workflow Principles

1.  **Incident-First Capture:** Observations are logged in context. The workflow is built to capture a behavior immediately, deferring detailed classification when necessary.
2.  **No Orphan Data:** Every observation must be linked to a student (or group of students), a time block (week), and a category.
3.  **Cycle-Based Accountability:** The Weekly Closeout is a non-bypassable ritual. The teacher must actively verify, audit, and seal the week's ledger before starting the next week.

---

## 8. Anti-Patterns: What ClassManager Must NEVER Become

*   **NEVER a School ERP:** It does not manage payroll, room booking, school budgets, or scheduling.
*   **NEVER a Student Information System (SIS):** It is not a passive registry of permanent records. It is an active workspace for homeroom teachers.
*   **NEVER a Generic CRUD Dashboard:** It does not expose raw tables for teachers to manually edit, delete, or create rows without audit logs.
*   **NEVER a Point Tracking Tool / Game:** It must not gamify student behaviors with childish animations, avatars, or virtual currencies. Point tags are indicators of conduct, not points to be accumulated for rewards.
*   **NEVER a Spreadsheet Replacement:** It must not look or act like an open Excel sheet. Standard cells, row deletions, and unlogged edits are prohibited.
