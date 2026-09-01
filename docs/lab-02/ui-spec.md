# Lab 2 Zen Green UI Specification

## 1. UI Goals

The Lab 2 interface must provide a consistent, professional, responsive Requester experience.

The same visual language must be reused across:

- Development Requester Selection
- Create Ticket
- My Tickets
- Requester Ticket Detail
- Attachment controls

---

## 2. Color Tokens

| Token | Value | Usage |
|---|---|---|
| Primary Green | #006B3C | Header, primary buttons, strong emphasis |
| Secondary Green | #0B7A46 | Links, active tabs, focus accents, hover |
| Pale Green | #EAF6EF | Selected areas and success emphasis |
| Page Background | #F5F7F6 | Main page background |
| Surface | #FFFFFF | Cards and forms |
| Text | Dark charcoal-green | Main text |
| Read-only | Soft gray-green/warm ivory | Read-only fields |
| Error | Dark red | Error text and borders |
| Warning | Amber | Warning messages |

Color must never be the only way to communicate state.

---

## 3. Typography and Spacing

- Use a clean sans-serif font.
- Page title is visually prominent.
- Section titles are clearly separated.
- Labels are consistent in weight.
- Form controls use consistent height.
- Description is taller than normal inputs.
- Use consistent spacing between fields.
- Content is centered with a sensible maximum width.

---

## 4. Application Shell

The application shell contains:

- TokTickIT identity
- My Tickets navigation
- Create Ticket navigation
- Current Development Requester name
- Change Requester action

The active page must be visually indicated.

Mobile navigation must remain accessible and usable.

---

## 5. Development Requester Selection Screen

### Required Elements

- TokTickIT title
- Explanation that the selector is for Lab 2 testing only
- Development Requester dropdown
- Continue button

Suggested text:

> Select a Development Requester to test requester-specific ticket behavior. This is not a login screen. Authentication and role-based access will be introduced in Lab 3.

### States

#### Loading
Display a clear loading indicator while Requesters are retrieved.

#### Success
Display active Requesters in the dropdown.

#### Empty
Display:
> No active Development Requesters are available.

Do not allow Continue.

#### Failure
Display a useful error message and allow retry.

### Behavior

- Only active Requesters are shown.
- Continue is disabled until a Requester is selected.
- After selection, the application shell stores the requester context and shows the Requester's name.
- Change Requester returns to the selector.
- Changing Requester reloads Requester-specific data.

---

## 6. Create Ticket Screen

## Layout

### Top Section
Display read-only/system-generated information:

- Ticket Number ("Generated after submission")
- Ticket Date ("Generated after submission")
- Requester (Read-only, displays the active Development Requester name)

### Classification Section
- Category (dropdown populated from active categories)
- Related System (dropdown populated from active related systems)
- Requested Priority (radio buttons or select: LOW, MEDIUM, HIGH)

### Main Information
- Summary (text input, 5–200 characters)
- Description (multiline textarea, 10–2000 characters)

*(Note: File attachments are managed on the Ticket Detail screen after the ticket is created).*

### Actions

Primary:
- Create Ticket

Secondary:
- Cancel / Clear

---

## 7. Form Rules

- Labels appear above controls.
- Required fields display a red asterisk (*).
- Validation messages appear immediately below the relevant field.

Required fields:
- Category
- Related System
- Summary (5–200 characters after trimming)
- Description (10–2000 characters after trimming)
- Requested Priority (LOW, MEDIUM, HIGH)

---

## 8. Create Ticket States

### Initial
Display empty form with default priority (or unselected) and loaded reference data.

### Loading Reference Data
Show loading indicators while Categories and Related Systems are retrieved.

### Validation Failure
Show field-level errors immediately under invalid fields.
Do not submit the API request when client-side validation fails.

### Submitting
- Submit button becomes disabled.
- Button displays a busy indicator/text.
- Form fields are disabled to prevent duplicate submission.

### Success
Show:
> Ticket created successfully.

Display the official backend-generated Ticket Number (`TCK-YYYYMMDD-NNNN`) prominently.

Provide navigation actions:
- View Ticket (navigates to Ticket Detail)
- My Tickets (navigates to My Tickets list)
- Create Another Ticket (resets form)

### API Failure
Show a safe error message.
Preserve entered form values so the Requester can fix errors and retry.

---

## 9. Attachment UI (Ticket Detail Screen)

Attachments are uploaded and managed on the Ticket Detail screen once a ticket exists.

### Rules & Limits
- Allowed formats: JPG, JPEG, PNG, WEBP, PDF
- Maximum size: 5 MB per file
- Active attachment limit: Maximum 5 active attachments per ticket

### Attachment Components & States

#### Empty
When no attachments exist:
> No attachments uploaded for this ticket.

#### Upload Control
- File picker with accepted file format restriction (`.jpg,.jpeg,.png,.webp,.pdf`).
- Disabled when ticket already has 5 active attachments.
- Shows file size and type preview before upload.

#### Invalid File State
- Show clear inline error near the attachment control if file exceeds 5 MB or uses an unsupported type.
- Do not call upload API.

#### Uploading State
- Show progress/busy spinner and disable upload button.
- Prevent duplicate uploads.

#### Active Attachment Card / Row
- Original filename
- File MIME type badge / icon
- Formatted file size (e.g., `245 KB`, `1.2 MB`)
- Upload timestamp
- Download button / link
- Remove button (triggers soft removal modal)

#### Attachment Removal Modal / Confirmation
- Displays confirmation prompt.
- Requires non-empty removal reason text input (minimum 1 character).
- Confirm Remove action triggers soft-delete API.

#### Soft-Removed Attachment Card / Row
- Displays filename and metadata.
- Visually styled with muted/soft-gray background and "Removed" badge.
- Displays removal reason and removal timestamp.
- Download and Preview buttons are permanently disabled.

---

## 10. My Tickets Screen

### Required Controls
- Search field (case-insensitive on Ticket Number and Summary)
- Category filter (All + active categories)
- Related System filter (All + active related systems)
- Requested Priority filter (All, LOW, MEDIUM, HIGH)
- Current Status filter (All, NEW)
- Sort control (Last Updated descending by default, Ticket Date, Ticket Number, Priority)
- Clear Filters action
- Pagination controls (Page size selector: 10 [default], 20, 50; Next/Previous page buttons; Page indicator)
- Create Ticket button

### Desktop Layout ($\ge 992\text{px}$)
Use a structured table with columns:
1. Ticket Number
2. Summary
3. Category
4. Related System
5. Requested Priority
6. Current Status
7. Last Updated
8. Actions (View Ticket)

### Mobile / Tablet Layout ($< 992\text{px}$)
Use responsive cards displaying ticket summary, status/priority badges, category, last updated date, and a prominent View action without horizontal scroll.

---

## 11. My Tickets States

### Loading
Display centered spinner / loading indicator.

### Empty
When the active Requester has no tickets:
> You have no tickets yet.
Display a prominent "Create Ticket" action button.

### No Results
When search or active filters match no tickets:
> No tickets match your search or filters.
Provide a "Clear Filters" button.

### Error
Display a safe API error message and a "Retry" button.

---

## 12. Ticket Detail Screen

Ticket information is read-only for the Requester.

### Displayed Information
- Ticket Number (prominent header)
- Ticket Date
- Requester Name and Email
- Category Name
- Related System Name
- Summary
- Description (full multiline display)
- Requested Priority badge
- Current Status badge
- Created Date & Last Updated timestamps
- Attachments Section (see Section 9)

### Excluded Controls
- No comments, internal notes, or status transition controls (excluded in Lab 2 scope).

---

## 13. Ticket Detail States

### Loading
Display loading skeleton or spinner.

### Success
Display complete Ticket details and Attachment management section.

### Not Found / Access Denied
If the ticket ID does not exist or belongs to a different Development Requester:
- Display safe error banner: `Ticket not found or access denied.`
- Do not expose any confidential ticket information.
- Provide a "Back to My Tickets" navigation link.

---

## 14. Badges

### Requested Priority Badges
- `LOW`: Subtle gray/green tone with clear "LOW" text.
- `MEDIUM`: Balanced amber/blue tone with clear "MEDIUM" text.
- `HIGH`: Prominent red/coral accent with clear "HIGH" text.

### Current Status Badges
- `NEW`: Zen Green themed badge `#006B3C` with clear "NEW" text.

Badges must have readable text and never rely solely on color.

---

## 15. Buttons and Interactive States

- **Primary**: Zen Green background `#006B3C`, white text (Create Ticket, Submit, Confirm).
- **Secondary**: Neutral surface `#FFFFFF`, secondary border `#0B7A46`, green text (Cancel, Back, Clear).
- **Destructive**: Soft red background/border with red text (Remove Attachment).
- **Disabled**: Dimmed background `#E0E0E0`, dark gray text, `cursor: not-allowed`, cannot be clicked.
- **Busy**: Replaces text with a spinner and "Saving..." / "Uploading...", disabled to prevent re-triggering.

---

## 16. Responsive Rules

### Desktop ($\ge 992\text{px}$)
- Centered container layout (max-width $1140\text{px}$).
- Multi-column grid for ticket details and forms.
- Full table for My Tickets.

### Tablet ($768\text{--}991\text{px}$)
- Two-column responsive form layout.
- Summary and Description remain fully readable.

### Mobile ($< 768\text{px}$)
- Single-column stacked form fields.
- Buttons stretch to full width or comfortable touch targets ($\ge 44\text{px}$).
- Ticket list switches to structured cards.
- Strict prevention of horizontal viewport scrolling ($x$-overflow hidden/wrapped).

---

## 17. Accessibility Requirements

- Every form control has a linked `<label>` via `htmlFor`.
- Required fields use both a visible red asterisk (`*`) and `aria-required="true"`.
- Focus outlines use `#0B7A46` and are clearly visible on keyboard tab navigation.
- Error messages use `role="alert"` and are positioned immediately beneath their input.
- Status and priority badges contain readable text labels.
- Destructive actions require explicit confirmation dialogs.

---

## 18. Visual Inspection Checklist

Before final submission verify:
- [ ] Zen Green colors match design tokens (`#006B3C`, `#0B7A46`, `#EAF6EF`, `#F5F7F6`).
- [ ] Header and navigation correctly highlight active screen.
- [ ] Requester name is displayed in the header with a "Change" button.
- [ ] Editable inputs are visually distinct from read-only display fields.
- [ ] Required fields display red asterisks and inline errors on invalid submission.
- [ ] Submit button displays busy state and prevents duplicate clicks.
- [ ] Empty and no-results states render friendly messages and actions.
- [ ] Attachment upload respects 5 MB size and 5-file limit.
- [ ] Attachment removal prompts for removal reason and displays removed state.
- [ ] Soft-removed attachments disable download and preview.
- [ ] No horizontal scrolling occurs on mobile ($< 768\text{px}$).

---

## 19. Screenshot Storage Directory

Screenshots for sprint deliverables shall be saved to:

```
artifacts/lab-02/screenshots/
  ├── requester-selector/
  ├── create-ticket/
  ├── my-tickets/
  ├── ticket-detail/
  └── responsive/ (desktop, tablet, mobile)
```