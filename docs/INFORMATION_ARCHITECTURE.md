# Information Architecture: ClassManager
## The Structural Layout of the Observation Workspace

This document defines the complete Information Architecture, navigation systems, page hierarchies, and core user flows for the ClassManager platform, based on the **Classroom Stewardship Workspace** DNA.

---

## 1. Navigation & Hierarchy Overview

ClassManager uses a flat, context-oriented navigation model that matches the homeroom teacher’s daily, weekly, and semester workflow states.

### Navigation Map
```
[ Class Container ]
   │
   ├─► Daily Canvas ─────────────────► (Rapid Input, Attendance Scanning)
   │
   ├─► Stewardship Roster ───────────► (Tổ Columns, Student Dossiers)
   │
   ├─► Weekly Closeout ──────────────► (Dispute Resolution, Ledger Locking)
   │
   └─► Reports & Rollups ────────────► (Semester Conduct Ratings, Exports)
```

---

## 2. Core Modules Specification

### Module 1: Daily Canvas (Không gian Ghi nhận Hàng ngày)
*   **Why it exists:** Teachers require a high-speed console to register attendance and record behavior/academic observations during active classes.
*   **Primary User:** Homeroom Teacher & Subject Teachers.
*   **Frequency of Use:** Daily (multiple times per day).
*   **Primary Actions:**
    *   Mark attendance (Present, Absent, Late).
    *   Log an Observation tag (Behavior, Academic, Social) with optional text context.
    *   Select multiple students or entire groups to batch-log observations.
*   **Key Information Displayed:** Spatial grid of students (representing classroom presence), active attendance counters, and a chronological stream of the day's observations.

### Module 2: Stewardship Roster (Sổ tay Chủ nhiệm)
*   **Why it exists:** To provide a visual map of the classroom community and access individual student profiles as long-term developmental dossiers.
*   **Primary User:** Homeroom Teacher.
*   **Frequency of Use:** Daily to Weekly.
*   **Primary Actions:**
    *   Review study group standings (*Tổ* standing metrics).
    *   Open a Student Dossier to view administrative details and chronological observation logs.
    *   Log a private teacher counseling/guidance note.
*   **Key Information Displayed:** Student cards grouped under vertical columns representing their *Tổ*. Student cards display active behavior warning flags, attendance percentages, and recent observation tags.

### Module 3: Weekly Closeout Console (Phân hệ Chốt Tuần)
*   **Why it exists:** To facilitate the end-of-week ritual: auditing student leader logs, resolving student point disputes, generating the weekly report, and locking the ledger.
*   **Primary User:** Homeroom Teacher.
*   **Frequency of Use:** Weekly (on Friday/Saturday).
*   **Primary Actions:**
    *   Approve or edit logs entered by student leaders (*Tổ trưởng*).
    *   Resolve student point disputes.
    *   Execute the "Seal Ledger" command.
*   **Key Information Displayed:** Log audit list, flagged dispute items, calculated weekly group rankings, and the weekly class summary checklist.

### Module 4: Reports & Rollups (Tổng kết Học kỳ)
*   **Why it exists:** To aggregate the frozen weekly snapshots into monthly and semester conduct evaluations, converting raw observation histories into official conduct ratings (*Hạnh kiểm*).
*   **Primary User:** Homeroom Teacher & School Admin.
*   **Frequency of Use:** Monthly and Semester-end.
*   **Primary Actions:**
    *   Review aggregate behavior and attendance trends.
    *   Review and adjust the system's recommended conduct grades.
    *   Sign off and export semester reports (PDF).
*   **Key Information Displayed:** Longitudinal conduct trajectories (improving vs declining), recommended grades, and monthly attendance/conduct summaries.

---

## 3. Core User Flows

### A. Logging an Observation
```
1. Access [Daily Canvas]
   │
   ├──► 2. Select Student(s) or Group(s)
   │       │
   │       └──► 3. Select Observation Tag (e.g., "Good Homework Prep", "Late")
   │               │
   │               └──► 4. Input Context Text (Optional, e.g., "Late 10 mins")
   │                       │
   │                       └──► 5. Commit to Ledger (Saves immediately)
```

### B. The Weekly Closeout Ceremony
```
1. Navigate to [Weekly Closeout] on Friday afternoon
   │
   ├──► 2. Audit Pending Logs (Review and approve/correct Tổ Trưởng entries)
   │       │
   │       ├──► 3. Resolve Active Student Disputes
   │       │       │
   │       │       └──► 4. System calculates Weekly Rank & Trophies (Preview)
   │       │               │
   │       │               └──► 5. Click "Seal Week" (Creates read-only archive)
   │       │                       │
   │       │                       └──► 6. Active behavior variables reset to baseline
```

### C. The End-of-Semester Rollup
```
1. Open [Reports & Rollups] at the end of the term
   │
   ├──► 2. Review aggregate metrics compiled from all 18 weekly snapshots
   │       │
   │       ├──► 3. Audit System Recommended Conduct Grades (e.g., student A: "Tốt")
   │       │       │
   │       │       └──► 4. Teacher adjusts exceptions or signs off
   │       │               │
   │       │               └──► 5. Export official reports for Ban Giám Hiệu
```

---

## 4. Screen Hierarchy & Content Outline

```
*   Class Workspace
    *   Daily Canvas Screen
        *   Attendance Board (Visual presence tiles)
        *   High-Speed Logging Bar (Multi-select student list + tagging palette)
        *   Daily Feed Panel (Chronological logs of the day)
    *   Stewardship Roster Screen
        *   Tổ columns grid (Cards representing students)
        *   Student Dossier (Two-column modal/drawer)
            *   Left Column: Profile, Contacts, Academic Bio
            *   Right Column: Scrollable chronological Observation Feed + Teacher notes
    *   Weekly Closeout Screen
        *   Audit Queue (Pending inputs from student leaders)
        *   Dispute Resolution Panel
        *   Closeout Control (Seal Week action button)
    *   Reports & Rollups Screen
        *   Aggregated conduct statistics
        *   Semester grading spreadsheet (System recommendation vs Final conduct grade)
        *   Export controls
```
