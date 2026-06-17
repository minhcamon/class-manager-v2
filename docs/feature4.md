# Dashboard & Class Workspace Implementation Tasks

## Objective

Build production-ready Teacher Dashboard, Student Dashboard, and Class Workspace UI. The goal is to establish a scalable navigation structure before implementing future features such as Student Management, Groups, Attendance, Scores, Assignments, and Reports.

---

# Task 1 - Dashboard Separation

Teacher and Student must have completely different dashboards and navigation structures.

### Teacher Routes

```text
/teacher/dashboard
/teacher/classes
/teacher/classes/create
/teacher/classes/:classId/*
```

### Student Routes

```text
/student/dashboard
/student/class/:classId/*
```

---

# Task 2 - Teacher Dashboard

Route:

```text
/teacher/dashboard
```

### Empty State

When teacher has no classes:

* Show large centered CTA.
* Primary button: "Create Your First Class".
* Redirect to:

```text
/teacher/classes/create
```

### Existing Classes

Display class cards:

* Class Name
* Student Count
* Created Date
* Quick Actions

Click card:

```text
/teacher/classes/:classId
```

---

# Task 3 - Teacher Class Workspace

Route:

```text
/teacher/classes/:classId
```

### Sidebar Structure

#### Overview

```text
Overview
```

#### Student Management

```text
Students
Profile Template
Groups
```

#### Learning Management

```text
Assignments
Attendance
Scores
```

#### Administration

```text
Management
Configuration
```

Only implement:

```text
Overview
Profile Template
Management
Configuration
```

Other menu items:

```text
Coming Soon
```

---

# Task 4 - Class Overview Page

Route:

```text
/teacher/classes/:classId
```

Display:

* Class Name
* Teacher
* School
* Student Count
* Class Code
* Recent Activities

### Quick Actions

Buttons:

```text
Edit Profile Template
Manage Class
Configure Class
```

---

# Task 5 - Class Configuration

Route:

```text
/teacher/classes/:classId/configuration
```

### Section: Class Information

Display:

* Class Name
* School
* Created Date

### Section: Class Access

#### Class Code

* Read-only
* Copy button

#### Class Password

* Hidden by default
* Show/Hide toggle
* Never display automatically

### Section: Danger Zone

Delete Class Flow:

#### Step 1

Confirmation Modal

```text
Are you sure?
```

#### Step 2

User must manually type class name.

Requirements:

* No copy/paste
* No autofill
* Delete button disabled until exact match

---

# Task 6 - Class Management

Route:

```text
/teacher/classes/:classId/management
```

Prepare layout for future features.

### Statistics

* Students
* Groups
* Assignments
* Attendance Rate
* Average Score

### Student Overview Table

Columns:

```text
Student
Status
Group
Joined Date
```

### Group Overview Table

Columns:

```text
Group
Leader
Members
```

### Recent Activities

Timeline component.

### Quick Actions

Disabled buttons:

```text
Create Group
Import Students
Take Attendance
Create Assignment
```

Badge:

```text
Coming Soon
```

---

# Task 7 - Profile Template Builder

Route:

```text
/teacher/classes/:classId/profile-template
```

Build a Google Forms style interface.

### Features

* Template Name
* Description
* Add Question
* Reorder Questions
* Duplicate Question
* Delete Question
* Preview Mode

### Supported Field Types

```text
Short Text
Paragraph
Number
Date
Email
Phone
Dropdown
Radio
Checkbox
```

### Question Properties

```text
Label
Placeholder
Required
Type
```

### Template Status

```text
Draft
Published
Archived
```

---

# Task 8 - Student Dashboard

Route:

```text
/student/dashboard
```

Display:

* Current Class
* Teacher
* School
* Recent Activities

Primary Action:

```text
Open Class
```

Redirect:

```text
/student/class/:classId
```

---

# Task 9 - Student Class Workspace

Route:

```text
/student/class/:classId
```

### Sidebar

```text
Home
My Profile
Assignments
Attendance
Scores
Announcements
```

Only implement:

```text
Home
My Profile
```

Others:

```text
Coming Soon
```

---

# Task 10 - Student Home

Display:

* Class Information
* Teacher Information
* Announcements Placeholder
* Recent Activities

---

# Task 11 - My Profile

Route:

```text
/student/class/:classId/profile
```

Render fields dynamically from published Profile Template.

Requirements:

* Read student profile data.
* Support validation.
* Support edit and save.
* Follow template configuration from teacher.

---

# Task 12 - Navigation & Guards

### Teacher Guard

Teacher can only access:

```text
/teacher/*
```

### Student Guard

Student can only access:

```text
/student/*
```

### Onboarding Guard

Teacher without school:

```text
→ /onboarding/teacher
```

Student without enrollment:

```text
→ /onboarding/student
```

### Auth Guard

Authenticated users cannot access:

```text
/auth
/login
/register
```

Must be redirected to current dashboard or onboarding step.

---

# Technical Requirements

* React Router v7
* Context API
* Responsive Layout
* Reusable Sidebar Component
* Reusable Page Header Component
* Loading States
* Empty States
* Error States
* Toast Notifications
* Mobile-first design
* Clean folder structure for future feature expansion

```
```
