# Admin Portal (Future Phase)

## Objective

Build a dedicated System Administration & Support Center for platform monitoring, user support, auditing, troubleshooting, and controlled data repair.

## Scope

Admin is a System Administrator, not a Teacher or Student. Admin uses a separate portal under `/admin/*`.

## Phase 1 - Investigation & Support

### User Inspector

* Search users by username, email, phone, class, school.
* View role, school, class, enrollment, status, last login, recent activities.

### User Timeline

* Display chronological user actions.
* Examples: Login, Select Role, Join Class, Create Class, Update Profile.

### Audit Log

* Track all critical system changes.
* Store actor, timestamp, action, entity, old value, new value.

### Support Actions

* Reset Password.
* Unlock Account.
* Change Role.
* Transfer Class Ownership.
* Move Teacher Between Schools.
* Restore Deleted Class.
* Recreate Enrollment.

All support actions must be audited.

## Phase 2 - Observation

### View As User

* View As Teacher.
* View As Student.
* Read-only mode.
* No create, update, delete actions allowed.

### Activity Center

* Business-level activity timeline.
* Examples: Class Created, Student Joined, Template Published.

## Phase 3 - Monitoring

### API Monitor

* Method, Endpoint, Status, Duration, User, IP.
* Request volume, error rate, top endpoints.

### Error Center

* Authentication Errors.
* Validation Errors.
* Server Errors.
* Filter by user, class, date range.

### System Logs

* INFO, WARN, ERROR logs.
* Search and filtering support.

### System Health Dashboard

* Database status.
* Storage usage.
* Memory usage.
* Scheduled jobs.
* Background tasks.

## Design Principles

* Separate Admin Portal from Teacher and Student portals.
* Read-only by default.
* All repair operations must go through Support Actions.
* Every critical action must be auditable.
* Prioritize Investigation > Audit > Repair > Monitoring.
* Focus on fast user support before DevOps-oriented features.

## Suggested Route Structure

```text
/admin/dashboard
/admin/users
/admin/user-timeline
/admin/audit-logs
/admin/activity-center
/admin/support
/admin/api-monitor
/admin/errors
/admin/system-logs
/admin/system-health
```
