# BrainBattles

## Overview

BrainBattles is a web-based learning application designed to help students practice academic subjects through interactive questions and gamified learning experiences.

The application currently provides subject-based practice and battle experiences, user authentication, battle statistics, and a leaderboard.

BrainBattles is built with React and TypeScript and uses Supabase for authentication and data storage.

## Features

* **User Authentication**

  * Register with email and password
  * Log in with email and password
  * Sign in with Google
  * Forgot password and password reset

* **Practice**

  * Select a subject and unit
  * Practice questions from the selected unit
  * View answer explanations

* **Battle**

  * Answer questions in a gamified battle experience
  * Track battle score and results

* **Battle Statistics**

  * Track total battles
  * Track total score
  * Track battles won
  * Display battle statistics of the user on the dashboard

* **Leaderboard**

  * View user rankings based on battle performance

* **Profile**

  * View and manage user profile information

* **Responsive Experience**

  * Designed to work across desktop, tablet, and mobile devices


## Tech Stack

### Frontend

* **React 19** — UI development
* **TypeScript** — Type-safe application development
* **Vite** — Development server and build tool
* **React Router** — Client-side routing

### UI & Styling

* **Tailwind CSS** — Utility-first styling
* **Radix UI** — Accessible UI primitives
* **Framer Motion** — Animations and transitions
* **Lucide React** — Icons
* **Class Variance Authority** — Component variant management
* **tailwind-merge** — Tailwind class merging

### Backend Services

* **Supabase** — Authentication and database services

### Mathematical Content

* **KaTeX** — Mathematical expression rendering

### Development Tools

* **ESLint** — Code quality and linting
* **PostCSS** — CSS processing
* **Autoprefixer** — CSS vendor prefixing

## Application Routes

### Public Routes

| Route              | Description              |
| ------------------ | ------------------------ |
| `/`                | Landing page             |
| `/login`           | User login               |
| `/register`        | User registration        |
| `/forgot-password` | Request a password reset |
| `/reset-password`  | Set a new password       |

### Protected Routes

The following routes require authentication and are rendered within the application's shared layout:

| Route          | Description        |
| -------------- | ------------------ |
| `/dashboard`   | User dashboard     |
| `/profile`     | User profile       |
| `/practice`    | Practice questions |
| `/battle`      | Battle experience  |
| `/leaderboard` | User rankings      |

### Error Route

| Route | Description                                    |
| ----- | ---------------------------------------------- |
| `*`   | Page displayed for an invalid or unknown route |


## Project Structure

```text
src/
├── api/
│   └── supabaseClient.ts       # Supabase client configuration
│
├── components/
│   ├── quiz/
│   │   └── QuestionCard.tsx    # Reusable question component
│   ├── ui/                     # Reusable UI components
│   ├── AppLayout.tsx           # Layout for authenticated pages
│   ├── AuthLayout.tsx          # Layout for authentication pages
│   ├── ProtectedRoute.tsx      # Authentication guard for protected routes
│   └── ...                     # Other shared components
│
├── lib/
│   ├── AuthContext.tsx         # Application authentication state and logic
│   ├── MathText.tsx            # Mathematical expression rendering
│   ├── PageNotFound.tsx        # 404 page
│   └── utils.ts                # Shared utility functions
│
├── pages/                      # Application pages/routes
│   ├── Landing.tsx
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── ForgotPassword.tsx
│   ├── ResetPassword.tsx
│   ├── Dashboard.tsx
│   ├── Profile.tsx
│   ├── Practice.tsx
│   ├── Battle.tsx
│   ├── Leaderboard.tsx
│   └── ErrorMessage.tsx
│
├── types/                      # Shared TypeScript type definitions
│
├── App.tsx                     # Application routes and root component
├── main.tsx                    # Application entry point
├── App.css                     # Application-level styles
└── index.css                   # Global styles
```

### Directory Responsibilities

| Directory          | Purpose                                                                       |
| ------------------ | ----------------------------------------------------------------------------- |
| `api/`             | Supabase client configuration and API-related setup                           |
| `components/`      | Reusable UI and application components                                        |
| `components/quiz/` | Components specific to questions and quizzes                                  |
| `components/ui/`   | Reusable UI primitives                                                        |
| `lib/`             | Shared application logic, authentication, utilities, and common functionality |
| `pages/`           | Components representing application pages and routes                          |
| `types/`           | Shared TypeScript type definitions                                            |


## Prerequisites

Before running BrainBattles locally, make sure the following are available:

* **Node.js 20.19.0+ or 22.12.0+** — required to run the development server and build the application.
* **npm** — used to install dependencies and run project scripts.
* **Git** — required to clone the repository.
* **Supabase project** — required for authentication and database services.

You will also need access to the BrainBattles Supabase project's URL and publishable API key, which are configured through environment variables.

## Environment Variables

BrainBattles requires the following environment variables:

| Variable                        | Purpose                                          |
| ------------------------------- | ------------------------------------------------ |
| `VITE_SUPABASE_URL`             | URL of the BrainBattles Supabase project         |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key used by the application |
| `VITE_APP_URL`                  | Application URL used for authentication redirect URLs |

To configure the environment:

1. Create a `.env` file in the project root.
2. Add the required variables and their values.
3. Use `.env.example` as a reference for the required variable names.

The `.env` file is excluded from version control and must not be committed to the repository.

## Getting Started

### Install Dependencies

Clone the repository and navigate to the project directory:

```bash
git clone <repository-url>
cd brainbattles-v1
```

Install the project dependencies:

```bash
npm install
```

### Run the Development Server

Start the Vite development server:

```bash
npm run dev
```

The application will be available at the local development URL shown in the terminal. By default, Vite uses:

```text
http://localhost:5173
```

### Create a Production Build

Create an optimized production build:

```bash
npm run build
```

The production build is generated in the `dist/` directory.

To preview the production build locally:

```bash
npm run preview
```
## Authentication

BrainBattles uses **Supabase Authentication** to manage user authentication and sessions.

The application supports:

* Email and password registration
* Email and password login
* Google OAuth login
* Password reset
* Protected routes for authenticated users
* Automatic redirection of unauthenticated users to the login page

Authentication state is managed centrally through `AuthContext` and accessed throughout the application using the `useAuth()` hook.

After successful authentication, user profile information is stored in the `profiles` table in Supabase.

When a user logs out, the Supabase session is signed out and the user is redirected to the landing page.

## Database

BrainBattles uses **Supabase Postgres** for persistent application data.

The main tables currently used by the application are:

### `profiles`

Stores profile and battle-related information for registered users.

Key information includes:

* User ID
* Display name
* Bio
* Total battles
* Total score
* Battles won
* Favorite category

### `subjects`

Stores the academic subjects available in the application, such as:

* Physics
* Chemistry
* Mathematics

### `units`

Stores the units within each subject.

Each unit is associated with a subject through a foreign key relationship.

### `questions`

Stores the questions used by the application.

Questions are associated with a unit through a foreign key relationship, allowing questions to be organized by subject and unit.

Supabase Row Level Security (RLS) policies are used to control access to database records.


## Database

BrainBattles uses **Supabase Postgres** for persistent application data.

The main tables currently used by the application are:

### `profiles`

Stores profile and battle-related information for registered users.

Key information includes:

* User ID
* Display name
* Bio
* Total battles
* Total score
* Battles won
* Favorite category

### `subjects`

Stores the academic subjects available in the application, such as:

* Physics
* Chemistry
* Mathematics

### `units`

Stores the units within each subject.

Each unit is associated with a subject through a foreign key relationship.

### `questions`

Stores the questions used by the application.

Questions are associated with a unit through a foreign key relationship, allowing questions to be organized by subject and unit.

### `battle_results`

Stores the results of completed battles, including the user's battle performance and score.

Supabase Row Level Security (RLS) policies are used to control access to database records.

## Development Guidelines

When making changes to BrainBattles, follow these guidelines:

* **Use TypeScript** for application code and maintain proper type definitions.
* **Keep components focused** on a single responsibility and extract reusable functionality into shared components when appropriate.
* **Reuse existing UI components** from `components/ui/` instead of creating duplicate components.
* **Reuse shared types** from `src/types/` rather than defining duplicate types within individual components.
* **Keep authentication logic centralized** in `AuthContext` and use the `useAuth()` hook where authentication state is required.
* **Use the existing Supabase client** from `src/api/supabaseClient.ts` for database and authentication operations.
* **Keep page-specific logic within the relevant page or feature components** and avoid unnecessary global state.
* **Follow the existing responsive design approach** using Tailwind CSS to support desktop, tablet, and mobile experiences.
* **Run linting and a production build** before committing significant changes.
* **Test changes across the affected application flows** to avoid regressions in existing functionality.

## Testing

BrainBattles currently relies on manual functional and regression testing.

Before considering a change complete, test the affected functionality and verify that existing application flows continue to work as expected.

### Authentication Testing

The authentication flows should be tested for:

* User registration
* Email and password login
* Google OAuth login
* Logout
* Forgot password
* Password reset
* Protected route access
* Redirection of unauthenticated users to the login page

### Application Testing

The following authenticated functionality should be verified:

* Dashboard and battle statistics
* Profile
* Practice
* Battle
* Leaderboard
* Subject and unit selection
* Question display and answer explanations
* Mathematical expressions and question images
* Responsive behavior across desktop, tablet, and mobile devices

### Build and Code Quality

Before committing significant changes, run:

```bash
npm run lint
npm run build
```

A successful lint and production build should be confirmed before deployment.

## Deployment

BrainBattles is deployed as a production web application using **Cloudflare Pages**.

The application is connected to the GitHub repository, allowing deployments to be triggered when changes are pushed to the configured repository branch.

### Production Build

Cloudflare Pages builds the application using the following command:

```bash
npm run build
```

The generated production files are served from:

```text
dist/
```

### Environment Variables

The required environment variables must be configured in the Cloudflare Pages project settings for the production environment.

These include:

* `VITE_SUPABASE_URL`
* `VITE_SUPABASE_PUBLISHABLE_KEY`
* `VITE_APP_URL`

### Deployment Verification

After deployment, verify the production application by testing:

* Landing page and navigation
* Registration and login
* Google OAuth
* Password reset
* Protected routes
* Practice and Battle
* Profile and Leaderboard
* Responsive behavior

Any deployment should be followed by a brief regression test of the primary application flows.

## Future Enhancements

Potential future enhancements for BrainBattles include:

* Expand the question bank across 12th-standard Physics, Chemistry, and Mathematics.
* Support previous years question bank for the respective subject.
* Add more gamification features, rewards, and challenges.
* Introduce detailed student learning and performance insights.
* Add instructor/parent-focused features and progress visibility.
* Expand the application to support additional subjects and educational levels.
* Develop a native mobile application using React Native.
* Explore AI-powered learning experiences and personalized practice.
