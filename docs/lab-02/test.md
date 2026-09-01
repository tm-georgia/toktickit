# Lab 2 Test Plan and Results

## 1. Test Strategy

Lab 2 uses a layered testing strategy.

- Unit tests verify isolated business logic such as Ticket Number generation and validation.
- API/integration tests verify REST endpoints, database behavior, validation, ownership, and Attachment rules.
- UI component tests verify form behavior, validation, loading, success, failure, and user interactions.
- Responsive and visual tests verify desktop, tablet, and mobile behavior.
- E2E tests verify complete Requester workflows across frontend and backend.

Tests are planned from the Acceptance Criteria before implementation.

No required test should be skipped, disabled, or accepted as passing when it is unrelated to the requirement.

---

## 2. Planned Tests

| Test ID | Type | Requirement / AC | What It Tests | Expected Result | Automated Test File |
|---|---|---|---|---|---|
| UNIT-01 | Unit | BR-01, AC-04 | Ticket Number generator | Generates unique `TCK-YYYYMMDD-NNNN` formatted number | server/tests/lab-02/ticket-number.test.ts |
| UNIT-02 | Unit | BR-14, BR-15 | Summary/Description validation | Values outside character limits rejected after trimming | server/tests/lab-02/validation.test.ts |
| UNIT-03 | Unit | BR-26, BR-27 | Attachment validation | Invalid MIME types, extensions, or sizes > 5 MB rejected | server/tests/lab-02/attachment-validation.test.ts |
| API-01 | API | AC-01 | Get active Requesters | 200 OK returning only active Development Requesters | server/tests/lab-02/requesters.api.test.ts |
| API-02 | API | AC-04 | Create valid Ticket | 201 Created, ticket saved with official number | server/tests/lab-02/create-ticket.api.test.ts |
| API-03 | API | AC-05 | Ticket defaults | Backend generates creation date and status `NEW` | server/tests/lab-02/create-ticket.api.test.ts |
| API-04 | API | AC-06 | Invalid Ticket input | 400 Bad Request with field validation errors | server/tests/lab-02/create-ticket.api.test.ts |
| API-05 | API | AC-07 | Duplicate create | Duplicate submission rejected while processing | server/tests/lab-02/create-ticket.api.test.ts |
| API-06 | API | AC-08 | Create API failure | 500 returns safe error without leaking details | server/tests/lab-02/create-ticket.api.test.ts |
| API-07 | API | AC-09 | Requester ticket ownership | Only tickets matching `X-Requester-Id` returned | server/tests/lab-02/my-tickets.api.test.ts |
| API-08 | API | AC-10 | Ticket search | Case-insensitive search on number and summary works | server/tests/lab-02/my-tickets.api.test.ts |
| API-09 | API | AC-11 | Ticket filtering | Category, system, priority, and status filters work | server/tests/lab-02/my-tickets.api.test.ts |
| API-10 | API | AC-12 | Ticket sorting | Default sort `updatedAt:desc` and custom sorts work | server/tests/lab-02/my-tickets.api.test.ts |
| API-11 | API | AC-13 | Ticket pagination | Returns requested page with default size 10 and metadata | server/tests/lab-02/my-tickets.api.test.ts |
| API-12 | API | AC-16 | Ticket ownership rejection | Accessing another requester's ticket returns 404 Not Found | server/tests/lab-02/ticket-detail.api.test.ts |
| API-13 | API | AC-17 | Valid Attachment upload | 201 Created and attachment metadata stored | server/tests/lab-02/attachments.api.test.ts |
| API-14 | API | AC-18 | Invalid Attachment type | 400 Bad Request on invalid file format | server/tests/lab-02/attachments.api.test.ts |
| API-15 | API | AC-18 | Oversized Attachment | 400 Bad Request on file > 5 MB | server/tests/lab-02/attachments.api.test.ts |
| API-16 | API | AC-19 | Attachment limit | 400 Bad Request on 6th active attachment | server/tests/lab-02/attachments.api.test.ts |
| API-17 | API | AC-20 | Download active Attachment | 200 OK binary stream with disposition headers | server/tests/lab-02/attachments.api.test.ts |
| API-18 | API | AC-21 | Soft remove Attachment | 200 OK with `removedAt` timestamp and reason saved | server/tests/lab-02/attachments.api.test.ts |
| API-19 | API | AC-22 | Removed download | 404 Not Found when downloading soft-removed file | server/tests/lab-02/attachments.api.test.ts |
| API-20 | API | AC-23 | Attachment ownership | 404 Not Found when accessing another user's attachment | server/tests/lab-02/attachments.api.test.ts |
| UI-01 | UI | AC-01 | Requester selector | Active Requesters displayed in dropdown | client/tests/lab-02/RequesterSelection.test.tsx |
| UI-02 | UI | AC-02 | No Requester selected | Ticket navigation blocked until selection | client/tests/lab-02/RequesterSelection.test.tsx |
| UI-03 | UI | AC-03 | Change Requester | Context updates and shell reflects new requester | client/tests/lab-02/RequesterSelection.test.tsx |
| UI-04 | UI | AC-06 | Create validation | Inline field error messages display | client/tests/lab-02/CreateTicket.test.tsx |
| UI-05 | UI | AC-07 | Submit busy state | Submit button disabled and busy spinner displayed | client/tests/lab-02/CreateTicket.test.tsx |
| UI-06 | UI | AC-08 | API failure | Error message shown and form inputs preserved | client/tests/lab-02/CreateTicket.test.tsx |
| UI-07 | UI | AC-04 | Create success | Official Ticket Number displayed with nav actions | client/tests/lab-02/CreateTicket.test.tsx |
| UI-08 | UI | AC-09 | My Tickets | Only current Requester's tickets rendered | client/tests/lab-02/MyTickets.test.tsx |
| UI-09 | UI | AC-14 | Empty state | Friendly message and Create Ticket button shown | client/tests/lab-02/MyTickets.test.tsx |
| UI-10 | UI | AC-15 | No-results state | No-results message and Clear Filters button shown | client/tests/lab-02/MyTickets.test.tsx |
| UI-11 | UI | AC-10, AC-11 | Search/filter controls | List updates dynamically on search/filter | client/tests/lab-02/MyTickets.test.tsx |
| UI-12 | UI | AC-12, AC-13 | Sort/pagination | Sorting and page changes update table correctly | client/tests/lab-02/MyTickets.test.tsx |
| UI-13 | UI | AC-17 | Attachment upload UI | File picker on Ticket Detail uploads valid file | client/tests/lab-02/AttachmentSection.test.tsx |
| UI-14 | UI | AC-18 | Invalid Attachment UI | Clear file format/size error shown | client/tests/lab-02/AttachmentSection.test.tsx |
| UI-15 | UI | AC-21 | Removal UI | Removal dialog prompts for non-empty reason | client/tests/lab-02/AttachmentSection.test.tsx |
| UI-16 | UI | AC-22 | Removed Attachment | Displays removed state and disables download | client/tests/lab-02/AttachmentSection.test.tsx |
| STYLE-01 | UI Style | AC-24, AC-25 | Form styles | Zen Green tokens, focus rings, and badges correct | client/tests/lab-02/ui-style.test.tsx |
| STYLE-02 | Responsive | AC-24 | Desktop | Table layout and navigation without clipping | e2e/lab-02/responsive.spec.ts |
| STYLE-03 | Responsive | AC-24 | Tablet | Two-column form and layout remain usable | e2e/lab-02/responsive.spec.ts |
| STYLE-04 | Responsive | AC-24 | Mobile | Form stacks and no horizontal scrolling | e2e/lab-02/responsive.spec.ts |
| E2E-01 | E2E | AC-01, AC-04 | Complete ticket creation | End-to-end requester ticket creation flow | e2e/lab-02/requester-ticket-flow.spec.ts |
| E2E-02 | E2E | AC-09, AC-10 | My Tickets workflow | Ticket search, filter, and view flow | e2e/lab-02/requester-ticket-flow.spec.ts |
| E2E-03 | E2E | AC-03, AC-09 | Requester switching | Switching reloads requester-specific list | e2e/lab-02/requester-ticket-flow.spec.ts |
| E2E-04 | E2E | AC-17, AC-20, AC-21, AC-22 | Attachment lifecycle | Upload, download, and soft removal with reason | e2e/lab-02/requester-ticket-flow.spec.ts |
| E2E-05 | E2E | AC-24 | Responsive screens | All views responsive at desktop, tablet, mobile | e2e/lab-02/responsive.spec.ts |

---

## 3. Acceptance-Criterion Traceability

| Acceptance Criterion | Planned Tests |
|---|---|
| AC-01 | API-01, UI-01 |
| AC-02 | UI-02 |
| AC-03 | UI-03, E2E-03 |
| AC-04 | API-02, UI-07, E2E-01 |
| AC-05 | API-03 |
| AC-06 | UNIT-02, API-04, UI-04 |
| AC-07 | API-05, UI-05 |
| AC-08 | API-06, UI-06 |
| AC-09 | API-07, UI-08, E2E-02, E2E-03 |
| AC-10 | API-08, UI-11, E2E-02 |
| AC-11 | API-09, UI-11 |
| AC-12 | API-10, UI-12 |
| AC-13 | API-11, UI-12 |
| AC-14 | UI-09 |
| AC-15 | UI-10 |
| AC-16 | API-12 |
| AC-17 | API-13, UI-13, E2E-04 |
| AC-18 | UNIT-03, API-14, API-15, UI-14 |
| AC-19 | API-16 |
| AC-20 | API-17, E2E-04 |
| AC-21 | API-18, UI-15, E2E-04 |
| AC-22 | API-19, UI-16, E2E-04 |
| AC-23 | API-20 |
| AC-24 | STYLE-02, STYLE-03, STYLE-04, E2E-05 |
| AC-25 | STYLE-01 |

---

## 4. Responsive and Visual Checklist

### Zen Green Theme

- [ ] Primary green #006B3C used for header and primary actions.
- [ ] Secondary green #0B7A46 used for links/focus/active states.
- [ ] Pale green #EAF6EF used for selected/success emphasis.
- [ ] Background uses #F5F7F6 or similar.
- [ ] Cards use white surfaces with subtle borders.
- [ ] Text is dark charcoal-green.
- [ ] Read-only fields are visually distinct.
- [ ] Error fields have clear red border/text.
- [ ] Warning messages use warning styling appropriately.
- [ ] Success messages do not rely on color alone.

### Form

- [ ] Labels appear above controls.
- [ ] Required fields have red asterisks.
- [ ] Validation messages appear beside/below relevant fields.
- [ ] Focus indicators are visible.
- [ ] Submit button has visible text.
- [ ] Submit button is disabled while submitting.
- [ ] Busy state is visible.

### Responsive

- [ ] Desktop ≥ 992px checked.
- [ ] Tablet 768–991px checked.
- [ ] Mobile < 768px checked.
- [ ] No horizontal page scrolling.
- [ ] No clipped labels.
- [ ] No overlapping validation messages.
- [ ] Buttons remain touch-friendly.
- [ ] Attachment filenames remain readable.
- [ ] My Tickets table/card remains usable.

### Accessibility

- [ ] Keyboard navigation works.
- [ ] Form controls have labels.
- [ ] Icon-only controls have accessible labels.
- [ ] Tooltips exist where required.
- [ ] Color is not the only indication of state.

---

## 5. Test Commands

Commands will be documented according to the final project package configuration.

Expected commands include:

```bash
npm test
```