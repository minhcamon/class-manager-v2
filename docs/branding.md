# ClassManager Branding & Refined Design Guide

## Overview

ClassManager follows a modern, professional, and friendly education-focused design language. It is optimized to feel trustworthy for school administrators, highly efficient for homeroom teachers, and motivating for students.

---

# Brand Colors (Refined)

All primary and utility colors are calibrated for high contrast, professional tone, and WCAG AA accessibility.

## Primary (Authoritative Slate Navy)

```css
#234B7C
```

*Purpose:* Primary actions, main call-to-actions, active links, and brand identification.

*Palette:*
```text
50  #EEF4FC
100 #DEECFA
200 #C6D8EE
300 #9ABFDF
400 #6E9FD0
500 #4D84BF
600 #234B7C  /* Accent Anchor */
700 #1B3B63  /* Hover State */
800 #142C4B
900 #0E1D34
```

---

## Success (Emerald Green)

```css
#059669
```

*Purpose:* Approved profiles, positive point changes, and completed weekly reports.

---

## Warning (Warm Amber)

```css
#D97706
```

*Purpose:* Pending student approvals, warnings, and incomplete weekly logs.

---

## Danger (Crimson Red)

```css
#DC2626
```

*Purpose:* Rejected registrations, penalty logs, and critical validation alerts.

---

# Neutral Colors

A slate-leaning cool neutral scale that anchors layout borders and typography.

```text
50  #F8FAFC
100 #F1F5F9
200 #E2E8F0
300 #CBD5E1
400 #94A3B8
500 #64748B
600 #475569
700 #334155
800 #1E293B
900 #0F172A
```

---

# Surface Colors

- **Background:** Slate neutral light `#F8FAFC`
- **Card Background:** Pure white `#FFFFFF`
- **Card Borders:** Slate-200 `#E2E8F0`

---

# Typography

- **Headlines / Display:** `Inter, system-ui, sans-serif` (Medium, Semibold, Bold; letter-spacing: `-0.02em` or `-0.03em` for tight display impact)
- **Body / Content:** `Inter, sans-serif` (Regular, 400; line-height: `1.625`)

---

# Shape Consistency Lock (Border Radii)

To maintain design uniformity, follow the border-radius constraints strictly:
- **Card Elements:** `12px` (equivalent to Tailwind `rounded-xl`)
- **Buttons, Inputs, and Badges:** `8px` (equivalent to Tailwind `rounded-lg`)
- **Rating Badges & Pills:** `9999px` (equivalent to Tailwind `rounded-full`)

---

# Tactile Interactive Micro-Physics

All buttons, interactive elements, and list cards must provide immediate physical feedback:
- **Active State (`:active`):** Scale down slightly to `97%` (`scale-[0.97]`) to simulate a physical button depress.
- **Hover Transitions:** `150ms` ease-in-out (`transition-all duration-150 ease-in-out`).
- **Focus Rings:** Accessible focus outlines on tab selection using a primary ring (`outline-none ring-2 ring-primary ring-offset-2`).
