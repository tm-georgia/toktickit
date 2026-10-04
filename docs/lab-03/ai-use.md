# Lab 3 - AI Use and Reflection

## AI Tool Used

ChatGPT was used as an AI assistant during Lab 3 development.

The AI was mainly used for:
- Understanding the Lab 3 requirements and rubric.
- Planning implementation steps.
- Debugging TypeScript, React, Express, and test errors.
- Reviewing UI behavior and responsive layouts.
- Creating and improving automated tests.
- Debugging Playwright E2E tests.
- Preparing documentation and evidence for the Lab 3 submission.

The final implementation was checked and tested by the student.

## Selected Key Prompts

### 1. Lab 3 implementation planning
"Help me continue the TokTickIT Lab 3 implementation. I need Users/Roles/IT Staff Ticketing/Admin with REQUESTER, IT_STAFF, and ADMINISTRATOR roles."

Purpose:
Used to understand the required Lab 3 features and divide the implementation into manageable parts.

### 2. IT Staff ticket detail UI
"I want the IT Staff Ticket Detail frontend to show Ticket Owner, Ticket Number, Requested Priority, IT Priority, Current Status, comments, internal notes, attachments, and actions, and it must be connected to the backend."

Purpose:
Used to plan and debug the IT Staff ticket detail interface and its backend integration.

### 3. Administrator user management UI
"I need the administrator user management page with create user, search, role filter, edit, activate/deactivate, and initial password visibility."

Purpose:
Used to improve the Administrator UI while keeping the existing backend functionality.

### 4. Frontend testing
"Help me create Lab 3 frontend tests for Login, Change Password, IT Staff Ticket Queue, IT Staff Ticket Detail, and User Management."

Purpose:
Used to create automated UI tests for the major Lab 3 screens.

### 5. Test debugging
"My frontend test is failing. Here is the error output. Help me fix the test without changing working application functionality."

Purpose:
Used repeatedly to diagnose test failures and adjust test selectors or test setup.

### 6. Playwright authentication test
"Create an E2E test that verifies a user can log in successfully without changing the user's password."

Purpose:
Used to create a real authentication E2E test while avoiding changes to the existing user account.

### 7. IT Staff E2E flow
"Create a Playwright test for IT Staff login, opening the IT Staff queue, and opening a ticket."

Purpose:
Used to verify the real IT Staff workflow from login through ticket detail.

### 8. Administrator E2E flow
"Create a Playwright test for Administrator login and user management, including searching for a user and checking the Edit and Deactivate actions."

Purpose:
Used to verify the real Administrator user-management workflow.

### 9. Responsive screenshot evidence
"Generate real desktop, tablet, and mobile screenshots for authentication, IT Staff queue, IT Staff ticket detail, and user management."

Purpose:
Used to create evidence for the responsive UI requirements in the Lab 3 rubric.

## My Reflection

AI assistance was useful for both specification work and implementation, but it was not treated as a replacement for testing or decision-making.

For specification work, AI helped break the Lab 3 requirements into smaller features and clarify what each screen and role needed to support. This made it easier to organize the implementation and testing.

For coding work, AI was especially useful when debugging TypeScript errors, React UI issues, automated tests, and Playwright E2E tests. When a test failed, the actual error output was used to identify the problem rather than assuming that the application was correct.

One important lesson was that AI-generated code cannot always be assumed to match the actual application. For example, some E2E tests initially used incorrect account information or expected UI text that was different from the real application. The tests had to be checked against the actual running system and adjusted accordingly.

I also learned that automated tests should verify real application behavior instead of using fake data or simply creating files to satisfy the rubric. The final E2E tests use the real login flow and real application pages.

Overall, AI helped me work faster and understand problems during development, while I remained responsible for checking the implementation, running the tests, verifying the UI, and making the final decisions.