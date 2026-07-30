# Nexora.ai System Architecture Blueprint

This document outlines the architectural patterns, folder conventions, and design philosophies of Nexora.ai.

## Monorepo Layout
Nexora.ai is structured as an npm workspaces monorepo to maintain separate backend services and client applications under a unified project directory, maximizing developer efficiency and ease of testing.

```
Nexora-AI
 ├── client/               # Frontend React Application
 ├── server/               # Express API & Real-time Server
 └── docs/                 # System and Architectural documentation
```

---

## Backend Architectural Philosophy
The backend is designed following a **Layered Architecture** (often referred to as Controller-Service-Repository pattern). It enforces strict boundaries to decouple network handling, business rules, and persistent storage.

```
Request  ──>  Routes  ──>  Middlewares  ──>  Controllers  ──>  Services  ──>  Models (Mongoose)  ──> DB
                                                  │ (Raises AppError)
                                                  └── Centralized Global Error Handler
```

### Core Layers:
1. **Routing (`src/routes/`)**: Declares API path trees and aggregates sub-routers. Validates request parameters and associates endpoints with specific authorization policies.
2. **Controller (`src/controllers/`)**: Responsible for parsing request payloads, verifying headers, invoking business services, and shaping final response structures. Controllers do not directly contact databases.
3. **Services (`src/services/`)**: Encompasses core business operations, algorithmic operations, transactions, and interactions with external utilities. Designed to be framework-agnostic.
4. **Data Models (`src/models/`)**: Defines structural Mongoose schemas and indexes for MongoDB collections. Contains model-level hooks, validations, and virtual relations.
5. **Middlewares (`src/middlewares/`)**: Modular filters performing operations such as request logging, auth authorization checks, and rate-limiting.
6. **Error Handler (`src/middlewares/errorHandler.js`)**: Catch-all mechanism intercepting exceptions and standardizing API error responses using operational hierarchy (`AppError`).

---

## Client Architectural Philosophy
The frontend uses a **Feature-Based Architecture** (inspired by modern React best-practices like Bulletproof React). This aligns the codebase with domain-driven design, localizing views, states, hooks, and API services next to their corresponding modules.

```
client/src/
 ├── components/           # UI Atoms and molecules (Button, Input, Layouts)
 ├── config/               # Global clients configuration (Axios, React Query)
 ├── context/              # Context Providers for cross-cutting UI states (Theme, Sidebar)
 ├── features/             # Domain Feature Folders
 │    └── [feature]/       # Isolated modules (e.g. tasks, projects)
 │         ├── components/ # Local components specific to the feature
 │         ├── hooks/      # Feature hooks and DnD helper systems
 │         └── services/   # TanStack Query custom hooks (mutations, queries)
 ├── routes/               # Routing hierarchy (React Router v7 layout engines)
 └── styles/               # Styling configuration (Tailwind v4 base variables)
```

### Main Benefits:
- **Scalability**: Scaling the codebase requires adding isolated domain directories rather than swelling generic folders.
- **Maintainability**: Low coupling guarantees that refactoring feature-specific views will not break unrelated parts of the app.
- **Velocity**: Clear separation of concern isolates developer focus, accelerating feature development.
