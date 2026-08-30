# NotesHub

**Cohort 9 — MERN (Node.js + React.js) Internship Project**

NotesHub is a full-stack note management application developed as part of the **10Pearls Shine Internship — Cohort 9**. It allows authenticated users to create, view, edit, delete, and organize notes into folders through a responsive React frontend and Node.js/Express backend.

## Features

* User registration and login
* Cookie-based JWT authentication
* Protected routes and user-specific notes
* Create, edit, and delete notes
* Rich-text note editing using Tiptap
* Folder creation, editing, deletion, and navigation
* Move notes between folders
* Explorer view for folders and notes
* Responsive dashboard
* Dark/light theme
* Application logging using Pino
* Centralized error handling
* Backend unit testing with Mocha/Chai
* Frontend testing with Vitest
* SonarQube code-quality and coverage analysis

## Tech Stack

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* shadcn/ui
* Redux Toolkit
* React Router
* Axios
* Tiptap
* Vitest + React Testing Library

### Backend

* Node.js
* Express
* TypeScript
* MongoDB
* Mongoose
* JWT
* Cookie Parser
* Pino Logger
* Mocha + Chai
* Sinon

### Code Quality

* SonarQube
* SonarQube Scanner
* Git

## Project Structure

```text
cohort-9-mern-13256-syeda/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── types/
│   │   ├── utils/
│   │   └── server.ts
│   └── tests/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── lib/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── store/
│   │   ├── types/
│   │   └── main.tsx
│   └── tests/
│
├── coderabbit.yaml
├── sonar-project.properties
├── 2026-08-30-NotesHub-analysis-report.pdf
└── README.md
```

## Authentication

Authentication is implemented using JWT stored in HTTP cookies. Protected backend routes use authentication middleware to verify the token and identify the current user.

Users can:

* Register
* Log in
* Access their authenticated session
* Log out

Notes and folders are associated with their respective authenticated users.

## Notes and Folders

Notes support structured rich-text content through **Tiptap JSON**.

Users can:

* Create notes
* Edit notes
* Delete notes
* View individual notes
* Create and manage folders
* Move notes into folders
* Browse notes and folders through the Explorer

Notes can exist either in the root workspace or inside a folder.

## Testing

The project includes automated tests for critical application functionality.

### Backend

Backend tests use:

* Mocha
* Chai
* Sinon

Tests cover areas such as authentication, middleware, services, controllers, and other critical backend logic.

### Frontend

Frontend tests use:

* Vitest
* React Testing Library

Tests cover Redux slices, services, components, and pages.

Test coverage is monitored through SonarQube.

## Logging and Error Handling

The backend uses **Pino** for application logging.

Logging is used for important application events and errors. Centralized error-handling middleware provides consistent API error responses while logging exceptions.

## SonarQube

SonarQube is integrated into the project for:

* Code-quality analysis
* Coverage analysis
* Code-smell detection
* Maintainability checks
* Identifying duplicated or low-quality code

The generated SonarQube analysis report is included in the repository as:

```text
2026-08-30-NotesHub-analysis-report.pdf
```

## Git Workflow

Development follows a feature-branch workflow:

```text
main
  └── develop
       ├── feature/frontend/<feature-name>
       └── feature/backend/<feature-name>
```

Changes are developed in feature branches and merged into `develop` through pull requests.

## Running the Project

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Environment variables should be configured according to the provided `.env.example` files.

## Testing Commands

### Backend

```bash
cd backend
npm test
```

### Frontend

```bash
cd frontend
npm test
```

## Project Status

The core NotesHub functionality, authentication, notes and folder management, frontend/backend testing, logging, error handling, and SonarQube analysis have been implemented as part of the internship project.
