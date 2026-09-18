\# TokTickIT Lab 3 Specification



\*\*Course:\*\* CPE334 Introduction to Software Engineering in the Age of AI Agents

\*\*Lab:\*\* 3 — TokTickIT Users, Roles, IT Staff Ticketing, and Admin Screens

\*\*Status:\*\* Engineering Contract

\*\*Base Increment:\*\* Lab 2

\*\*UI Design:\*\* Zen Green



\---



\## 1. Sprint Goal



Lab 3 replaces the temporary Development Requester selector with real authentication and role-based authorization. The increment introduces Requester, IT Staff, and Administrator users, mandatory first-login password changes, authenticated Requester ownership, an IT Staff Ticket Queue and Ticket Detail workflow, Public Comments and Internal Notes, and a minimal Administrator User Management screen while preserving the completed Lab 2 Ticket and Attachment functionality.



\---



\## 2. Stakeholder Request



The temporary Requester selector was useful during development, but TokTickIT now needs real user accounts. Users must sign in with an email address and password and must change an initial password before entering the application.



Requesters continue to create and manage their own Tickets using their authenticated identity. IT Staff need a queue and Ticket Detail workflow for finding work, managing ownership, IT Priority, status, Public Comments, Internal Notes, and existing Attachments. Administrators need a simple screen for managing user accounts.



Every protected API operation must enforce authorization on the server. Frontend controls may hide unauthorized actions for usability, but they are not security controls.



\---



\## 3. Scope



\### 3.1 Included



Lab 3 includes:



1\. Real User accounts and authentication.

2\. Login and logout.

3\. Current authenticated-user retrieval.

4\. Mandatory first-login password change.

5\. Password hashing and secure credential handling.

6\. Three roles:



&#x20;  \* Requester

&#x20;  \* IT Staff

&#x20;  \* Administrator

7\. Server-side role-based authorization.

8\. Server-side ownership protection.

9\. Migration from the Lab 2 Development Requester model to the User model.

10\. Preservation of existing Ticket and Attachment ownership.

11\. Requester Ticket and Attachment regression support.

12\. Requester Public Comments.

13\. Requester "Problem Appears Resolved" indication.

14\. IT Staff Ticket Queue.

15\. IT Staff Ticket Detail.

16\. Ticket ownership claim, assignment, and reassignment.

17\. IT Priority.

18\. Ticket status workflow.

19\. Public Comments.

20\. Internal Notes.

21\. Minimal Administrator User Management.

22\. User creation and basic editing.

23\. One-role assignment.

24\. Account activation/deactivation.

25\. Setting a new initial password.

26\. Required database migrations and seed data.

27\. API, UI, integration, security, regression, responsive, and E2E tests.

28\. Zen Green UI extensions consistent with Lab 2.



\### 3.2 Explicitly Excluded



The following are outside Lab 3:



\* Email invitations.

\* Password-reset email.

\* Multi-factor authentication.

\* Social login.

\* Single sign-on.

\* Self-registration.

\* Requester-created accounts.

\* Actions Taken by IT Staff.

\* Formal SLA calculation.

\* Escalation rules.

\* Notification services.

\* Dashboards and KPI analytics beyond simple queue counts.

\* Multi-tenant organizations.

\* Departments and customer administration.

\* Production cloud or deployment changes.

\* Multiple roles per user.

\* User deletion.

\* Bulk user operations.

\* User import/export.

\* Account-history screens.

\* Extended user profiles.

\* Profile photos.

\* Email delivery of passwords or reset links.

\* Account unlocking.

\* Administrator approval workflows.

\* Advanced identity-management functions.

\* Mandatory pagination, multi-column sorting, or multiple simultaneous filters for User Management.

\* Editing or deleting Public Comments or Internal Notes.



\---



\## 4. Functional Requirements



\### 4.1 Authentication



\*\*FR-01 — Login\*\*



The system shall allow an active user to authenticate using an email address and password.



\*\*FR-02 — Credential Validation\*\*



The backend shall validate credentials against the stored password hash and shall not store plaintext passwords.



\*\*FR-03 — Inactive Account Protection\*\*



Inactive users shall not be allowed to authenticate.



\*\*FR-04 — Initial Password\*\*



A user created with an initial password shall be marked as requiring a password change.



\*\*FR-05 — Mandatory Password Change\*\*



A user who must change their initial password shall not access normal application functionality until a valid new password is saved.



\*\*FR-06 — Logout\*\*



An authenticated user shall be able to log out and the authenticated access mechanism shall be invalidated.



\*\*FR-07 — Current User\*\*



The application shall provide the authenticated user's identity, name, email, role, activation state, and password-change state as required by the UI.



\*\*FR-08 — Safe Authentication Errors\*\*



Authentication failures shall use safe messages that do not unnecessarily reveal whether an account exists or expose credential information.



\### 4.2 Authorization



\*\*FR-09 — Role Enforcement\*\*



The backend shall enforce permissions for Requester, IT Staff, and Administrator operations.



\*\*FR-10 — Requester Ownership\*\*



Requester Ticket and Attachment operations shall use the authenticated Requester identity rather than a requester identity supplied by the client.



\*\*FR-11 — IT Staff Authorization\*\*



IT Staff shall be authorized to use the Ticket Queue and permitted Ticket Detail operations.



\*\*FR-12 — Administrator Authorization\*\*



Administrator User Management operations shall be restricted to Administrators.



\*\*FR-13 — Direct API Protection\*\*



Calling a protected endpoint directly without the required authentication or role shall be rejected even if the corresponding frontend control is hidden.



\### 4.3 Requester Functions



\*\*FR-14 — Ticket Regression\*\*



Existing Lab 2 Requester Ticket creation, viewing, management, and Attachment behavior shall continue using the authenticated Requester identity.



\*\*FR-15 — Remove Temporary Selector\*\*



The Development Requester selector and Change Requester functionality shall be removed from the normal application flow.



\*\*FR-16 — Public Comments\*\*



A Requester shall be able to create and retrieve Public Comments on Tickets they are permitted to access.



\*\*FR-17 — Problem Appears Resolved\*\*



A Requester shall be able to indicate that the reported problem appears resolved.



\*\*FR-18 — Formal Resolution Restriction\*\*



A Requester shall not formally set a Ticket to Resolved or Closed.



\### 4.4 IT Staff Functions



\*\*FR-19 — Ticket Queue\*\*



IT Staff shall be able to retrieve a Ticket Queue with search, suitable filters, sorting, and pagination.



\*\*FR-20 — Ticket Detail\*\*



IT Staff shall be able to open permitted Tickets and view their relevant information.



\*\*FR-21 — Ticket Ownership\*\*



IT Staff shall be able to claim, assign, and reassign Ticket ownership according to the authorization rules.



\*\*FR-22 — IT Priority\*\*



IT Staff shall be able to set and update IT Priority.



\*\*FR-23 — Ticket Status\*\*



IT Staff shall be able to perform only permitted Ticket status transitions.



\*\*FR-24 — Public Comments\*\*



IT Staff shall be able to create and retrieve Public Comments.



\*\*FR-25 — Internal Notes\*\*



IT Staff shall be able to create and retrieve Internal Notes.



\### 4.5 Administrator Functions



\*\*FR-26 — User List\*\*



Administrators shall be able to view users with Name, Email, Role, Status, and an Edit action.



\*\*FR-27 — User Search\*\*



Administrators shall be able to search users by name or email.



\*\*FR-28 — Role Filter\*\*



The User Management screen may provide an optional single role filter.



\*\*FR-29 — Create User\*\*



Administrators shall be able to create a user with a name, email address, one permitted role, activation state, and initial password.



\*\*FR-30 — Edit User\*\*



Administrators shall be able to update a user's name, email address, role, and activation state.



\*\*FR-31 — Initial Password Reset\*\*



Administrators shall be able to set a new initial password that requires the user to change it at the next login.



\*\*FR-32 — Account Safety\*\*



The system shall prevent an Administrator from deactivating their own account and shall prevent removal or deactivation of the last active Administrator.



\*\*FR-33 — No User Deletion\*\*



Users shall not be deleted in Lab 3. Deactivation shall be used instead.



\---



\## 5. Roles and Authorization



Each User has exactly one role in Lab 3.



| Operation                               | Requester | IT Staff | Administrator |

| --------------------------------------- | --------: | -------: | ------------: |

| Login/logout                            |       Yes |      Yes |           Yes |

| Change own password                     |       Yes |      Yes |           Yes |

| View own Tickets                        |       Yes |       No |            No |

| Create own Ticket                       |       Yes |       No |            No |

| Manage own Attachments                  |       Yes |       No |            No |

| Public Comments on permitted Tickets    |       Yes |      Yes |           Yes |

| Indicate problem appears resolved       |       Yes |       No |            No |

| View IT Staff Ticket Queue              |        No |      Yes |            No |

| Open IT Staff Ticket Detail             |        No |      Yes |            No |

| Claim/assign/reassign Ticket            |        No |      Yes |            No |

| Set IT Priority                         |        No |      Yes |            No |

| Perform permitted Ticket status changes |        No |      Yes |            No |

| Create/View Internal Notes              |        No |      Yes |           Yes |

| User Management                         |        No |       No |           Yes |



Administrator and IT Staff responsibilities remain conceptually separate. Administrators manage users; IT Staff manage operational Tickets. Administrator access does not automatically grant IT Staff Ticket operations.



All permissions in this matrix are enforced by the backend.



\---



\## 6. Business Rules



\### 6.1 Authentication and Account Rules



\*\*BR-01.\*\* Only an active user with valid credentials may authenticate.



\*\*BR-02.\*\* A user requiring an initial password change cannot enter normal application screens until a valid new password is saved.



\*\*BR-03.\*\* Passwords shall never be stored in plaintext.



\*\*BR-04.\*\* Authentication failure messages shall not unnecessarily reveal whether an email address exists.



\*\*BR-05.\*\* An inactive user cannot authenticate.



\*\*BR-06.\*\* Email addresses shall be unique regardless of letter casing.



\*\*BR-07.\*\* Each user has exactly one role: Requester, IT Staff, or Administrator.



\*\*BR-08.\*\* Logout shall invalidate the user's authenticated access.



\*\*BR-09.\*\* A new initial password set by an Administrator shall require a password change at the user's next successful login.



\*\*BR-10.\*\* Password validation shall enforce the password policy defined by the approved authentication implementation and shall reject invalid or mismatched confirmation values.



\### 6.2 Requester Ownership Rules



\*\*BR-11.\*\* The authenticated user identity determines Requester ownership.



\*\*BR-12.\*\* A Requester cannot access another Requester's protected Ticket or Attachment data.



\*\*BR-13.\*\* A client-provided requesterId cannot override the authenticated identity.



\*\*BR-14.\*\* Unauthorized access to another user's protected resource shall not disclose whether the resource exists.



\*\*BR-15.\*\* A Requester may create Tickets only for the authenticated Requester identity.



\### 6.3 Ticket Ownership Rules



\*\*BR-16.\*\* A Ticket may have zero or one primary Ticket Owner.



\*\*BR-17.\*\* A Ticket Owner must be an active IT Staff or Administrator user where Administrator assignment is explicitly permitted by the approved implementation.



\*\*BR-18.\*\* An unassigned Ticket is valid.



\*\*BR-19.\*\* Ticket assignment changes shall be validated by the backend.



\### 6.4 Priority Rules



\*\*BR-20.\*\* Requested Priority remains the value submitted by the Requester.



\*\*BR-21.\*\* IT Priority initially copies Requested Priority when the Ticket is created.



\*\*BR-22.\*\* IT Priority may subsequently be changed only by an authorized IT Staff operation.



\*\*BR-23.\*\* Requested Priority and IT Priority shall be displayed as separate values.



\### 6.5 Ticket Status Rules



\*\*BR-24.\*\* The supported Ticket statuses are:



\* New

\* Open

\* In Progress

\* Waiting for Requester

\* Resolved

\* Closed

\* Reopened

\* Cancelled



\*\*BR-25.\*\* Only permitted roles may perform Ticket status changes.



\*\*BR-26.\*\* A Requester may indicate that the problem appears resolved but cannot formally set the Ticket to Resolved or Closed.



\*\*BR-27.\*\* Ticket status transitions shall follow the approved transition matrix in the implementation and API contract.



\*\*BR-28.\*\* Invalid status transitions shall be rejected by the backend.



\*\*BR-29.\*\* The Lab 3 status workflow shall not depend on the Actions Taken feature, because Actions Taken is deferred to Lab 4.



\### 6.6 Comments and Notes



\*\*BR-30.\*\* Public Comments are visible to Requesters, IT Staff, and Administrators when they are permitted to access the Ticket.



\*\*BR-31.\*\* Internal Notes are visible only to authorized IT Staff and Administrators.



\*\*BR-32.\*\* Public Comments and Internal Notes are append-only in Lab 3.



\*\*BR-33.\*\* Existing comments or notes cannot be edited or deleted through Lab 3 functionality.



\*\*BR-34.\*\* Empty or whitespace-only comments and notes are rejected.



\*\*BR-35.\*\* Each comment or note records its author and creation time using backend-controlled values.



\*\*BR-36.\*\* Comment and note content shall be rendered safely and shall not be interpreted as executable HTML or script.



\### 6.7 Administrator Rules



\*\*BR-37.\*\* An Administrator may create a user with exactly one permitted role.



\*\*BR-38.\*\* An Administrator may update a user's name, email address, role, and activation state.



\*\*BR-39.\*\* Duplicate email addresses are rejected.



\*\*BR-40.\*\* Invalid role values are rejected.



\*\*BR-41.\*\* An Administrator cannot deactivate their own account.



\*\*BR-42.\*\* The system must always retain at least one active Administrator.



\*\*BR-43.\*\* User accounts are deactivated rather than deleted.



\*\*BR-44.\*\* Setting a new initial password causes the target account to require a password change at its next login.



\### 6.8 Regression Rules



\*\*BR-45.\*\* Existing Categories and Related Systems remain valid after migration.



\*\*BR-46.\*\* Existing Tickets and Attachments must remain available after the Lab 3 database migration.



\*\*BR-47.\*\* Existing Requester Ticket ownership must remain correct after migration.



\*\*BR-48.\*\* The Development Requester selector and its client-side identity state must not be required for normal application use.



\---



\## 7. Ticket Status Transition Matrix



The following transition matrix is the planned Lab 3 workflow:



| Current Status        | Permitted Next Status                         | Role     |

| --------------------- | --------------------------------------------- | -------- |

| New                   | Open, Cancelled                               | IT Staff |

| Open                  | In Progress, Waiting for Requester, Cancelled | IT Staff |

| In Progress           | Waiting for Requester, Resolved, Cancelled    | IT Staff |

| Waiting for Requester | In Progress, Resolved, Cancelled              | IT Staff |

| Resolved              | Closed, Reopened                              | IT Staff |

| Closed                | Reopened                                      | IT Staff |

| Reopened              | In Progress, Cancelled                        | IT Staff |

| Cancelled             | Reopened                                      | IT Staff |



A Requester's "Problem Appears Resolved" action is an indication and does not directly change the Ticket to `Resolved` or `Closed`.



Invalid transitions shall be rejected by the backend.



\---



\## 8. Data Changes



\### 8.1 User Model



The Lab 3 database shall introduce a real User model containing, at minimum:



\* Unique user identifier.

\* Name.

\* Unique email address.

\* Password hash.

\* One role.

\* Active/inactive state.

\* Initial-password-change state.

\* Created timestamp.

\* Updated timestamp.



Passwords shall be hashed using a password-hashing algorithm appropriate for the course stack. Plaintext passwords and authentication secrets shall not be stored in the repository.



\### 8.2 Ticket Changes



Tickets shall support:



\* Existing Requester ownership.

\* Optional primary IT Staff/Administrator owner according to the approved authorization rules.

\* Requested Priority.

\* IT Priority.

\* Lab 3 Ticket status.

\* Requester resolution indication where required.

\* Existing Lab 2 fields and relationships.



\### 8.3 Comments and Notes



The database shall support:



\* Many Public Comments per Ticket.

\* Many Internal Notes per Ticket.

\* One author per Comment or Note.

\* Backend-controlled creation timestamps.



\### 8.4 Relationships



The intended relationships are:



```text

User (Requester) 1 ──── \* Ticket

User (Owner)     0..1 ─ \* Ticket

Ticket           1 ──── \* PublicComment

Ticket           1 ──── \* InternalNote

User             1 ──── \* PublicComment

User             1 ──── \* InternalNote

```



Existing Categories, Related Systems, Tickets, and Attachments remain valid.



\### 8.5 Migration



The migration shall evolve the Lab 2 Development Requester records into real User records without discarding existing Ticket or Attachment data.



The migration must:



1\. Create User records corresponding to existing Development Requesters.

2\. Preserve existing Ticket ownership.

3\. Give migrated Requester accounts safe local-development initial credentials.

4\. Mark migrated accounts as requiring an initial password change where appropriate.

5\. Remove application dependence on the Development Requester selector.

6\. Preserve existing Category, Related System, Ticket, and Attachment relationships.

7\. Be represented by Prisma migrations rather than destructive database recreation.



\### 8.6 Seed Data



The Lab 3 seed process shall be idempotent and safe to run repeatedly.



Seed data shall contain at least:



\* Four active Requesters.

\* One inactive Requester.

\* Three active IT Staff.

\* One inactive IT Staff.

\* One active Administrator.

\* Realistic Tickets across different statuses and priorities.

\* Assigned and unassigned Tickets.

\* Example Public Comments.

\* Example Internal Notes.



Seeded credentials are for local development only and must not contain real personal passwords or secrets.



\---



\## 9. Authentication and Session Decision



Lab 3 will use an authenticated server-managed session rather than storing authentication credentials or long-lived access tokens in browser local storage.



The session design shall:



\* Store only a session identifier in the browser.

\* Use an HttpOnly cookie so client-side JavaScript cannot read the session identifier.

\* Use appropriate SameSite and Secure cookie settings for the development and deployment context.

\* Store session state server-side or through an approved secure session mechanism.

\* Support expiration.

\* Invalidate the session on logout.

\* Never expose password hashes or authentication secrets to the client.

\* Use CSRF protection appropriate to the chosen cookie-based authentication design.

\* Return safe authentication and authorization errors.



Exact session implementation details shall be recorded in `api-spec.md` before implementation.



\---



\## 10. API Contract Summary



The API shall provide capabilities for:



\### Authentication



\* Login.

\* Logout.

\* Current authenticated user.

\* Mandatory password change.



\### Requester



\* Existing Lab 2 Ticket APIs using authenticated ownership.

\* Existing Attachment APIs using authenticated ownership.

\* Public Comments.

\* Problem Appears Resolved indication.



\### IT Staff



\* Ticket Queue.

\* Ticket Detail.

\* Ticket claim/assignment/reassignment.

\* IT Priority.

\* Status updates.

\* Public Comments.

\* Internal Notes.



\### Administrator



\* User list.

\* User search.

\* Optional role filter.

\* User creation.

\* Basic user editing.

\* One-role assignment.

\* Activation/deactivation.

\* New initial password.



Every protected endpoint must enforce authentication and authorization server-side.



\---



\## 11. UI Specification Summary



The application shall continue using the Zen Green design language established in Lab 2.



\### 11.1 Application Shell



The temporary Development Requester selector shall be removed.



The authenticated user's name and role shall be displayed in the application shell together with Logout and permitted password actions.



Navigation shall be role-specific.



\### 11.2 Login



The Login screen shall contain:



\* Email.

\* Password.

\* Validation.

\* Busy state.

\* Safe failure feedback.

\* Inactive-account feedback.



\### 11.3 Change Password



Users with an initial password shall see a mandatory Change Password screen before normal application access.



The screen shall provide:



\* New password.

\* Password confirmation.

\* Password validation.

\* Saving/busy state.

\* Success feedback.

\* Safe failure feedback.



\### 11.4 Requester



Requester screens shall preserve Lab 2 functionality while removing the Development Requester selector.



Ticket Detail shall additionally provide:



\* Public Comments.

\* Problem Appears Resolved.



\### 11.5 IT Staff



The Ticket Queue shall provide:



\* Search.

\* Suitable filters.

\* Sorting.

\* Pagination.

\* Ownership information.

\* Status and priority badges.

\* Open Ticket Detail action.

\* Loading state.

\* Empty state.

\* No-results state.

\* Forbidden state.

\* Safe failure state.

\* Responsive representation.



IT Staff Ticket Detail shall provide:



\* Ticket information.

\* Ownership controls.

\* IT Priority.

\* Permitted status changes.

\* Public Comments.

\* Internal Notes.

\* Existing Attachments.

\* Role-specific actions.



Public Comments and Internal Notes must be visually distinct.



\### 11.6 Administrator



The User Management screen shall provide:



\* User list.

\* Name.

\* Email.

\* Role.

\* Status.

\* Edit action.

\* Name/email search.

\* Optional role filter.

\* Create user.

\* Edit user.

\* Role assignment.

\* Activation/deactivation.

\* New initial password.

\* Validation.

\* Success feedback.

\* Forbidden feedback.

\* Safe API failure feedback.



The screen shall remain intentionally simple and responsive.



\---



\## 12. Acceptance Criteria



\*\*AC-01.\*\* Given an active user with valid credentials, when the user logs in, then the backend establishes authenticated access and returns the permitted user identity and role.



\*\*AC-02.\*\* Given a user who must change an initial password, when login succeeds, then normal application screens remain unavailable until a valid new password is saved.



\*\*AC-03.\*\* Given an inactive account, when login is attempted, then authentication is rejected with safe feedback.



\*\*AC-04.\*\* Given an authenticated user, when Logout is completed, then subsequent protected requests using the invalidated session are rejected.



\*\*AC-05.\*\* Given an authenticated Requester, when the client supplies another requester identity, then the backend uses the authenticated Requester and does not return another user's protected data.



\*\*AC-06.\*\* Given a Requester, when an Internal Note operation is requested, then the backend rejects the operation without exposing Internal Note content.



\*\*AC-07.\*\* Given IT Staff credentials, when the Ticket Queue is requested, then permitted queue data is returned with supported search, filters, sorting, and pagination.



\*\*AC-08.\*\* Given an authorized IT Staff user, when a Ticket is claimed or reassigned, then the Ticket Owner is updated according to the authorization rules.



\*\*AC-09.\*\* Given an authorized IT Staff user, when IT Priority is changed, then the Ticket stores the new IT Priority while preserving Requested Priority.



\*\*AC-10.\*\* Given an IT Staff user, when an invalid Ticket status transition is requested, then the backend rejects the transition.



\*\*AC-11.\*\* Given a permitted user, when a Public Comment is created, then it is stored with the authenticated author and backend creation time.



\*\*AC-12.\*\* Given an IT Staff or Administrator user, when an Internal Note is created, then the note is stored and is not exposed through Requester operations.



\*\*AC-13.\*\* Given an Administrator, when User Management is opened, then the user list displays Name, Email, Role, Status, and Edit action.



\*\*AC-14.\*\* Given an Administrator, when a new user is created with a unique email and valid role, then the account is created with an initial password and appropriate password-change state.



\*\*AC-15.\*\* Given an Administrator, when a duplicate email is submitted, then user creation or editing is rejected without creating duplicate accounts.



\*\*AC-16.\*\* Given an Administrator, when a user's name, email, role, or activation state is edited with valid values, then the account is updated.



\*\*AC-17.\*\* Given an Administrator, when a new initial password is assigned, then the target user must change that password at the next login.



\*\*AC-18.\*\* Given an Administrator, when attempting to deactivate their own account, then the operation is rejected.



\*\*AC-19.\*\* Given the last active Administrator account, when deactivation would remove the last active Administrator, then the operation is rejected.



\*\*AC-20.\*\* Given an unauthenticated or unauthorized user, when a protected API endpoint is accessed directly, then the backend rejects the request regardless of frontend visibility.



\*\*AC-21.\*\* Given the migrated Lab 2 database, when the Lab 3 migration is completed, then existing Tickets and Attachments remain available with correct Requester ownership.



\*\*AC-22.\*\* Given the completed Lab 3 UI, when viewed on desktop, tablet, and mobile widths, then major screens remain usable without unintended clipping or horizontal overflow.



\*\*AC-23.\*\* Given valid and invalid operations, when the application processes them, then meaningful loading, validation, success, empty/no-results, forbidden, conflict, not-found, and safe failure feedback is displayed where applicable.



\---



\## 13. Definition of Done



Lab 3 Issue #26 is complete when:



\* \[ ] `docs/lab-03/specification.md` is complete and reviewed.

\* \[ ] `docs/lab-03/tests.md` contains planned test coverage and acceptance-criteria traceability.

\* \[ ] `docs/lab-03/ui-spec.md` defines the required screens and UI behavior.

\* \[ ] `docs/lab-03/api-spec.md` defines the API contract.

\* \[ ] Functional requirements are numbered and traceable.

\* \[ ] Business rules are numbered and traceable.

\* \[ ] The authorization matrix is documented.

\* \[ ] Authentication and session decisions are documented.

\* \[ ] Database migration decisions are documented.

\* \[ ] Seed-data requirements are documented.

\* \[ ] Acceptance criteria cover the approved Lab 3 scope.

\* \[ ] Lab 2 regression requirements are explicitly covered.

\* \[ ] The four documents are committed to the Issue #26 feature branch.

\* \[ ] The feature branch is pushed to GitHub.

\* \[ ] A Pull Request is opened against `lab3-staging`.

\* \[ ] The Pull Request receives required review.

\* \[ ] Review comments are addressed.

\* \[ ] The Pull Request is merged into `lab3-staging`.

\* \[ ] No Lab 3 implementation is considered complete unless it satisfies the approved contract and its planned tests.



\---



\## 14. Assumptions and Decisions



\*\*AD-01 — One Role per User\*\*



Each User has exactly one role in Lab 3. Multiple simultaneous roles are excluded.



\*\*AD-02 — Server-Side Authorization\*\*



Backend authorization is authoritative. Frontend visibility is only a usability feature.



\*\*AD-03 — Administrator and IT Staff Separation\*\*



Administrator access does not automatically grant IT Staff Ticket operations.



\*\*AD-04 — No User Deletion\*\*



Accounts are deactivated rather than deleted so existing relationships and Ticket history remain intact.



\*\*AD-05 — Password Security\*\*



Only password hashes are stored. Plaintext passwords are never persisted.



\*\*AD-06 — Session Security\*\*



Authentication uses a secure server-managed session mechanism with an HttpOnly cookie. Authentication details are not stored in browser local storage.



\*\*AD-07 — Existing Data Preservation\*\*



Lab 2 Tickets, Attachments, Categories, Related Systems, and ownership relationships must survive migration.



\*\*AD-08 — Comments and Notes\*\*



Public Comments and Internal Notes are append-only during Lab 3.



\*\*AD-09 — Actions Taken\*\*



Actions Taken is intentionally deferred to Lab 4 and does not participate in Lab 3 resolution validation.



\*\*AD-10 — User Management Simplicity\*\*



Administrator User Management intentionally excludes deletion, bulk operations, import/export, advanced filtering, multiple roles, and account-history features.



\*\*AD-11 — Local Development Credentials\*\*



Seeded credentials exist only for local development and testing. Real personal passwords or secrets must never be committed.



\---



\## 15. Traceability Summary



The engineering contract will use the following traceability chain throughout Lab 3:



```text

Functional Requirement

&#x20;       ↓

Business Rule / Authorization Rule

&#x20;       ↓

Acceptance Criterion

&#x20;       ↓

Planned Test

&#x20;       ↓

Implementation

&#x20;       ↓

Test Result

&#x20;       ↓

Pull Request / Review Evidence

```



The final `main` branch is the source of truth for the com



