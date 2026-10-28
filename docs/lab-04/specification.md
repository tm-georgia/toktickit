# TokTickIT Lab 4 Engineering Specification

## 1. Sprint Goal

Lab 4 completes the core TokTickIT service-desk workflow by adding Actions Taken
records, enforcing Ticket status transitions, providing Requester and IT Staff
dashboards, and improving security, usability, accessibility, and regression
reliability.

## 2. Stakeholder Request

IT Staff need to record the work performed on each Ticket, its result, the person
who performed it, and any required follow-up. Requesters need to see relevant
work records and understand the status of their own Tickets. IT Staff need an
operational dashboard, while Requesters need a personal dashboard. The application
must preserve existing data and behave consistently across supported screens.

## 3. Scope

### 3.1 Included

- Create and update Actions Taken records.
- Display multiple Actions Taken records under one Ticket.
- Automatically record the authenticated user who performs an action.
- Enforce Action Taken authorization on the backend.
- Implement the approved Ticket status-transition rules.
- Keep Requester resolution feedback advisory.
- Provide Requester and IT Staff dashboards.
- Calculate dashboard metrics from authoritative backend data.
- Provide drill-down links to relevant Ticket lists or details.
- Add database migration, validation, conflict handling, and tests.
- Preserve existing application behavior and data.
- Improve responsive behavior, accessibility, and consistent feedback.

### 3.2 Excluded

- Automatic SLA clocks, escalation engines, and breach notifications.
- Email, SMS, LINE, push, or other external notification services.
- Inventory consumption, spare-parts management, purchasing, or service cost
  accounting.
- Payroll, time-sheet billing, or detailed labor-cost calculation.
- Multi-level approval workflows and electronic signatures.
- Advanced BI tools, custom report builders, and export warehouses.
- Multi-tenant organizations and production-scale cloud operations.
- Unapproved product features outside this engineering contract.

## 4. Functional Requirements

### FR-01: Actions Taken Records

The system shall allow authorized IT Staff and Administrators to create and
update Actions Taken records for a Ticket.

### FR-02: Action Information

Each Action Taken shall contain:
- Action Date/Time
- Action Description
- Result
- Performed By
- Follow-Up Required
- Follow-Up Note
- Attachment Notes

### FR-03: Action History

The system shall display the Actions Taken records belonging to a Ticket.
A Ticket may contain zero, one, or multiple Actions Taken records.

### FR-04: Action Authorization

Requesters may view Actions Taken records for their own Tickets but may not
create or update them. IT Staff and Administrators may create and update
Actions Taken on Tickets they are authorized to access.

### FR-05: Ticket Ownership

The primary Ticket Owner remains responsible for coordinating the Ticket.
The person performing an Action Taken may be a different authorized IT Staff
member. Recording an action must not silently replace the primary Ticket Owner.

### FR-06: Ticket Workflow

The system shall enforce the approved Ticket status-transition matrix on the
backend. The user interface shall display only transitions permitted for the
current user and current Ticket status.

### FR-07: Resolution Feedback

Requester feedback that a problem appears resolved shall be recorded according
to the existing application design. This feedback is advisory and shall not,
by itself, change the Ticket status to Resolved.

### FR-08: Requester Dashboard

The Requester dashboard shall display summary metrics and relevant recent
Tickets belonging only to the authenticated Requester.

### FR-09: IT Staff Dashboard

The IT Staff dashboard shall display operational metrics, current-user work,
unassigned Tickets, and recently updated or urgent Tickets.

### FR-10: Dashboard Drill-Down

Each actionable dashboard metric or Ticket item shall link to an appropriate
filtered Ticket list, Ticket Queue, or Ticket Detail view.

### FR-11: Backend Metric Calculation

Dashboard counts and lists shall be calculated by the backend from authoritative
database records. The frontend shall not invent or independently approximate
the displayed counts.

### FR-12: Validation and Failure Handling

The system shall provide understandable validation, loading, success, empty,
forbidden, conflict, not-found, and safe-failure feedback.

### FR-13: Duplicate Submission Protection

Repeated clicks or safe retries shall not create unintended duplicate Actions
Taken records or duplicate workflow changes.

### FR-14: Regression and Hardening

Existing authentication, authorization, Tickets, attachments, Public Comments,
Internal Notes, IT Staff functions, and Administrator user management shall
continue to work for permitted users.

### FR-15: Responsive and Accessible UI

Lab 4 screens shall preserve the Zen Green visual language, work at desktop,
tablet, and mobile widths, support keyboard operation, show visible focus,
and avoid clipped content or unnecessary horizontal page scrolling.

## 5. Business Rules

### BR-01: Parent Relationship

Every Action Taken belongs to exactly one Ticket.

### BR-02: Primary Owner

The primary Ticket Owner coordinates the Ticket. Recording an Action Taken
does not automatically change the primary Ticket Owner.

### BR-03: Performed By

The backend shall derive the Performed By identity from the authenticated
session. Clients may not impersonate another user by supplying a user ID.

### BR-04: Action Date/Time

The action date/time shall be validated by the backend. The UI shall display
dates consistently using the application's documented timezone policy.
Creation timestamps and action timestamps must not be confused.

### BR-05: Required Fields

Action Description and Result are required. Follow-Up Note is required when
Follow-Up Required is true. Attachment Notes describe relevant supporting files
and do not replace the existing attachment feature.

### BR-06: Requester Restrictions

A Requester may view Actions Taken only for Tickets they own. A Requester
cannot create, edit, or assign an Action Taken.

### BR-07: IT Staff and Administrator Permissions

IT Staff and Administrators may create and update Actions Taken only on Tickets
they are authorized to access. Backend authorization is mandatory even if the
UI hides a control.

### BR-08: Ticket Status Values

The supported Ticket statuses are:
- New
- Open
- In Progress
- Waiting for Requester
- Resolved
- Closed
- Reopened
- Cancelled

### BR-09: Ticket Transition Matrix

The following is the proposed transition contract for implementation and review.
A transition not listed here is rejected by the backend.

| Current Status | Permitted Next Status | Authorized Role |
|---|---|---|
| New | Open, Cancelled | IT Staff, Administrator; Requester may cancel own Ticket if allowed by existing policy |
| Open | In Progress, Cancelled | IT Staff, Administrator; Requester may cancel own Ticket if allowed by existing policy |
| In Progress | Waiting for Requester, Resolved, Cancelled | IT Staff, Administrator |
| Waiting for Requester | In Progress, Resolved, Cancelled | IT Staff, Administrator |
| Resolved | Closed, Reopened | IT Staff, Administrator; Requester may provide resolution feedback |
| Closed | Reopened | IT Staff, Administrator |
| Reopened | In Progress, Waiting for Requester, Resolved, Cancelled | IT Staff, Administrator |
| Cancelled | No transition by default | Administrator only if an explicit recovery rule is approved |

The final implementation must be checked against the existing Lab 3 business
rules before the transition matrix is treated as approved. The UI and API must
use the same approved matrix.

### BR-10: Resolution Gate

A Requester's "problem appears resolved" feedback is advisory and does not
automatically set the status to Resolved. An authorized IT Staff member or
Administrator must perform the formal status transition. The backend shall
enforce the approved resolution prerequisites, including any required work
record or validation rule, regardless of the UI.

### BR-11: Conflict Handling

A stale or concurrent Ticket update must not silently overwrite a newer change.
The API shall detect the conflict or safely reject the stale request and return
a documented conflict response.

### BR-12: Requester Dashboard Metrics

- **Open Tickets:** Tickets owned by the authenticated Requester whose status
  is not Resolved, Closed, or Cancelled.
- **Waiting for Requester:** Owned Tickets whose status is Waiting for Requester.
- **Recently Updated:** Owned Tickets ordered by most recent update time,
  limited to a documented number of records.
- **Recently Resolved:** Owned Tickets currently in Resolved status, ordered by
  most recent update time, limited to a documented number of records.

### BR-13: IT Staff Dashboard Metrics

- **Unassigned Tickets:** Tickets with no primary Ticket Owner and a status
  eligible for staff work; exclude Closed and Cancelled.
- **My Tickets:** Tickets whose primary Ticket Owner is the authenticated
  IT Staff user, excluding Closed and Cancelled unless the UI explicitly
  provides a separate history view.
- **Tickets by Status:** Counts grouped by current status within the authorized
  operational Ticket scope.
- **Tickets by IT Priority:** Counts grouped by IT Priority within the same
  scope, with an explicit Unknown/Unset category if the database allows null.
- **Recently Updated:** A limited list ordered by most recent update time.

### BR-14: Dashboard Empty Results

A metric with no matching records shall return zero. A recent-Ticket list with
no matching records shall return an empty list and the UI shall show a useful
empty state rather than an error.

### BR-15: Dashboard Dates and Limits

Dashboard list limits and timezone handling shall be documented by the API
contract. Metric counts must not depend on the browser's local clock.

### BR-16: Migration Safety

Database migrations must preserve existing Users, Tickets, Attachments, Public
Comments, and Internal Notes. Existing Tickets without Actions Taken remain
valid and display an empty Actions Taken section.

### BR-17: Idempotent Seed

Development seed behavior must be safe to run repeatedly and must not create
duplicate demonstration records. Seed data should cover major statuses,
priorities, assigned and unassigned Tickets, and Tickets with zero, one, and
multiple Actions Taken.

## 6. UI Specification Summary

The UI shall provide:
- An IT Staff Dashboard.
- A Requester Dashboard.
- An Actions Taken section on IT Staff Ticket Detail.
- A read-only Actions Taken view for Requesters.
- Status controls limited to permitted transitions.
- Loading, empty, validation, success, forbidden, conflict, and failure states.
- Responsive layouts and accessible controls.

Detailed layout, fields, responsive rules, and interaction states are defined
in `ui-spec.md`.

## 7. Data Changes

### 7.1 Action Taken Model

The Prisma model should represent one Action Taken belonging to one Ticket.
The final field names and database types must follow the existing project
conventions.

Proposed fields:
- id
- ticketId
- actionDateTime
- actionDescription
- result
- performedByUserId
- followUpRequired
- followUpNote
- attachmentNotes
- createdAt
- updatedAt
- version, if optimistic concurrency is implemented on the record

### 7.2 Relationships and Indexes

- Action Taken has a required foreign key to Ticket.
- Action Taken has a required foreign key to the authenticated performer.
- Ticket has a one-to-many relationship with Actions Taken.
- Index ticketId and actionDateTime to support Ticket history queries.
- Add other indexes only when justified by dashboard queries.

### 7.3 Database Design Decisions

**Decision 1 — Separate Action Taken records:** Work records are stored as child
records instead of one text field on Ticket. This supports multiple actions,
different performers, structured follow-up information, and ordered history.

**Decision 2 — Performer foreign key:** Performed By references the user account
rather than accepting free-text identity. This improves consistency and prevents
clients from choosing a false performer.

**Decision 3 — Preserve legacy Tickets:** Adding Actions Taken must not require
every existing Ticket to have a work record. Legacy Tickets with zero actions
remain valid.

### 7.4 Migration and Recovery

- Use a forward Prisma migration.
- Do not reset or drop existing application data.
- Back up the database before applying a production-like migration.
- Verify existing record counts and relationships before and after migration.
- Test migration against a copy of representative existing data.
- Document the recovery procedure. If rollback is unsafe after new records are
  written, restore from the verified backup rather than deleting user data.

## 8. API Contract

The exact route names and response conventions must be aligned with the
existing Express application before implementation. The proposed contract is
documented in `api-spec.md`.

Required capabilities:
- List, create, and update Actions Taken.
- Retrieve Requester dashboard data.
- Retrieve IT Staff dashboard data.
- Enforce roles and Ticket ownership on the backend.
- Validate inputs and reject stale workflow updates.
- Preserve existing API behavior.

## 9. Acceptance Criteria

- **AC-01:** An authorized IT Staff member can create an Action Taken for an
  existing Ticket, and the authenticated performer is saved automatically.
- **AC-02:** An authorized user can update an Action Taken and see the saved
  values after reloading.
- **AC-03:** A Requester can view Actions Taken for an owned Ticket but cannot
  create or edit them.
- **AC-04:** A Requester cannot read Actions Taken belonging to another
  Requester's Ticket.
- **AC-05:** A Ticket can have zero, one, or multiple Actions Taken records.
- **AC-06:** Follow-Up Note is required when Follow-Up Required is true.
- **AC-07:** The backend rejects a Ticket status transition not allowed by the
  approved transition matrix.
- **AC-08:** Requester resolution feedback does not itself change the Ticket
  status to Resolved.
- **AC-09:** A stale Ticket update is rejected or safely handled without
  silently overwriting a newer update.
- **AC-10:** Requester dashboard metrics include only the authenticated
  Requester's Tickets.
- **AC-11:** IT Staff dashboard counts match authoritative database queries.
- **AC-12:** Dashboard cards navigate to the appropriate filtered view or
  Ticket Detail.
- **AC-13:** Zero-result dashboard metrics and lists display correct empty
  states.
- **AC-14:** Duplicate clicks or retries do not create unintended duplicate
  Actions Taken.
- **AC-15:** Migration preserves existing data and supports Tickets without
  Actions Taken.
- **AC-16:** Existing authentication, Tickets, attachments, comments, notes,
  and user-management features continue to pass regression tests.
- **AC-17:** Major Lab 4 screens remain usable at desktop, tablet, and mobile
  widths and support keyboard focus and accessible labels.

Every acceptance criterion must map to one or more tests in `tests.md`.

## 10. Definition of Done

- [ ] Specification, UI, API, and test documents are reviewed before
  implementation is completed.
- [ ] Database migration is reviewed and tested without data loss.
- [ ] Actions Taken API and UI work for authorized roles.
- [ ] Requester read-only behavior and ownership restrictions are enforced.
- [ ] Ticket transitions and resolution rules are enforced by the backend.
- [ ] Dashboard metrics match database queries.
- [ ] Dashboard drill-down destinations work.
- [ ] Validation, empty, forbidden, conflict, not-found, and failure states
  are implemented.
- [ ] Unit, API, UI, authorization, workflow, regression, and E2E tests pass.
- [ ] Desktop, tablet, and mobile layouts are inspected.
- [ ] Keyboard focus, labels, contrast, and non-color status cues are checked.
- [ ] No unintended console errors, broken links, or placeholder controls remain.
- [ ] README setup, migration, test, and demonstration instructions are current.
- [ ] Pull requests have review evidence and are merged through the agreed
  staged workflow.
- [ ] Final evidence is captured from the final integrated version.

## 11. Assumptions and Decisions

- Existing authentication and role definitions remain the source of identity.
- The backend is authoritative for authorization, status changes, and metrics.
- Dashboard lists are summaries and do not replace detailed Ticket screens.
- Existing Ticket and user records are retained during migration.
- Route names and exact database field names must match the current codebase.
- The status-transition matrix in BR-09 is a proposed contract and must be
  verified against the existing application before implementation.