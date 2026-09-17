\# CPE 334 – Lab 3 UI Specification



\## 1. Purpose



This document defines the user interface requirements for Lab 3 of TokTickIT. The UI extends the Lab 2 ticketing system with real authentication, role-based navigation, IT Staff ticket handling, and Administrator user management.



The interface should keep the existing Zen Green visual style and remain usable on desktop, tablet, and smaller screens.



\---



\## 2. UI Design Principles



\* Use the existing TokTickIT Zen Green visual style.

\* Primary green: `#006B3C`

\* Secondary green: `#0B7A46`

\* Light green: `#EAF6EF`

\* Neutral background: `#F5F7F6`

\* Keep spacing, typography, buttons, inputs, tables, and cards visually consistent.

\* Prefer reusable UI components instead of creating different styles for each screen.

\* Clearly distinguish editable fields from read-only information.

\* Show useful feedback after actions.

\* Do not expose information or actions that the current user's role is not allowed to use.

\* Maintain keyboard accessibility and readable contrast.



\---



\## 3. Global Layout



Authenticated screens should contain:



\* TokTickIT application name/logo.

\* Current user's name.

\* Current user's role.

\* Navigation items allowed for the role.

\* Logout action.

\* Main page content.

\* Consistent page width and spacing.



The Development Requester selector from Lab 2 must no longer appear.



The authenticated user's identity comes from the server and must not be selected by the user.



\---



\## 4. Role-Based Navigation



\### Requester



Requester navigation should provide:



\* My Tickets

\* Create Ticket

\* Account/password action

\* Logout



Requester must not see:



\* IT Staff Queue

\* IT Staff ticket management actions

\* Internal Notes

\* User Management



\### IT Staff



IT Staff navigation should provide:



\* Ticket Queue

\* Account/password action

\* Logout



IT Staff may access ticket details and permitted ticket-management functions.



\### Administrator



Administrator navigation should provide:



\* User Management

\* Account/password action

\* Logout



Administrator access to other screens must follow the authorization rules defined by the API contract.



\---



\# 5. Login Screen



\## 5.1 Purpose



The Login screen allows an active user to authenticate using email and password.



\## 5.2 Elements



The screen should contain:



\* TokTickIT branding

\* Email input

\* Password input

\* Login button

\* Validation/error message area



\## 5.3 States



The screen must support:



\* Initial state

\* Entered values

\* Loading/submitting

\* Invalid credentials

\* Inactive account

\* Validation failure

\* Server failure



During login submission, the Login button should prevent accidental repeated submissions.



\## 5.4 Error Handling



Errors should be understandable without revealing sensitive authentication information.



For example, invalid credentials should not reveal whether a particular email exists.



\---



\# 6. Mandatory Password Change Screen



If the authenticated account has an initial password that must be changed, the user must be taken to the password-change screen before accessing normal application functions.



\## 6.1 Elements



\* Current/initial password

\* New password

\* Confirm new password

\* Change Password button

\* Logout option



\## 6.2 Validation



The UI should check:



\* Required fields

\* New password and confirmation match

\* Password requirements defined by the API contract

\* New password is not accepted when it violates server-side rules



The server remains responsible for final validation.



\## 6.3 Success



After a successful password change:



\* Show a success message or confirmation.

\* Refresh the authenticated user state if required.

\* Allow the user to continue to the appropriate role-specific screen.



\---



\# 7. Requester Screens



\## 7.1 My Tickets



The Lab 2 My Tickets functionality must continue to work using the authenticated Requester identity.



The screen should provide:



\* Ticket search

\* Category filter

\* Related System filter

\* Priority filter

\* Status filter

\* Sorting

\* Pagination

\* Create Ticket action

\* Ticket list/table

\* View Ticket action where supported



The Requester ID must not be displayed as a selectable control.



The current user's identity should be shown through the authenticated account information.



\## 7.2 Create Ticket



The existing Lab 2 Create Ticket interface should continue to support:



\* Summary

\* Description

\* Category

\* Related System

\* Requested Priority

\* Attachments where applicable

\* Submit action



The ticket owner/requester must be determined by the authenticated user.



The UI must not allow the Requester to select another user as the ticket owner.



\## 7.3 Requester Ticket Detail



The Requester can view their own tickets and permitted ticket information.



The screen should show:



\* Ticket number

\* Summary

\* Description

\* Category

\* Related System

\* Requested Priority

\* IT Priority when applicable

\* Current status

\* Ticket dates

\* Attachments where applicable

\* Public Comments

\* Problem Appears Resolved action when permitted



Internal Notes must never be displayed to Requesters.



\## 7.4 Public Comments



Requester can add a Public Comment to their ticket.



The UI should provide:



\* Comment text input

\* Submit button

\* Existing public comments

\* Author name

\* Timestamp



Empty or whitespace-only comments must be rejected.



Comments are append-only, so the UI does not provide edit or delete controls.



\## 7.5 Problem Appears Resolved



Requester may indicate that the problem appears resolved when allowed by the ticket state.



The UI should:



\* Clearly explain the action.

\* Prevent the Requester from directly changing the ticket to an administrative final status.

\* Show feedback after the action.

\* Refresh the ticket status/data when successful.



\---



\# 8. IT Staff Ticket Queue



\## 8.1 Purpose



The Ticket Queue provides IT Staff with a shared view of tickets requiring IT handling.



\## 8.2 Queue Elements



The screen should provide:



\* Search

\* Status filter

\* Requested Priority filter

\* IT Priority filter

\* Assignment/ownership filter

\* Sorting

\* Pagination

\* Ticket rows/cards



The exact supported query parameters must follow `api-spec.md`.



\## 8.3 Ticket Information



Each queue item should make important information easy to identify, including:



\* Ticket number

\* Summary

\* Requester

\* Requested Priority

\* IT Priority

\* Current Status

\* Assigned IT Staff

\* Last Updated



Use badges where useful for:



\* Status

\* Requested Priority

\* IT Priority

\* Assignment state



\## 8.4 Queue Actions



IT Staff should be able to open a ticket and perform actions permitted by the business rules.



The UI should not show unauthorized actions.



\## 8.5 Queue States



Support:



\* Loading

\* Loaded results

\* Empty queue

\* No search/filter results

\* Invalid filter/query

\* Forbidden

\* Server failure



Pagination controls should indicate the current page and available pages when pagination metadata is provided.



\---



\# 9. IT Staff Ticket Detail



\## 9.1 Purpose



The Ticket Detail screen allows IT Staff to inspect and manage a ticket according to their permissions.



\## 9.2 Ticket Information



Display:



\* Ticket number

\* Requester

\* Summary

\* Description

\* Category

\* Related System

\* Requested Priority

\* IT Priority

\* Current Status

\* Current owner

\* Created date

\* Updated date

\* Attachments

\* Public Comments

\* Internal Notes



\## 9.3 Assignment



The screen should show the current primary owner.



Permitted actions include:



\* Claim ticket

\* Assign ticket

\* Reassign ticket

\* Leave ticket unassigned when allowed



The UI should provide confirmation or clear success feedback after assignment changes.



\## 9.4 IT Priority



IT Staff may change IT Priority when permitted.



The UI should clearly distinguish:



\* Requested Priority — supplied by Requester and read-only

\* IT Priority — operational priority that IT Staff/Admin can change



Changing IT Priority must not change Requested Priority.



\## 9.5 Status



The UI should provide only status transitions permitted by the defined transition matrix.



The interface must:



\* Prevent invalid transitions.

\* Ask for confirmation where required.

\* Show validation errors.

\* Show success feedback after a successful update.



Requester-facing actions must not be presented as unrestricted status controls.



\## 9.6 Public Comments



IT Staff can:



\* View Public Comments

\* Add Public Comments



Comments are append-only.



\## 9.7 Internal Notes



IT Staff can:



\* View Internal Notes

\* Add Internal Notes



Internal Notes must be visually distinguished from Public Comments.



Internal Notes must never be displayed to Requesters.



Notes are append-only, so edit/delete controls are not provided.



\---



\# 10. Administrator User Management



\## 10.1 Purpose



User Management provides a minimal interface for Administrators to manage user accounts.



\## 10.2 User List



Display users with information such as:



\* Name

\* Email

\* Role

\* Active/inactive state

\* Relevant account state



The list should support:



\* Name/email search

\* Optional role filter



Pagination, multi-column sorting, and multiple simultaneous filters are not required unless explicitly implemented by the engineering contract.



\## 10.3 Create User



The Administrator can create a user with:



\* Name

\* Email

\* Role

\* Activation state where supported

\* Initial password behavior



The UI must allow only one role per user.



Roles:



\* Requester

\* IT Staff

\* Administrator



Duplicate email addresses must be rejected with a clear error.



\## 10.4 Edit User



The Administrator can update permitted user information such as:



\* Name

\* Email

\* Role

\* Active/inactive state



The UI should show validation and conflict errors returned by the server.



\## 10.5 Set New Initial Password



Administrator can set a new initial password for a user.



After this action, the user must be required to change the password at the next login.



The UI should provide success/failure feedback without displaying sensitive password information after submission.



\## 10.6 Account Protection Rules



The UI should prevent or clearly explain actions that the server rejects, including:



\* Administrator deactivating their own account.

\* Deactivating the last active Administrator.

\* Unauthorized users accessing User Management.



Server-side authorization remains authoritative.



\---



\# 11. Reusable UI Components



The implementation should reuse common components where practical.



Recommended reusable components include:



\* Button

\* Input

\* Select

\* Password Input

\* Badge

\* Modal/Confirmation Dialog

\* Error Message

\* Success Message

\* Loading Indicator

\* Empty State

\* Pagination

\* Ticket Card

\* Ticket Table

\* Comment List

\* Comment Form

\* Navigation/Header



Reusable components should keep the Zen Green appearance consistent across screens.



\---



\# 12. Feedback and UI States



Every important API-driven screen should provide meaningful states.



\## Loading



Show a clear loading indicator while waiting for data.



\## Saving



Disable the relevant action while a save operation is in progress when necessary.



\## Success



Show concise confirmation after important actions such as:



\* Login

\* Password change

\* Ticket update

\* Assignment

\* Priority update

\* Status update

\* Comment creation

\* User creation/update



\## Validation Error



Identify the relevant field or action and explain what needs to be corrected.



\## Empty State



Explain when there is currently no data.



\## No Results



Explain when a search/filter produces no matching results.



\## Forbidden



Show a clear message when the current user is not permitted to perform an action.



\## Failure



Show a useful error message without exposing server internals, passwords, tokens, or sensitive information.



\---



\# 13. Responsive Design



The application must support:



\* Desktop

\* Tablet

\* Smaller screens/mobile



\## Desktop



Tables can be used for Ticket Queue and User Management where sufficient horizontal space exists.



\## Smaller Screens



Tables should adapt using:



\* Responsive columns

\* Horizontal scrolling where appropriate

\* Card layouts

\* Stacked fields

\* Responsive action buttons



Important information and actions must remain accessible without requiring an excessively wide screen.



\---



\# 14. Accessibility



The UI should:



\* Use labels for form controls.

\* Support keyboard navigation.

\* Provide visible focus states.

\* Use buttons for actions rather than clickable non-button text where appropriate.

\* Provide understandable validation messages.

\* Avoid relying only on color to communicate status.

\* Maintain readable text contrast.

\* Provide meaningful button/action labels.



\---



\# 15. Security-Related UI Requirements



The UI must not be treated as the security boundary.



The frontend must not rely on hiding a button as the only authorization mechanism.



The backend must verify:



\* Authentication

\* Role permissions

\* Ticket ownership

\* Assignment permissions

\* Comment/note permissions

\* Administrator permissions



The frontend should still hide or disable actions that the user is not permitted to perform to provide a clear user experience.



Authentication/session credentials must not be stored in unsafe client-visible locations when the selected authentication design uses an HttpOnly session cookie.



\---



\# 16. Lab 2 Regression Requirements



The Lab 3 UI must preserve the working Lab 2 functionality.



The following must continue to work for authenticated Requesters:



\* My Tickets

\* Create Ticket

\* Ticket ownership

\* Ticket filtering/search/sorting

\* Attachment handling

\* Ticket viewing

\* Requested Priority

\* Existing category/system selections



The Development Requester selector and related temporary UI must be removed.



The authenticated user's identity replaces the Lab 2 Development Requester mechanism.



\---



\# 17. UI Acceptance Criteria



\### UI-AC-01 — Login



A user can enter valid credentials and reach the correct role-specific application screen.



\### UI-AC-02 — Mandatory Password Change



A user with an initial password cannot access normal application screens until the password is changed.



\### UI-AC-03 — Role Navigation



Navigation displays only the functions appropriate to the authenticated user's role.



\### UI-AC-04 — Requester Regression



An authenticated Requester can continue to use My Tickets and Create Ticket without selecting a Development Requester.



\### UI-AC-05 — Requester Comments



A Requester can view and add Public Comments but cannot view Internal Notes.



\### UI-AC-06 — IT Staff Queue



An IT Staff user can view the Ticket Queue and use the supported search/filter/sort/pagination functions.



\### UI-AC-07 — IT Staff Detail



An IT Staff user can view ticket details and perform permitted assignment, IT Priority, status, Public Comment, and Internal Note actions.



\### UI-AC-08 — Administrator User Management



An Administrator can list, search, create, and update users according to the defined business rules.



\### UI-AC-09 — Password Reset by Administrator



An Administrator can set a new initial password and the affected user is required to change it at next login.



\### UI-AC-10 — Protected UI



Unauthorized functions are not presented as available actions, and unauthorized API operations are handled with appropriate feedback.



\### UI-AC-11 — Responsive Layout



Login, Requester, IT Staff, and Administrator screens remain usable on desktop, tablet, and smaller screens.



\### UI-AC-12 — Consistent Design



Lab 3 screens use the existing Zen Green design language and reusable UI components.



\### UI-AC-13 — Accessibility



Important forms and actions are keyboard accessible, clearly labelled, and provide understandable feedback.



\---



\# 18. UI Definition of Done



The UI work is complete when:



\* All required Lab 3 screens are implemented.

\* Development Requester selection is removed.

\* Authentication state is represented correctly.

\* Role-specific navigation is implemented.

\* Requester Lab 2 regression works.

\* IT Staff Queue is implemented.

\* IT Staff Ticket Detail is implemented.

\* Public Comments and Internal Notes are visually separated.

\* Administrator User Management is implemented.

\* Loading, empty, error, forbidden, validation, and success states are handled.

\* Responsive layouts work on desktop and smaller screens.

\* Zen Green styling is consistent.

\* Accessibility requirements are addressed.

\* UI tests and relevant E2E tests are planned/implemented according to `tests.md`.

\* No unauthorized action is trusted solely because the frontend hides it.



