# TokTickIT Lab 4 UI Specification

## 1. Design Goal

Extend the existing TokTickIT interface using the Zen Green design language.
Lab 4 screens must feel consistent with the existing application instead of
introducing a separate visual style.

## 2. Design Principles

- Use the existing application shell, navigation, typography, buttons, forms,
  tables, badges, cards, and feedback patterns where practical.
- Use the existing Zen Green palette, including the established green theme.
- Keep dashboards concise and focused on actions users need to take.
- Use clear labels and do not communicate status through color alone.
- Preserve visible keyboard focus and semantic labels.
- Avoid clipped text, overlapping controls, and unnecessary horizontal scrolling.
- Reuse existing components before introducing new components.

## 3. Role Navigation

### Requester

- Dashboard
- My Tickets
- Existing Ticket Detail and permitted Requester features

### IT Staff

- Dashboard
- Ticket Queue
- Ticket Detail
- Existing staff features, including permitted comments and internal notes

### Administrator

- Dashboard and authorized staff functions
- Existing Administrator user-management functions

The navigation must follow the application's existing authentication and role
rules. A user must not gain access merely because a navigation item is visible.

## 4. IT Staff Dashboard

### 4.1 Layout

1. Page title: `IT Staff Dashboard`
2. Short description of the operational overview.
3. Metric cards.
4. Recent or urgent Ticket list.
5. Loading, empty, and error feedback.

### 4.2 Metric Cards

Display:
- Unassigned Tickets
- My Tickets
- Tickets by Status
- Tickets by IT Priority

The displayed values must come from the dashboard API. Do not calculate
authoritative counts only in React.

### 4.3 Recent Ticket List

Show a concise set of recent or urgent Tickets. Reuse the existing Ticket
number, title, status, priority, and update-date conventions where available.

Each clickable row or Ticket number must open the correct Ticket or filtered
queue. Do not make a decorative row look clickable if it has no action.

### 4.4 States

- Loading: show the application's existing loading indicator or skeleton.
- Empty: explain that there are no matching Tickets.
- Forbidden: show a safe access message.
- Failure: show a concise error and a retry action where appropriate.
- Success: show current metric values and actionable Ticket items.

## 5. Requester Dashboard

### 5.1 Layout

1. Page title: `My Dashboard`
2. Personal Ticket metric cards.
3. Recently updated Tickets.
4. Recently resolved Tickets.
5. Tickets requiring the Requester's attention.

### 5.2 Metric Cards

Display:
- Open Tickets
- Waiting for Requester
- Recently Updated
- Recently Resolved

The backend must scope every metric and list to the authenticated Requester.
The frontend must not accept a client-supplied Requester ID as proof of ownership.

### 5.3 Ticket Items

Show useful Ticket details using existing application conventions. Each actionable
item must navigate to the corresponding Ticket Detail or filtered My Tickets view.

The dashboard is a summary and must not duplicate all filters and controls from
the full My Tickets page.

### 5.4 States

- Loading: use a consistent loading indicator.
- Empty: explain that no matching Tickets were found.
- Failure: display a safe error message and preserve usable navigation.
- Success: show only the authenticated Requester's data.

## 6. Actions Taken on IT Staff Ticket Detail

Add an `Actions Taken` section to the existing IT Staff Ticket Detail screen.

### 6.1 List View

Display each action with:
- Action Date/Time
- Action Description
- Result
- Performed By
- Follow-Up Required
- Follow-Up Note when applicable
- Attachment Notes when applicable
- Edit control for authorized users

Order the list consistently by Action Date/Time, newest first, unless the
approved implementation specifies another order. Use a stable secondary
ordering when timestamps are equal.

An empty list should display a helpful message, not an error.

### 6.2 Create Mode

Authorized IT Staff and Administrators can create an Action Taken.

Fields:
- Action Date/Time
- Action Description
- Result
- Follow-Up Required checkbox or switch
- Follow-Up Note
- Attachment Notes

Performed By must be shown as the authenticated user or a read-only value
derived from the authenticated session. Do not allow the client to select
another performer.

When Follow-Up Required is enabled, Follow-Up Note becomes required.
Validation messages must appear near the related fields.

### 6.3 View/Edit Mode

Authorized IT Staff and Administrators can edit permitted Action Taken fields.
Requesters cannot see edit controls.

The UI must show a saving state and prevent accidental repeated submissions.
On a recoverable error, preserve the user's entered values where possible.

### 6.4 Success and Failure Feedback

- Success: confirm that the action was saved.
- Validation failure: show field-level messages.
- Forbidden: explain that the user is not permitted to perform the operation.
- Not found: explain that the Ticket or Action Taken could not be found.
- Conflict: ask the user to refresh and review the latest data.
- Network/server failure: preserve entered values and provide a safe retry path.

## 7. Actions Taken on Requester Ticket Detail

Requesters may view Actions Taken associated with their own Tickets.

- Show action information in read-only mode.
- Do not show create, edit, delete, or assignment controls.
- Do not expose internal-only content through the Actions Taken section.
- Enforce ownership and authorization on the backend as well as in the UI.

## 8. Ticket Workflow Controls

Show only the status transitions permitted for the user's role and the current
Ticket status.

- Display the current status clearly.
- Explain the intended action with understandable button or menu labels.
- Require confirmation for destructive or difficult-to-reverse actions where
  appropriate.
- Disable the submit control while a status update is in progress.
- Refresh the Ticket summary after a successful transition.
- On a conflict, preserve the page and prompt the user to reload the latest state.

Requester resolution feedback must be visually distinct from the formal Ticket
status. It must not imply that the Ticket has been resolved before an authorized
status transition succeeds.

## 9. Responsive Behavior

### Desktop

- Use a balanced card layout.
- Keep metric cards aligned.
- Allow Ticket tables to use available width without clipping important actions.

### Tablet

- Reduce the number of cards per row.
- Allow lists and forms to wrap.
- Keep important controls visible and reachable.

### Mobile

- Stack metric cards vertically or in a compact grid.
- Stack form labels and fields where needed.
- Avoid page-level horizontal scrolling.
- Ensure buttons and interactive targets are easy to tap.
- Keep Ticket number, status, and important actions readable.
- If a table cannot fit, use a responsive list/card layout rather than clipping data.

## 10. Accessibility Checklist

- [ ] All form controls have meaningful labels.
- [ ] Keyboard users can reach all interactive controls.
- [ ] Focus indicators are visible.
- [ ] Status and priority are not communicated through color alone.
- [ ] Text and controls have sufficient contrast.
- [ ] Validation errors are associated with the relevant fields.
- [ ] Loading and success/error feedback is perceivable.
- [ ] Dialogs, if used, support keyboard interaction and focus management.
- [ ] Interactive rows and links have clear accessible names.
- [ ] No important content is clipped at desktop, tablet, or mobile widths.
- [ ] No unnecessary horizontal page scrolling occurs.

## 11. Visual Verification

Capture screenshots for:
- IT Staff Dashboard
- Requester Dashboard
- Actions Taken list and create/edit modes
- Requester read-only Actions Taken
- Ticket workflow controls
- Desktop, tablet, and mobile layouts

Store screenshots under `artifacts/lab-04/screenshots/` in the appropriate
screen folders. Screenshots must represent the real running application.