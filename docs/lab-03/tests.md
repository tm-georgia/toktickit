\# CPE 334 – Lab 3 Test Design Document



\## 1. Purpose



This document defines the planned tests for the TokTickIT Lab 3 increment.



The tests verify the requirements in the Lab 3 Engineering Contract, including:



\* Authentication and logout

\* Mandatory initial password change

\* Role-based authorization

\* Migration from Development Requester to authenticated User

\* Requester ownership and Lab 2 regression

\* IT Staff Ticket Queue and Ticket Detail

\* Ticket assignment and IT Priority

\* Ticket status transitions

\* Public Comments and Internal Notes

\* Administrator User Management

\* Database migration and seed data

\* Zen Green UI and responsive behavior

\* End-to-end workflows



Tests will be implemented before or alongside the corresponding implementation work.



\---



\# 2. Test Levels



The project will use the following test levels:



1\. \*\*Unit tests\*\* for isolated business logic and validation.

2\. \*\*API integration tests\*\* for authentication, authorization, ownership, Ticket operations, comments, notes, and User Management.

3\. \*\*UI component tests\*\* for required Lab 3 screens and interaction states.

4\. \*\*Security/authorization tests\*\* for server-side protection and ownership.

5\. \*\*Migration/regression tests\*\* for preserving Lab 2 functionality and data.

6\. \*\*Responsive/style tests\*\* for Zen Green UI and smaller screens.

7\. \*\*End-to-end tests\*\* for complete user workflows.



The server-side authorization tests are especially important because hiding a frontend control is not sufficient to enforce permission.



\---



\# 3. Required Test Files



The Lab 3 server tests will be organized as:



```text

server/tests/lab-03/

├── auth.api.test.ts

├── authorization.api.test.ts

├── staff-queue.api.test.ts

├── staff-ticket-detail.api.test.ts

├── comments-notes.api.test.ts

└── users-admin.api.test.ts

```



The Lab 3 client tests will include:



```text

client/.../lab-03/

├── Login.test.tsx

├── ChangePassword.test.tsx

├── StaffTicketQueue.test.tsx

├── StaffTicketDetail.test.tsx

└── UserManagement.test.tsx

```



End-to-end tests:



```text

e2e/lab-03/

├── authentication.spec.ts

├── staff-ticket-flow.spec.ts

└── user-administration.spec.ts

```



\---



\# 4. Test Data and Seed Requirements



The local seed must provide enough data to test all required roles and account states.



\## 4.1 Requesters



Seed at least:



\* 4 active Requesters

\* 1 inactive Requester



\## 4.2 IT Staff



Seed at least:



\* 3 active IT Staff

\* 1 inactive IT Staff



\## 4.3 Administrators



Seed at least:



\* 1 active Administrator



\## 4.4 Tickets



Seed Tickets covering:



\* Multiple Requesters

\* Different requested priorities

\* Different IT priorities

\* Multiple allowed statuses

\* Assigned Tickets

\* Unassigned Tickets

\* Tickets with Public Comments

\* Tickets with Internal Notes

\* Existing Lab 2 Tickets after migration



\## 4.5 Credentials



Seeded credentials are for local development/testing only.



No real passwords or sensitive personal information may be used.



Seed operations must be idempotent.



\---



\# 5. Authentication Tests



\*\*File:\*\* `server/tests/lab-03/auth.api.test.ts`



\### AUTH-01 — Active User Login



Given an active User with valid credentials:



\* Login succeeds.

\* An authenticated session is established.

\* The response identifies the User and role.

\* Password information is not returned.



\### AUTH-02 — Invalid Credentials



Given an incorrect email/password combination:



\* Login is rejected.

\* No authenticated session is established.

\* The response does not unnecessarily reveal whether the email exists.



\### AUTH-03 — Inactive User Cannot Login



An inactive User cannot authenticate even with valid credentials.



\### AUTH-04 — Initial Password State



A User with an initial password can authenticate but is marked as requiring a password change.



\### AUTH-05 — Mandatory Password Change



A User who must change their initial password cannot access normal application functionality until the password is changed.



\### AUTH-06 — Current Authenticated User



An authenticated request for the current User returns:



\* User identity

\* Name

\* Email where appropriate

\* Role

\* Required password-change state



It must not return the password hash.



\### AUTH-07 — Unauthenticated Current User



An unauthenticated current-user request is rejected.



\### AUTH-08 — Logout



After logout:



\* The session is invalidated.

\* Protected API requests no longer authenticate using the invalidated session.



\### AUTH-09 — Valid Password Change



A User can successfully change their password using valid input.



\### AUTH-10 — Invalid Password Change



Password change is rejected when:



\* Required values are missing.

\* Password confirmation does not match.

\* Password does not meet the defined password requirements.

\* Current/initial password validation fails when required.



\### AUTH-11 — Password Hash Protection



Password hashes and plaintext passwords are never returned through API responses.



\### AUTH-12 — New Initial Password



When an Administrator sets a new initial password for a User, that User is required to change it at the next login.



\---



\# 6. Authorization and Ownership Tests



\*\*File:\*\* `server/tests/lab-03/authorization.api.test.ts`



\### AUTHZ-01 — Unauthenticated Access



Unauthenticated users cannot access protected application APIs.



\### AUTHZ-02 — Role Authorization



Each protected API verifies the authenticated User's role on the server.



\### AUTHZ-03 — Requester Own Ticket Access



A Requester can access their own Tickets.



\### AUTHZ-04 — Cross-Requester Ticket Protection



A Requester cannot access another Requester's Ticket by modifying:



\* Ticket ID

\* requesterId

\* URL parameters

\* Query parameters

\* Request body



\### AUTHZ-05 — Authenticated Identity Determines Ownership



Creating a Ticket uses the authenticated User as the Requester.



A client-supplied requester identifier must not allow ownership to be changed.



\### AUTHZ-06 — Requester Attachment Ownership



A Requester can access and manage only attachments belonging to their own permitted Tickets.



\### AUTHZ-07 — IT Staff Queue Access



IT Staff can access the Ticket Queue.



Requesters cannot access the IT Staff Queue.



\### AUTHZ-08 — IT Staff Ticket Access



IT Staff can access permitted Ticket Detail operations.



\### AUTHZ-09 — Administrator User Management



Only Administrators can access User Management APIs.



\### AUTHZ-10 — Internal Notes Protection



Requesters cannot:



\* Retrieve Internal Notes.

\* Create Internal Notes.



IT Staff and Administrators can access Internal Notes according to the defined permissions.



\### AUTHZ-11 — Public Comments



Authorized Requesters and IT Staff can access and create Public Comments for permitted Tickets.



\### AUTHZ-12 — Client Role Cannot Bypass Authorization



Changing role information in the client or request does not grant additional server permissions.



\---



\# 7. Requester Regression and Migration Tests



These tests verify that Lab 2 functionality continues after Lab 3 changes.



\### MIG-01 — User Migration



Existing Development Requester records are mapped to the appropriate User records.



\### MIG-02 — Existing Ticket Ownership



Existing Ticket ownership is preserved during migration.



\### MIG-03 — Existing Attachments



Existing Ticket attachments remain associated with their Tickets.



\### MIG-04 — No Development Requester Selector



The frontend no longer requires the temporary Development Requester selector.



\### MIG-05 — Authenticated Requester Creates Ticket



A logged-in Requester can create a Ticket without selecting a Requester.



\### MIG-06 — Authenticated Requester Views Own Tickets



A Requester can continue using My Tickets.



\### MIG-07 — Requester Ticket Search/Filtering



Existing Lab 2 search, filtering, sorting, and pagination continue to work.



\### MIG-08 — Requester Attachments



Existing attachment upload/view/removal behavior continues for permitted Tickets.



\### MIG-09 — Cross-Requester Regression Protection



Lab 2 functionality must not allow a Requester to access another Requester's Ticket or attachment.



\### MIG-10 — Development Requester Client State Removed



The application does not depend on the old Development Requester client state or selector.



\---



\# 8. IT Staff Ticket Queue Tests



\*\*File:\*\* `server/tests/lab-03/staff-queue.api.test.ts`



\### QUEUE-01 — Queue Access



Authenticated IT Staff can retrieve the shared Ticket Queue.



\### QUEUE-02 — Queue Search



Supported Ticket search returns matching Tickets.



\### QUEUE-03 — Status Filter



The status filter returns Tickets matching the selected status.



\### QUEUE-04 — Requested Priority Filter



The Requested Priority filter works according to the API contract.



\### QUEUE-05 — IT Priority Filter



The IT Priority filter works according to the API contract.



\### QUEUE-06 — Assignment Filter



The queue can distinguish assigned and unassigned Tickets where supported.



\### QUEUE-07 — Queue Sorting



Supported sorting options work according to the API contract.



\### QUEUE-08 — Queue Pagination



Pagination returns the correct:



\* Page

\* Page size

\* Results

\* Pagination metadata



\### QUEUE-09 — Invalid Queue Query



Invalid search/filter/sort/pagination parameters return a validation error.



\### QUEUE-10 — Queue Default Ordering



The default queue ordering follows the documented API specification.



\### QUEUE-11 — Non-IT Staff Queue Access



Requester access to the Staff Queue is rejected.



\---



\# 9. IT Staff Ticket Detail Tests



\*\*File:\*\* `server/tests/lab-03/staff-ticket-detail.api.test.ts`



\### DETAIL-01 — View Ticket



IT Staff can retrieve an accessible Ticket.



\### DETAIL-02 — Missing Ticket



A nonexistent Ticket returns the appropriate not-found response.



\### DETAIL-03 — Claim Ticket



IT Staff can claim an unassigned Ticket.



\### DETAIL-04 — Assign Ticket



An authorized User can assign a Ticket to an eligible active IT Staff/User according to the business rules.



\### DETAIL-05 — Reassign Ticket



An authorized User can change the primary Ticket owner.



\### DETAIL-06 — One Primary Owner



A Ticket cannot have multiple primary owners.



\### DETAIL-07 — Inactive Owner



A Ticket cannot be assigned to an inactive User.



\### DETAIL-08 — IT Priority Initial Value



When a Ticket is created, IT Priority initially copies Requested Priority.



\### DETAIL-09 — Change IT Priority



IT Staff can change IT Priority when permitted.



\### DETAIL-10 — Requested Priority Is Preserved



Changing IT Priority does not modify Requested Priority.



\### DETAIL-11 — Status Transition



Each permitted status transition succeeds.



\### DETAIL-12 — Invalid Status Transition



A status transition outside the defined transition matrix is rejected.



\### DETAIL-13 — Unauthorized Status Change



A role without permission cannot change Ticket status.



\### DETAIL-14 — Unassigned Ticket



Unassigned Tickets can be viewed and handled according to the defined rules.



\### DETAIL-15 — Problem Appears Resolved



A Requester can indicate that the problem appears resolved when the Ticket state permits it.



The Requester cannot directly perform a formal Resolve/Close operation unless explicitly permitted by the status rules.



\### DETAIL-16 — Actions Taken Excluded



No Lab 3 test requires an Actions Taken by IT Staff feature because this functionality is deferred to Lab 4.



\---



\# 10. Ticket Status Tests



The status model must include:



\* New

\* Open

\* In Progress

\* Waiting for Requester

\* Resolved

\* Closed

\* Reopened

\* Cancelled



\### STATUS-01 — New



A newly created Ticket starts with the defined initial status.



\### STATUS-02 — Valid Transitions



Every transition listed as permitted in the final status transition matrix succeeds.



\### STATUS-03 — Invalid Transitions



Every transition listed as forbidden in the final transition matrix is rejected.



\### STATUS-04 — Role Restrictions



Status changes are permitted only to the roles defined by the transition matrix.



\### STATUS-05 — Required Confirmation



Transitions requiring confirmation cannot be completed without the required confirmation.



\### STATUS-06 — Validation



Transitions requiring additional validation fail when the required conditions are not satisfied.



\### STATUS-07 — Reopened



A Ticket can be reopened only according to the defined transition rules.



\### STATUS-08 — Cancelled



Cancellation follows the defined role and transition rules.



\---



\# 11. Public Comments and Internal Notes Tests



\*\*File:\*\* `server/tests/lab-03/comments-notes.api.test.ts`



\## Public Comments



\### COMMENT-01 — Create Public Comment



An authorized Requester or IT Staff user can create a Public Comment.



\### COMMENT-02 — Retrieve Public Comments



Authorized users can retrieve Public Comments for an accessible Ticket.



\### COMMENT-03 — Public Comment Visibility



Public Comments are visible to:



\* Requester

\* IT Staff

\* Administrator



according to the specification.



\### COMMENT-04 — Empty Public Comment



Empty or whitespace-only comments are rejected.



\### COMMENT-05 — Comment Length



Comments exceeding the documented maximum length are rejected.



\### COMMENT-06 — Comment Author



The server determines the comment author from the authenticated User.



\### COMMENT-07 — Comment Timestamp



The server creates the comment timestamp.



\### COMMENT-08 — Append-Only Comment



Public Comments cannot be edited or deleted.



\## Internal Notes



\### NOTE-01 — Create Internal Note



IT Staff can create an Internal Note.



\### NOTE-02 — Retrieve Internal Notes



IT Staff and Administrators can retrieve Internal Notes according to the authorization rules.



\### NOTE-03 — Internal Note Visibility



Internal Notes are not visible to Requesters.



\### NOTE-04 — Requester Cannot Create Note



A Requester cannot create an Internal Note.



\### NOTE-05 — Empty Internal Note



Empty or whitespace-only notes are rejected.



\### NOTE-06 — Note Length



Internal Notes exceeding the documented maximum length are rejected.



\### NOTE-07 — Note Author



The server determines the note author from the authenticated User.



\### NOTE-08 — Note Timestamp



The server creates the note timestamp.



\### NOTE-09 — Append-Only Note



Internal Notes cannot be edited or deleted.



\### NOTE-10 — Safe Rendering



Comment and note content is rendered safely and cannot inject executable HTML/script content into the application.



\---



\# 12. Administrator User Management Tests



\*\*File:\*\* `server/tests/lab-03/users-admin.api.test.ts`



\### USER-01 — List Users



Administrator can view the User list.



\### USER-02 — Search Users



Administrator can search users by supported name/email search.



\### USER-03 — Role Filter



Administrator can optionally filter Users by role.



\### USER-04 — Create User



Administrator can create a User with:



\* Name

\* Email

\* One role

\* Required account state/password information



\### USER-05 — One Role Only



A User cannot have multiple roles.



\### USER-06 — Valid Roles



Only these roles can be assigned:



\* Requester

\* IT Staff

\* Administrator



\### USER-07 — Duplicate Email



A duplicate email is rejected.



\### USER-08 — Update User



Administrator can update permitted:



\* Name

\* Email

\* Role

\* Activation state



\### USER-09 — Activate User



Administrator can activate an inactive User according to the rules.



\### USER-10 — Deactivate User



Administrator can deactivate an active User according to the rules.



\### USER-11 — Administrator Cannot Self-Deactivate



An Administrator cannot deactivate their own account.



\### USER-12 — Last Active Administrator



The last active Administrator cannot be deactivated.



\### USER-13 — Set New Initial Password



Administrator can set a new initial password for a User.



\### USER-14 — Forced Password Change After Admin Reset



The affected User must change the new initial password at their next login.



\### USER-15 — Non-Administrator Forbidden



Requester and IT Staff cannot access User Management.



\### USER-16 — No User Deletion



User deletion is not available because Lab 3 specifies account deactivation instead.



\### USER-17 — User Creation Validation



Invalid name, email, role, activation, or password data is rejected.



\### USER-18 — Inactive User Authentication



A User deactivated by an Administrator cannot authenticate.



\---



\# 13. Authentication and Security Tests



\### SEC-01 — Protected API Requires Authentication



All protected APIs reject unauthenticated requests.



\### SEC-02 — Server-Side RBAC



Changing frontend state cannot bypass server authorization.



\### SEC-03 — Ownership Enforcement



Changing `requesterId` or similar client input cannot bypass Ticket ownership.



\### SEC-04 — Safe Authentication Errors



Authentication failures do not expose unnecessary account information.



\### SEC-05 — Password Storage



Only password hashes are stored. Plaintext passwords are not stored.



\### SEC-06 — Password Not Returned



Password hashes are never returned to the client.



\### SEC-07 — Logout Invalidation



Logged-out sessions cannot continue using protected APIs.



\### SEC-08 — Inactive Accounts



Inactive accounts cannot authenticate.



\### SEC-09 — Session Expiry



The selected authentication/session mechanism follows the documented expiration behavior.



\### SEC-10 — Credential Protection



Authentication credentials/session information is handled according to the selected secure authentication design.



\### SEC-11 — CSRF Protection



If the selected cookie/session design requires CSRF protection, the relevant CSRF behavior is tested.



\---



\# 14. API Error Handling Tests



The API must distinguish the following cases where applicable:



\### ERR-01 — Unauthenticated



Unauthenticated requests receive the documented authentication error.



\### ERR-02 — Forbidden



Authenticated users without sufficient permission receive the documented authorization error.



\### ERR-03 — Invalid Input



Invalid request data receives a validation error.



\### ERR-04 — Missing Resource



A nonexistent resource receives the documented not-found response.



\### ERR-05 — Conflict



Duplicate email or other conflicting operations receive the documented conflict response.



\### ERR-06 — Server Failure



Unexpected failures return a safe server error without exposing stack traces or sensitive implementation details.



\---



\# 15. UI Component Tests



\## 15.1 Login



\*\*File:\*\* `Login.test.tsx`



Test:



\* Email input

\* Password input

\* Required validation

\* Login submission

\* Loading state

\* Invalid credentials

\* Inactive account

\* Server failure

\* Successful login



\## 15.2 Mandatory Password Change



\*\*File:\*\* `ChangePassword.test.tsx`



Test:



\* Required fields

\* Password confirmation

\* Password validation

\* Loading state

\* Failure state

\* Successful password change

\* Blocked normal application access before password change



\## 15.3 IT Staff Queue



\*\*File:\*\* `StaffTicketQueue.test.tsx`



Test:



\* Queue rendering

\* Search

\* Filters

\* Sorting

\* Pagination

\* Loading state

\* Empty state

\* No-results state

\* Forbidden state

\* Failure state

\* Opening Ticket Detail



\## 15.4 IT Staff Ticket Detail



\*\*File:\*\* `StaffTicketDetail.test.tsx`



Test:



\* Ticket information

\* Assignment

\* Claim

\* Reassignment

\* IT Priority

\* Status update

\* Public Comments

\* Internal Notes

\* Loading state

\* Saving state

\* Validation errors

\* Success feedback

\* Failure feedback



\## 15.5 Administrator User Management



\*\*File:\*\* `UserManagement.test.tsx`



Test:



\* User list

\* Name/email search

\* Role filter

\* Create User

\* Duplicate email error

\* Edit User

\* Role selection

\* Activation/deactivation

\* Self-deactivation protection

\* Last active Administrator protection

\* New initial password

\* Success/error feedback

\* Loading/empty states



\---



\# 16. Requester UI Regression Tests



Existing Lab 2 Requester functionality must be tested after authentication is introduced.



Test:



\* My Tickets

\* Create Ticket

\* Ticket viewing

\* Search

\* Filters

\* Sorting

\* Pagination

\* Attachments

\* Public Comments

\* Problem Appears Resolved

\* Authenticated ownership



The UI must not contain the old Development Requester selector.



\---



\# 17. Responsive and Accessibility Tests



\### UI-RESP-01 — Login



Login works on desktop and smaller screens.



\### UI-RESP-02 — Password Change



Password-change screen remains usable on smaller screens.



\### UI-RESP-03 — Requester Screens



Requester Ticket screens remain usable on smaller screens.



\### UI-RESP-04 — Staff Queue



The Staff Queue adapts to smaller screens using an appropriate responsive layout.



\### UI-RESP-05 — Staff Detail



Ticket Detail remains usable on smaller screens.



\### UI-RESP-06 — User Management



User Management remains usable on smaller screens.



\### UI-A11Y-01 — Form Labels



All important form controls have clear labels.



\### UI-A11Y-02 — Keyboard Navigation



Important controls can be reached and operated using the keyboard.



\### UI-A11Y-03 — Focus



Interactive elements have visible focus states.



\### UI-A11Y-04 — Status Communication



Status and priority information is not communicated only through color.



\### UI-A11Y-05 — Error Feedback



Validation and API errors are understandable and associated with the relevant action/field.



\---



\# 18. Zen Green Visual Tests



\### VIS-01 — Existing Design Language



Lab 3 screens use the existing TokTickIT Zen Green style.



\### VIS-02 — Color Consistency



The implementation continues to use the established colors:



\* `#006B3C`

\* `#0B7A46`

\* `#EAF6EF`

\* `#F5F7F6`



\### VIS-03 — Reusable Components



Buttons, inputs, badges, messages, and other repeated UI elements use consistent styling.



\### VIS-04 — Role/Status Badges



Role, status, Requested Priority, and IT Priority are visually distinguishable.



\### VIS-05 — Read-Only Fields



Read-only information is visually distinguishable from editable controls.



\---



\# 19. End-to-End Authentication Tests



\*\*File:\*\* `e2e/lab-03/authentication.spec.ts`



\### E2E-AUTH-01 — Requester Login



1\. Open Login.

2\. Enter valid active Requester credentials.

3\. Submit.

4\. Verify authenticated Requester interface.

5\. Verify the Development Requester selector is absent.



\### E2E-AUTH-02 — Mandatory Password Change



1\. Login using a seeded initial password.

2\. Verify the password-change screen.

3\. Enter a valid new password.

4\. Submit.

5\. Verify normal application access.



\### E2E-AUTH-03 — Logout



1\. Login.

2\. Logout.

3\. Access a protected route.

4\. Verify authentication is required.



\### E2E-AUTH-04 — Role Navigation



Login separately as:



\* Requester

\* IT Staff

\* Administrator



Verify that each receives only the appropriate navigation.



\---



\# 20. End-to-End IT Staff Tests



\*\*File:\*\* `e2e/lab-03/staff-ticket-flow.spec.ts`



\### E2E-STAFF-01 — Ticket Queue



1\. Login as IT Staff.

2\. Open Ticket Queue.

3\. Search for a Ticket.

4\. Apply supported filters.

5\. Open a Ticket.



\### E2E-STAFF-02 — Assignment



1\. Open an unassigned Ticket.

2\. Claim the Ticket.

3\. Verify the current owner.

4\. Reassign when permitted.

5\. Verify the new owner.



\### E2E-STAFF-03 — IT Priority and Status



1\. Open a Ticket.

2\. Change IT Priority.

3\. Verify Requested Priority remains unchanged.

4\. Perform an allowed status transition.

5\. Verify the updated status.



\### E2E-STAFF-04 — Comments and Notes



1\. Open a Ticket.

2\. Add a Public Comment.

3\. Add an Internal Note.

4\. Verify both are stored.

5\. Verify the distinction between Public Comment and Internal Note.



\### E2E-STAFF-05 — Requester Cannot See Internal Notes



1\. Login as Requester.

2\. Open an accessible Ticket.

3\. Verify Public Comments are visible.

4\. Verify Internal Notes are not visible.



\---



\# 21. End-to-End Administrator Tests



\*\*File:\*\* `e2e/lab-03/user-administration.spec.ts`



\### E2E-ADMIN-01 — User List



1\. Login as Administrator.

2\. Open User Management.

3\. Verify seeded users appear.



\### E2E-ADMIN-02 — Search User



1\. Search by name/email.

2\. Verify matching users are displayed.



\### E2E-ADMIN-03 — Create User



1\. Open Create User.

2\. Enter valid user information.

3\. Select exactly one role.

4\. Submit.

5\. Verify the User appears in the list.



\### E2E-ADMIN-04 — Duplicate Email



1\. Attempt to create a User with an existing email.

2\. Verify the operation is rejected.



\### E2E-ADMIN-05 — Update User



1\. Open an existing User.

2\. Change permitted information.

3\. Save.

4\. Verify the changes.



\### E2E-ADMIN-06 — Activate/Deactivate



1\. Open an eligible User.

2\. Change activation state.

3\. Verify the updated state.

4\. Verify a deactivated User cannot log in.



\### E2E-ADMIN-07 — Initial Password



1\. Administrator sets a new initial password.

2\. Logout.

3\. Login as the affected User.

4\. Verify mandatory password change.

5\. Change the password.

6\. Verify normal access.



\### E2E-ADMIN-08 — Administrator Protection



Verify that:



\* Administrator cannot deactivate their own account.

\* Last active Administrator cannot be deactivated.



\---



\# 22. Requirement Traceability



| Lab 3 Requirement                           | Tests                                                      |

| ------------------------------------------- | ---------------------------------------------------------- |

| Active valid credentials authenticate       | AUTH-01, AUTH-02, AUTH-03                                  |

| Initial password must be changed            | AUTH-04, AUTH-05, AUTH-09, AUTH-12, E2E-AUTH-02            |

| Logout                                      | AUTH-08, SEC-07, E2E-AUTH-03                               |

| Current authenticated User                  | AUTH-06, AUTH-07                                           |

| Role-based navigation/authorization         | AUTHZ-01, AUTHZ-02, AUTHZ-07, AUTHZ-09, UI-03, E2E-AUTH-04 |

| Server-side authorization                   | AUTHZ-02, AUTHZ-12, SEC-01, SEC-02                         |

| Authenticated identity determines ownership | AUTHZ-03, AUTHZ-04, AUTHZ-05                               |

| Development Requester migration             | MIG-01 to MIG-04                                           |

| Lab 2 regression                            | MIG-05 to MIG-09                                           |

| Requester Public Comments                   | COMMENT-01 to COMMENT-08                                   |

| Problem Appears Resolved                    | DETAIL-15                                                  |

| IT Staff Queue                              | QUEUE-01 to QUEUE-11                                       |

| IT Staff Ticket Detail                      | DETAIL-01 to DETAIL-16                                     |

| Primary Ticket owner                        | DETAIL-03 to DETAIL-07                                     |

| IT Priority                                 | DETAIL-08 to DETAIL-10                                     |

| Ticket statuses                             | STATUS-01 to STATUS-08                                     |

| Public Comments                             | COMMENT-01 to COMMENT-08                                   |

| Internal Notes                              | NOTE-01 to NOTE-10                                         |

| Administrator User Management               | USER-01 to USER-18                                         |

| One role per User                           | USER-04 to USER-06                                         |

| Duplicate email prevention                  | USER-07                                                    |

| User activation/deactivation                | USER-08 to USER-12                                         |

| New initial password                        | USER-13, USER-14                                           |

| No user deletion                            | USER-16                                                    |

| Safe API errors                             | ERR-01 to ERR-06                                           |

| Password protection                         | AUTH-11, SEC-05, SEC-06                                    |

| Responsive UI                               | UI-RESP-01 to UI-RESP-06                                   |

| Accessibility                               | UI-A11Y-01 to UI-A11Y-05                                   |

| Zen Green UI                                | VIS-01 to VIS-05                                           |

| End-to-end authentication                   | E2E-AUTH-01 to E2E-AUTH-04                                 |

| End-to-end IT Staff workflow                | E2E-STAFF-01 to E2E-STAFF-05                               |

| End-to-end Admin workflow                   | E2E-ADMIN-01 to E2E-ADMIN-08                               |



\---



\# 23. Acceptance Criteria Traceability



| Acceptance Criterion                                           | Planned Tests                                 |

| -------------------------------------------------------------- | --------------------------------------------- |

| AC-01 Active valid User can login and receives identity/role   | AUTH-01, AUTH-06, E2E-AUTH-01                 |

| AC-02 Initial password blocks normal application until changed | AUTH-04, AUTH-05, E2E-AUTH-02                 |

| AC-03 Requester cannot access another Requester's Ticket       | AUTHZ-03, AUTHZ-04, MIG-09, SEC-03            |

| AC-04 Requester cannot retrieve/create Internal Notes          | AUTHZ-10, NOTE-03, NOTE-04, E2E-STAFF-05      |

| UI-AC-01 Login works                                           | Login UI tests, E2E-AUTH-01                   |

| UI-AC-02 Mandatory password change works                       | ChangePassword tests, E2E-AUTH-02             |

| UI-AC-03 Role-specific navigation                              | UI role tests, E2E-AUTH-04                    |

| UI-AC-04 Requester Lab 2 regression                            | MIG-05 to MIG-09                              |

| UI-AC-05 Requester Public Comments                             | COMMENT tests, requester UI regression        |

| UI-AC-06 IT Staff Queue                                        | QUEUE-01 to QUEUE-11, Staff Queue UI tests    |

| UI-AC-07 IT Staff Detail                                       | DETAIL-01 to DETAIL-16, Staff Detail UI tests |

| UI-AC-08 Administrator User Management                         | USER-01 to USER-18, User Management UI tests  |

| UI-AC-09 Administrator initial password                        | AUTH-12, USER-13, USER-14, E2E-ADMIN-07       |

| UI-AC-10 Unauthorized actions protected                        | AUTHZ tests, SEC tests                        |

| UI-AC-11 Responsive screens                                    | UI-RESP-01 to UI-RESP-06                      |

| UI-AC-12 Zen Green design                                      | VIS-01 to VIS-05                              |

| UI-AC-13 Accessibility                                         | UI-A11Y-01 to UI-A11Y-05                      |



\---



\# 24. Test Completion Criteria



Lab 3 testing is complete when:



\* Authentication tests pass.

\* Logout and session invalidation tests pass.

\* Mandatory password-change tests pass.

\* Server-side role authorization tests pass.

\* Requester ownership tests pass.

\* Development Requester migration tests pass.

\* Lab 2 regression tests pass.

\* IT Staff Queue tests pass.

\* IT Staff Ticket Detail tests pass.

\* Assignment and IT Priority tests pass.

\* Status transition tests pass.

\* Public Comment tests pass.

\* Internal Note tests pass.

\* Administrator User Management tests pass.

\* Initial password reset tests pass.

\* Administrator self-deactivation and last-admin protection tests pass.

\* API error-handling tests pass.

\* UI component tests pass.

\* Responsive and accessibility checks pass.

\* Required E2E workflows pass.

\* No critical authentication, authorization, or ownership defect remains.

\* Test failures are investigated before integration into `lab3-staging`.



\---



\# 25. Definition of Test Done



A test item is considered complete when:



\* The test is implemented in the planned test location.

\* The test passes against the intended Lab 3 implementation.

\* The test verifies the actual requirement rather than only checking implementation details.

\* Authorization tests verify server-side enforcement.

\* Regression tests verify existing Lab 2 behavior.

\* Failures are documented and resolved or explicitly tracked.

\* The relevant acceptance criterion can be traced to one or more passing tests.

&#x20; ::



