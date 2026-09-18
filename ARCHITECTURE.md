# BrainBattles Architecture

## 1. Architecture Overview

BrainBattles is a client-side web application built with React and TypeScript. The application uses Supabase for authentication and persistent data storage.

The architecture follows a simple separation of responsibilities:

* **React** manages the user interface and application behavior.
* **React Router** manages navigation between public and protected pages.
* **React Context** provides authentication state throughout the application.
* **Supabase Auth** handles user authentication and sessions.
* **Supabase PostgreSQL** stores user profiles, educational content, and battle results.
* **Shared components** provide reusable UI and application functionality across pages.

At a high level, the application follows this structure:

```text
                         BrainBattles
                              │
                ┌─────────────┴─────────────┐
                │                           │
         React Application             Supabase
                │                           │
      ┌─────────┼─────────┐          ┌──────┴──────┐
      │         │         │          │             │
   Routing   Components  Context    Auth       PostgreSQL
      │         │         │          │             │
      └─────────┴─────────┘          └─────────────┘
                │
                ▼
          User Interface
```

The application is designed to keep the frontend lightweight while maintaining clear boundaries between presentation, application logic, authentication, and data access. This makes the codebase easier to understand, test, maintain, and extend as new learning features are added.

## 2. Technology Stack

## 2. Technology Stack

The application is built primarily with React and TypeScript, using Vite for development and production builds. React Router manages client-side navigation, while Supabase provides authentication and database services.

The UI is built with Tailwind CSS and reusable components, with Radix UI used where accessible UI primitives are required. KaTeX is used to render mathematical expressions.

For the complete list of technologies and development tools, see the **Tech Stack** section in `README.md`.


## 3. Application Structure

BrainBattles follows a component-based React architecture with a clear separation between presentation, application logic, authentication, data access, and shared type definitions.

The main architectural layers are:

```text
Pages
  │
  ▼
Shared Components
  │
  ▼
Application Logic & Context
  │
  ▼
Supabase Client
  │
  ▼
Supabase Auth / PostgreSQL
```

### Pages

Pages represent the application's primary user-facing screens and correspond to application routes. They compose shared components and manage page-specific behavior.

### Shared Components

Reusable components provide common UI and application functionality across multiple pages. For example, `QuestionCard` is shared by the Practice and Battle experiences.

### Application Logic

Shared application logic is centralized where appropriate. `AuthContext` manages authentication state, while utilities and shared functionality are kept separate from page-specific code.

### Data Access

Supabase is accessed through the centralized Supabase client. Authentication is handled through Supabase Auth, while application data is stored in the Supabase PostgreSQL database.

### Shared Types

Common TypeScript types are maintained separately so that data structures can be consistently used across pages, components, and application logic.

This structure keeps individual pages focused on their responsibilities while allowing common functionality to be reused across the application.


## 4. Application Flow

BrainBattles follows a straightforward client-side application flow. Authentication state is established when the application starts, and protected routes use that state to determine whether the user can access authenticated pages.

### Application Startup

When the application loads:

```text
main.tsx
   │
   ▼
App.tsx
   │
   ▼
AuthProvider
   │
   ├── Check current Supabase session
   │
   ├── No authenticated user
   │       │
   │       ▼
   │     Public routes
   │
   └── Authenticated user
           │
           ▼
       Protected routes
```

`AuthProvider` initializes the application's authentication state by checking the current Supabase session. It exposes the authenticated user and authentication state through the `useAuth()` hook.

### Unauthenticated Flow

When there is no active authentication session, the user can access public pages such as the landing, login, registration, and password-reset pages.

Attempting to access a protected route without authentication causes `ProtectedRoute` to redirect the user to the login page.

```text
Application Load
       │
       ▼
No active session
       │
       ▼
Public Application
       │
       ├── Landing
       ├── Login
       ├── Register
       └── Password Reset
```

### Authenticated Flow

After a successful login or registration, the application navigates to the authenticated portion of the application.

```text
Successful Authentication
          │
          ▼
      Dashboard
          │
    ┌─────┼─────────────┬──────────────┐
    ▼     ▼             ▼              ▼
 Profile Practice      Battle       Leaderboard
```

Authenticated pages obtain the current user from `AuthContext` through `useAuth()` rather than independently querying Supabase for the authenticated user.

### Logout Flow

When the user logs out, Supabase clears the authentication session and the application redirects the user to the landing page.

```text
Authenticated Application
          │
          ▼
        Logout
          │
          ▼
 Supabase session cleared
          │
          ▼
     Landing page
```

This centralized flow keeps authentication state consistent across the application and avoids unnecessary authentication requests from individual pages.


## 5. Authentication Architecture

BrainBattles uses **Supabase Auth** for user authentication and **React Context** to make authentication state available throughout the application.

The authentication architecture has three primary responsibilities:

* **Supabase Auth** — manages authentication sessions and user identity.
* **AuthContext** — initializes and exposes authentication state to the React application.
* **ProtectedRoute** — prevents unauthenticated users from accessing protected pages.

### Authentication Flow

```text id="7m4q1v"
                    Supabase Auth
                         │
                         │ Current session
                         ▼
                  ┌─────────────┐
                  │ AuthContext │
                  └──────┬──────┘
                         │
                    useAuth()
                         │
            ┌────────────┴────────────┐
            ▼                         ▼
     ProtectedRoute              App Pages
            │
            ▼
     Access decision
       │          │
       ▼          ▼
Authenticated   Unauthenticated
       │          │
       ▼          ▼
 Protected      Login
   pages         page
```

### AuthContext

`AuthContext` is the central source of authentication state within the application.

When the application starts, `AuthProvider` checks the current Supabase session and establishes whether a user is authenticated. It exposes the relevant authentication state through the `useAuth()` hook.

Pages and components that need the current authenticated user consume `useAuth()` rather than making their own calls to Supabase to retrieve the user.

This provides a single source of truth for authentication state and avoids unnecessary authentication requests.

### Protected Routes

Authenticated application pages are wrapped by `ProtectedRoute`.

`ProtectedRoute` checks the authentication state provided by `AuthContext`:

* If the user is authenticated, the requested page is rendered.
* If the user is not authenticated, the user is redirected to the login page.

This keeps authentication checks separate from individual page implementations.

### User Profile

Authentication identity is managed by Supabase Auth, while application-specific user information is stored in the `profiles` table.

After successful authentication, the application ensures that a corresponding profile exists for the authenticated user.

The profile can contain application-specific information such as display name, bio, battle statistics, and favorite category.

### Login and Registration

BrainBattles supports:

* Email and password authentication
* Google authentication
* Password recovery and reset

Successful authentication results in navigation to the authenticated application, where `ProtectedRoute` controls access to protected pages.

### Logout

Logout is handled through Supabase Auth. After the session is cleared, the application redirects the user to the landing page.

Keeping authentication responsibilities centralized allows the rest of the application to remain largely independent of the underlying authentication mechanism.


## 6. Data Architecture

BrainBattles uses **Supabase PostgreSQL** as its persistent data store. The database is organized around user information, educational content, and battle activity.

### Data Model

The primary tables are:

```text
                    ┌──────────────┐
                    │   subjects   │
                    └──────┬───────┘
                           │
                           │ 1 : many
                           ▼
                    ┌──────────────┐
                    │    units     │
                    └──────┬───────┘
                           │
                           │ 1 : many
                           ▼
                    ┌──────────────┐
                    │  questions   │
                    └──────────────┘


                    ┌──────────────┐
                    │   profiles   │
                    └──────┬───────┘
                           │
                           │ 1 : many
                           ▼
                    ┌──────────────┐
                    │battle_results│
                    └──────────────┘
```

### Core Tables

#### `profiles`

Stores application-specific information associated with an authenticated user.

Examples include:

* User ID
* Display name
* Bio
* Total battles
* Total score
* Battles won
* Favorite category

The authenticated user's identity is managed by Supabase Auth, while the `profiles` table stores information specific to the BrainBattles application.

#### `subjects`

Defines the major academic subjects available in the application, such as Mathematics, Physics, and Chemistry.

#### `units`

Defines the individual units within a subject.

Each unit references its parent subject through a foreign key.

```text
Subject
   │
   ├── Unit 1
   ├── Unit 2
   └── Unit 3
```

#### `questions`

Stores the questions used by the Practice and Battle experiences.

Each question references a unit through `unit_id`, allowing questions to be organized by subject and unit.

This structure allows educational content to be expanded without changing the application structure.

#### `battle_results`

Stores the results of completed battles.

Battle results are associated with the user and contain information required to record the outcome and performance of a battle.

This data can be used to support user statistics, scores, and leaderboard functionality.

### Data Access

The application uses the centralized Supabase client to communicate with the database.

Pages and components request only the data required for their specific functionality. For example:

* **Practice** retrieves questions associated with the selected unit.
* **Battle** retrieves questions and records battle results.
* **Profile** retrieves and updates the authenticated user's profile.
* **Leaderboard** retrieves the data required to display user rankings.

### Relationships and Referential Integrity

Foreign keys are used to maintain relationships between related records.

The primary content hierarchy is:

```text
Subject
   ↓
Unit
   ↓
Question
```

User activity is associated with the authenticated user through:

```text
Authenticated User
       ↓
    Profile
       ↓
Battle Results
```

This relational structure keeps educational content separate from user-specific activity while providing clear relationships between the entities.

### Row Level Security

Supabase Row Level Security (RLS) policies control access to database records.

Policies are defined according to whether data is:

* **Public application content**, such as educational questions and subject/unit information.
* **User-specific data**, such as profiles and battle results.

RLS provides a database-level security layer in addition to the application's route and authentication checks.


## 7. Routing Architecture

BrainBattles uses **React Router** for client-side navigation. Routes are defined in `App.tsx` and are organized into public and protected routes.

### Route Categories

The application has two main route categories:

* **Public routes** — accessible without authentication.
* **Protected routes** — accessible only to authenticated users.

```text id="4m9r2x"
                    App.tsx
                       │
              ┌────────┴────────┐
              │                 │
              ▼                 ▼
        Public Routes      Protected Routes
              │                 │
              │                 ▼
              │          ProtectedRoute
              │                 │
              │          ┌──────┴──────┐
              │          │             │
              │     Authenticated   Unauthenticated
              │          │             │
              │          ▼             ▼
              │     Render Page     Login
              │
              ▼
        Public Pages
```

### Public Routes

Public routes include pages that users need to access before authentication, such as:

* Landing
* Login
* Register
* Forgot Password
* Reset Password

### Protected Routes

The main application features are protected and require an authenticated user.

These include:

* Dashboard
* Profile
* Practice
* Battle
* Leaderboard

Protected routes are wrapped with `ProtectedRoute`, which uses the authentication state provided by `AuthContext`.

### Route Protection

`ProtectedRoute` does not independently authenticate the user. Instead, it relies on the centralized authentication state exposed by `AuthContext`.

The flow is:

```text id="q4k1zs"
User requests protected route
          │
          ▼
   ProtectedRoute
          │
          ▼
    useAuth() state
       │       │
       ▼       ▼
Authenticated  Not authenticated
       │              │
       ▼              ▼
 Render page      Redirect to
                  Login
```

This keeps route protection consistent across all authenticated pages and prevents individual pages from implementing their own authentication checks.

### Not Found Routes

A dedicated not-found component handles routes that do not match any defined application route, providing a consistent 404 experience.

### Navigation

Navigation between pages is handled through React Router without requiring full page reloads. This allows BrainBattles to behave as a single-page application while maintaining separate URLs for each application experience.


## 8. Component Architecture

BrainBattles follows a reusable, component-based React architecture. Pages are responsible for page-level behavior and composition, while shared components encapsulate functionality that is used across multiple parts of the application.

### Component Hierarchy

The application can be viewed as three primary component layers:

```text id="h6j3p4"
Pages
  │
  ├── Layout Components
  │      │
  │      └── AppLayout / AuthLayout
  │
  └── Feature & Shared Components
         │
         ├── Quiz Components
         │      └── QuestionCard
         │
         ├── UI Components
         │
         └── Other Shared Components
```

### Page Components

Page components represent complete application screens and are responsible for:

* Managing page-specific state
* Fetching data required by the page
* Handling page-specific user interactions
* Composing reusable components

Pages should avoid duplicating functionality that can be shared across multiple screens.

### Layout Components

BrainBattles uses separate layouts for different areas of the application.

**`AppLayout`** provides the common structure for authenticated pages, including shared navigation and application-level UI.

**`AuthLayout`** provides the common structure for authentication-related pages such as Login and Register.

Layouts allow common UI and behavior to be maintained in one place rather than duplicated across pages.

### Shared Feature Components

Feature components encapsulate functionality that is shared by multiple pages.

For example, **`QuestionCard`** provides the common question presentation and interaction used by both Practice and Battle. This ensures that question-related behavior and UI remain consistent across these experiences.

### UI Components

Reusable UI components provide consistent visual and interaction patterns throughout the application.

Where appropriate, accessible UI primitives are composed into application-specific components rather than implementing the same interaction patterns independently on each page.

### Component Design Principles

The component architecture follows these principles:

* **Reuse** — common functionality should be implemented once and reused.
* **Single responsibility** — components should have a clear and focused purpose.
* **Composition** — pages should compose smaller components rather than becoming monolithic.
* **Consistency** — shared components should provide consistent behavior and appearance.
* **Accessibility** — reusable components should preserve accessible interaction patterns.

This approach allows new features to be added by composing existing components where possible, while keeping page-specific logic isolated to the appropriate page.


## 9. State Management

BrainBattles uses React's built-in state management capabilities rather than a dedicated global state-management library.

The application uses three primary approaches:

* **React Context** — for authentication state that needs to be accessed across the application.
* **Component state** — for state that is specific to an individual page or component.
* **Server state** — for data retrieved from Supabase and used by the relevant page or feature.

### Authentication State

Authentication state is managed centrally by `AuthContext`.

The `AuthProvider` makes the current authenticated user and related authentication state available throughout the application. Components and pages access this state through the `useAuth()` hook.

```text id="v2q8sm"
                  AuthProvider
                       │
                       ▼
                  useAuth()
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
       Profile      Practice      Battle
```

This avoids maintaining separate authenticated-user state in individual pages.

### Local Component State

State that is specific to a page or component is managed locally using React hooks such as `useState`.

Examples include:

* Selected subject and unit in Practice
* Selected answer in a question
* Current question and quiz progress
* Loading and interaction states
* Form input values

Local state remains close to the component that owns and uses it, reducing unnecessary shared state.

### Server Data

Application data stored in Supabase is retrieved by the feature that requires it. Examples include questions, units, profiles, and battle results.

Server data is not copied into a separate global state store unless there is a specific requirement to share or cache it.

### State Management Principles

The application follows a **minimal-state approach**:

* Keep state as local as possible.
* Use Context only for genuinely shared application state.
* Use `useAuth()` as the single source for authenticated-user state.
* Avoid duplicating server data unnecessarily.
* Avoid introducing a state-management library until application requirements justify it.

This approach keeps the application architecture lightweight and makes the ownership and lifecycle of state easier to understand.

## 10. Error Handling

BrainBattles uses three mechanisms for communicating errors and important feedback to users:

1. **`ErrorMessage.tsx`**
2. **Toast notifications**
3. **Inline errors**

The appropriate mechanism is selected based on the scope and context of the error.

### 1. ErrorMessage.tsx

`ErrorMessage.tsx` is used for errors that affect the primary content or functionality of a page.

It provides a consistent error state within the page and can be used when the application cannot display the expected content.

Examples include:

* Failure to load page data
* Failure to retrieve questions
* Other errors that prevent a page or feature from functioning normally

### 2. Toast Notifications

Toast notifications are used for brief, non-blocking feedback that does not require the user to leave their current context.

They are appropriate for actions that succeed or fail while the user remains on the same page.

Examples include:

* Successful profile updates
* Successful logout
* Action-specific failures
* Other short-lived notifications

### 3. Inline Errors

Inline errors are displayed next to the relevant field or UI element when the error is directly related to a specific user action or input.

They provide immediate context about what needs to be corrected.

Examples include:

* Invalid form input
* Missing required fields
* Incorrect login or registration information
* Validation errors

### Error Handling Guidelines

The three mechanisms serve different purposes:

| Mechanism               | Primary Use                                                       |
| ----------------------- | ----------------------------------------------------------------- |
| **`ErrorMessage.tsx`**  | Errors that affect page content or prevent a feature from loading |
| **Toast notifications** | Brief, non-blocking feedback about an action                      |
| **Inline errors**       | Field-level or input-specific validation and errors               |

Using these mechanisms consistently keeps error feedback clear and prevents technical errors from being exposed directly to users.

## 11. Deployment Architecture

BrainBattles is deployed as a client-side web application. The source code is maintained in GitHub, while Cloudflare Pages builds and hosts the production application.

Supabase provides the backend services required by the deployed application.

### Deployment Flow

```text id="d8q4mw"
                     GitHub
                       │
                       │ Push / Commit
                       ▼
                Cloudflare Pages
                       │
                       │ Vite build
                       ▼
                Production Build
                       │
                       ▼
                 Web Application
                       │
                       │ HTTPS
                       ▼
                   Supabase
                  ┌────┴────┐
                  ▼         ▼
                Auth     Database
```

### Source Control

GitHub is the source-control repository for BrainBattles.

Changes are committed and pushed to the repository before being deployed to the production environment.

### Build and Hosting

Cloudflare Pages is responsible for building and hosting the application.

The production deployment process uses the Vite build configuration to generate the optimized frontend assets that are served to users.

Because BrainBattles is a client-side React application, the deployed application runs primarily in the user's browser.

### Backend Services

The production frontend communicates with Supabase for:

* User authentication
* PostgreSQL database access

The Supabase URL and public client key are provided to the application through environment variables.

Sensitive credentials and secrets are not stored in the source code repository.

### Environment Separation

Environment-specific configuration is provided through environment variables rather than hard-coded values.

This allows the application to be built and deployed without embedding environment-specific configuration directly into the source code.

### Deployment Principles

The deployment architecture follows these principles:

* Keep the frontend deployment independent from backend services.
* Store source code and version history in GitHub.
* Use Cloudflare Pages for automated production builds and hosting.
* Keep environment-specific configuration outside the source code.
* Use Supabase as the managed authentication and database layer.
