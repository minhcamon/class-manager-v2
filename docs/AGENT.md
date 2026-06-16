# Agent Guidelines: ClassManager
## The Constitutional Design and Architecture Blueprint for AI & Human Developers

This document serves as the absolute blueprint and constitutional guide for ClassManager. All future feature proposals, codebase modifications, database schema changes, and UI adjustments must be evaluated against the rules established here. Any request that violates this document must be rejected.

---

## 1. Product Identity & DNA

ClassManager is a **Student Observation Platform for Homeroom Teachers**. It is NOT a generic dashboard, a point-tracking game, or a spreadsheet.

### Core Entity Relationships (The DNA Formula)
*   **Primary Entity:** `Student`
*   **Primary Unit of Work:** `Observation`
*   **Primary Container:** `Class`
*   **Primary Cycle:** `Week`
*   **Primary Outcome:** `Conduct & Development Evaluation`

---

## 2. Core Principles

### UX & Interface Principles
1.  **Incident-First Context:** Observations must never be recorded as raw numbers. Every behavior logged must contain a category, an indicator (positive, neutral, warning), and optional text context.
2.  **No Skeuomorphism:** Do not use decorative paper sheets, binder rings, leather textures, or cartoonish graphics. The interface must be flat, modern, and screen-native.
3.  **Spatial Roster Organization:** Maintain the spatial grouping of students by study teams (*Tổ*) or seating layouts. Avoid showing students only in flat, alphabetical spreadsheet tables.
4.  **Quiet Aesthetics (The 90-8-2 Rule):** 
    *   **90% Neutrals:** Slate/gray backgrounds and high-contrast charcoal text.
    *   **8% Primary Accent:** Refined Slate Navy (`#234B7C`) for buttons, active navigation, and primary interactive elements.
    *   **2% Semantics:** Low-saturation pastel badges (Green/Amber/Red) for status indicators.

### Database & Technical Architecture Rules
1.  **Immutable Logs:** Recorded observations (`point_logs`) are write-once. They cannot be edited or deleted directly. Corrections must be applied as offset balancing entries.
2.  **Temporal Snapshots:** The database must support read-only snapshots of weekly ledger states (`weekly_reports`). When a week is closed, its data is frozen.
3.  **Semester Versioning:** Maintain support for semester boundaries. Student attributes, rules, and configurations must version by academic term.

---

## 3. Naming Rules

When writing code or designing databases, strictly adhere to the following terminology:

*   **DO NOT USE:** `Points`, `Score`, `Mark`, `Penalty`, `Reward` (These imply gamification).
*   **DO USE:** `Observation`, `Behavioral Tag`, `Conduct Indicator`, `Weekly Evaluation`.
*   **DO NOT USE:** `Groups`, `Sub-Classes` (Too generic).
*   **DO USE:** `Tổ` (Vietnam-specific classroom study groups).
*   **DO NOT USE:** `User Profile` (For students).
*   **DO USE:** `Student Dossier` (Implies a longitudinal records file).
*   **DO NOT USE:** `Points Reset`.
*   **DO USE:** `Ledger Closeout` or `Cycle Reset` (Weekly ledger sealing ritual).

---

## 4. Feature Evaluation Framework

Before implementing any new feature, evaluate it using the following checklist:

| Evaluation Question | Pass Condition | Fail Condition (REJECT) |
| :--- | :--- | :--- |
| **Who is this for?** | Homeroom Teachers (primarily) or student leaders (under audit). | General administrators, accountants, or public visitors. |
| **What is the data model?** | Tied to a specific `Student` and an `Observation` entry. | A generic CRUD database table. |
| **How does it handle time?** | Respects the cyclical `Week` structure and ledger snapshots. | Continuous, infinite line charts or un-snapshotted data streams. |
| **Is it gamified?** | Focuses on professional stewardship and objective evaluation. | Contains student avatars, public leaderboard ranks (gamified), or points redemption shops. |
| **Can records be erased?** | Errors corrected via logged balancing offset entries. | Direct un-audited database row deletion (`DELETE FROM point_logs`). |

---

## 5. Decision-Making Rules for Agents

1.  **Rule on "Add Spreadsheet View":** **Reject.** Do not build open grid cells that allow raw, inline table editing. All logs must be committed through the structured Observation workflow.
2.  **Rule on "Add Student Avatars / Mascots":** **Reject.** Keep the visual design clean and professional. Do not add gamified elements.
3.  **Rule on "Weekly Closeout Bypass":** **Reject.** The ledger *must* close out weekly to lock data and preserve historical evaluation snapshots. Bypassing this ritual breaks long-term conduct rating rollups.
4.  **Rule on "Zalo Integration / Report Sharing":** **Approve.** Exporting weekly snapshots to parents via communication channels directly supports homeroom stewardship.
5.  **Rule on "Parent Portal":** **Decline/Defer.** In the current phase, parents are passive recipients of exported reports. Do not build live login portals for parents; focus on teacher-centered workflows.
