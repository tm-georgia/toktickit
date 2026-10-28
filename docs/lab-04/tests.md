# TokTickIT Lab 4 Test Plan

## 1. Purpose

This document defines the planned and executed tests for Actions Taken,
Ticket workflow, dashboards, authorization, migration, responsive UI,
accessibility, and final regression.

Acceptance criteria are defined in `specification.md`. A test is marked Pass
only after it has actually been executed and the result recorded.

## 2. Test Strategy

| Test Level | Purpose |
|---|---|
| Unit | Validate business rules, calculations, and input validation |
| API / Integration | Validate endpoints, database behavior, and response codes |
| Authorization | Verify role permissions and Ticket ownership |
| UI Component | Verify forms, lists, dashboard cards, and feedback |
| UI Style | Verify layout, labels, badges, focus, and content visibility |
| Responsive | Verify desktop, tablet, and mobile layouts |
| Migration / Regression | Verify data preservation and existing features |
| Performance Smoke | Verify dashboard and Ticket history requests return within an agreed local test threshold |
| End-to-End | Verify complete workflows through the running application |

## 3. Acceptance-Criterion Traceability

Initial status for all rows is Planned.

| Test ID | AC | Type | What It Tests | Expected Result | Test File | Status |
|---|---|---|---|---|---|---|
| API-01 | AC-01 | API | Create valid Action Taken | Saved under correct Ticket with authenticated performer | `server/tests/lab-04/actions-taken.api.test.ts` | Planned |
| API-02 | AC-02 | API | Update Action Taken | Updated values persist after reload | `server/tests/lab-04/actions-taken.api.test.ts` | Planned |
| AUTH-01 | AC-03 | Authorization | Requester attempts create/update | Write is rejected | `server/tests/lab-04/actions-taken.api.test.ts` | Planned |
| AUTH-02 | AC-04 | Authorization | Requester reads another user's action | Access is rejected | `server/tests/lab-04/actions-taken.api.test.ts` | Planned |
| API-03 | AC-05 | Integration | Ticket with zero, one, and multiple actions | All valid cases are handled | `server/tests/lab-04/actions-taken.api.test.ts` | Planned |
| API-04 | AC-06 | Validation | Follow-up required without a note | Request is rejected | `server/tests/lab-04/actions-taken.api.test.ts` | Planned |
| WF-01 | AC-07 | Workflow | Invalid status transition | Backend rejects transition | `server/tests/lab-04/ticket-workflow.api.test.ts` | Planned |
| WF-02 | AC-08 | Workflow | Requester resolution feedback | Status does not automatically become Resolved | `server/tests/lab-04/ticket-workflow.api.test.ts` | Planned |
| WF-03 | AC-09 | Concurrency | Submit stale Ticket update | Conflict is safely handled | `server/tests/lab-04/ticket-workflow.api.test.ts` | Planned |
| API-05 | AC-10 | API / Authorization | Requester dashboard scope | Only own Tickets are counted and returned | `server/tests/lab-04/requester-dashboard.api.test.ts` | Planned |
| API-06 | AC-11 | API | Staff dashboard calculations | Counts match database queries | `server/tests/lab-04/staff-dashboard.api.test.ts` | Planned |
| UI-01 | AC-12 | UI | Click dashboard metric or Ticket | Correct filtered view or detail opens | `client/.../lab-04/StaffDashboard.test.tsx` | Planned |
| UI-02 | AC-13 | UI | Empty dashboard response | Zero counts and helpful empty state appear | `client/.../lab-04/RequesterDashboard.test.tsx` | Planned |
| API-07 | AC-14 | Integration | Repeat create submission | No unintended duplicate record | `server/tests/lab-04/actions-taken.api.test.ts` | Planned |
| MIG-01 | AC-15 | Migration | Migrate representative existing data | Existing records remain valid | Migration verification procedure | Planned |
| REG-01 | AC-16 | Regression | Existing feature suites | Existing behavior remains correct | Existing test suites | Planned |
| UI-03 | AC-17 | Responsive / Accessibility | Major screens at multiple widths | No clipping; controls remain accessible | Lab 4 UI tests and visual checklist | Planned |

Replace any illustrative frontend test path with the actual path used by the
project before marking the plan complete.

## 4. API and Integration Tests

### Actions Taken

- Create a valid Action Taken.
- Reject missing Action Description or Result.
- Reject an invalid date/time.
- Require Follow-Up Note when Follow-Up Required is true.
- Confirm the authenticated user is saved as performer.
- Update permitted fields and confirm persistence.
- Confirm one Ticket can have zero, one, and multiple Actions Taken.
- Reject an Action Taken that does not belong to the requested Ticket.
- Return the correct response for a missing Ticket or action.
- Prevent Requester write access.
- Enforce Ticket access rules for IT Staff and Administrators.
- Return safe errors for unexpected failures.

### Ticket Workflow

- Test every approved transition in the transition matrix.
- Reject transitions that are not listed in the matrix.
- Verify role restrictions for each transition.
- Verify resolution prerequisites on the backend.
- Verify Requester feedback does not directly set Resolved.
- Verify stale updates return a conflict or are safely rejected.
- Verify successful transitions refresh the current Ticket status.

### Dashboards

- Verify each metric against direct database queries.
- Verify Requester ownership isolation.
- Verify current-user metrics use the authenticated user.
- Verify status and IT Priority grouping.
- Verify zero counts and empty lists.
- Verify ordering and list limits.
- Verify drill-down identifiers are correct.
- Verify the response does not expose an unnecessary full Ticket collection.

## 5. UI Component Tests

Planned coverage:
- `StaffDashboard.test.tsx`
- `RequesterDashboard.test.tsx`
- `ActionsTaken.test.tsx`
- `TicketWorkflow.test.tsx`

These names are proposed. Place the tests according to the existing client test
conventions and update this document to the real paths.

Tests should verify:
- Loading, success, empty, and error states.
- Metric labels and values.
- Dashboard navigation and drill-down.
- Action list display and ordering.
- Create and edit validation.
- Follow-Up Note conditional requirement.
- Read-only Requester behavior.
- Pending state prevents accidental repeated submission.
- Workflow controls match the available transitions.
- Conflict feedback preserves recoverable form input.

## 6. Responsive and Accessibility Tests

Check desktop, tablet, and mobile layouts for:
- No clipped metric cards or Ticket fields.
- No overlapping buttons or form controls.
- No unnecessary horizontal page scrolling.
- Readable status, priority, and action information.
- Visible keyboard focus.
- Accessible labels for form controls.
- Validation messages associated with the correct fields.
- Keyboard operation for menus, dialogs, and actionable cards.
- Status and priority information not communicated by color alone.

Record visual findings and attach screenshots under
`artifacts/lab-04/screenshots/`.

## 7. Migration and Regression Tests

- Apply the migration to a representative database copy.
- Confirm existing Users and Tickets remain available.
- Confirm existing Attachments, Public Comments, and Internal Notes remain valid.
- Confirm legacy Tickets with zero Actions Taken remain usable.
- Confirm the new relationship and indexes work.
- Confirm seed behavior is idempotent if the seed is executed in a controlled
  test database.
- Do not reset or reseed the working development database merely to run tests.
- Run the existing authentication, Requester, IT Staff, Administrator,
  attachment, comment, and note test suites.

## 8. End-to-End Tests

Proposed files:
- `e2e/lab-04/actions-taken-flow.spec.ts`
- `e2e/lab-04/ticket-resolution.spec.ts`
- `e2e/lab-04/dashboards.spec.ts`

### E2E-01: Actions Taken Flow

An authorized IT Staff user opens a Ticket, creates an Action Taken, confirms
the performer, updates the action, and sees the persisted result. A Requester
can view the action but cannot edit it.

### E2E-02: Ticket Resolution

An IT Staff user follows an allowed status transition. An invalid transition
is rejected. Requester resolution feedback does not automatically change the
Ticket status.

### E2E-03: Dashboards

A Requester sees only their own Ticket metrics. IT Staff see operational metrics
and current-user work. Dashboard links open the correct Ticket or filtered list.

## 9. Performance Smoke Tests

- Verify dashboard endpoints return summary data rather than full Ticket records.
- Check dashboard query behavior with representative data.
- Check Ticket Action Taken history retrieval with multiple records.
- Record observed response times and test conditions.
- Establish and document a local acceptance threshold before claiming a
  performance test passes.

## 10. Final Test Execution Record

Update this table after executing tests.

| Test Group | Command / Procedure | Actual Result | Status |
|---|---|---|---|
| Server tests | Existing server test command plus Lab 4 tests | Not run | Planned |
| Client tests | Existing client test command plus Lab 4 tests | Not run | Planned |
| Production build | Existing client and server build commands | Not run | Planned |
| E2E tests | Existing Playwright command plus Lab 4 tests | Not run | Planned |
| Migration verification | Apply migration to a representative test database | Not run | Planned |
| Responsive and accessibility review | Manual review and screenshots | Not run | Planned |
| Final regression | Existing regression suites | Not run | Planned |

Do not change Planned or Not run to Pass until the corresponding check succeeds.
Record any failures and fixes.

## 11. Definition of Test Completion

- [ ] Every acceptance criterion maps to at least one test.
- [ ] Required API and authorization tests pass.
- [ ] Workflow and conflict tests pass.
- [ ] Dashboard calculations match database queries.
- [ ] UI component and responsive checks pass.
- [ ] Migration preserves representative existing data.
- [ ] Existing regression suites pass.
- [ ] End-to-end tests pass.
- [ ] Final test results and actual test paths are recorded.