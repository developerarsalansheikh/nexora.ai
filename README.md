# Nexora.ai — Enterprise AI Project Management SaaS

> A production-grade, full-stack MERN application inspired by the architectures of **Jira**, **Linear**, and **ClickUp** — built for scale, maintainability, and developer clarity.

---

## Project Overview

Nexora.ai is an enterprise SaaS platform for AI-powered project management. It combines real-time collaboration, smart automation, and deep sprint analytics into a unified workspace — all built on a clean, layered, modular architecture.

---

## Tech Stack

### Frontend (`client/`)
| Technology | Purpose |
|---|---|
| React 19 | UI framework |
| Vite 5 | Build tool + dev server |
| Tailwind CSS v4 | Utility-first styling |
| React Router v7 | Client-side routing |
| TanStack Query v5 | Server state management |
| Axios | HTTP client with interceptors |
| Framer Motion | Animations |
| DnD Kit | Drag-and-drop (Kanban board) |
| ESLint + Prettier | Code quality enforcement |

### Backend (`server/`)
| Technology | Purpose |
|---|---|
| Node.js + Express | HTTP server |
| MongoDB + Mongoose | Database + ODM |
| Socket.io | Real-time WebSockets |
| JWT (access + refresh) | Stateless authentication |
| Helmet | HTTP security headers |
| Compression | Response gzip compression |
| Morgan + Custom Logger | Request logging |
| Cookie Parser | HTTP cookie handling |
| Cloudinary | Media/asset CDN |
| Nodemailer | Transactional email |
| Express Rate Limit | DDoS / brute-force protection |
| Bcryptjs | Password hashing |

---

## Folder Structure

```
Nexora-AI/
 ├── client/                     # React 19 frontend application
 │    ├── src/
 │    │    ├── assets/            # Static assets (logo, icons)
 │    │    ├── components/        # Shared reusable UI components
 │    │    ├── config/            # Axios client, TanStack QueryClient
 │    │    ├── constants/         # Routes, API endpoints, colors, messages
 │    │    ├── features/          # Feature-based domain folders
 │    │    │    ├── dashboard/
 │    │    │    ├── projects/
 │    │    │    └── settings/
 │    │    ├── layouts/           # AppLayout (sidebar + header frame)
 │    │    ├── providers/         # AppProvider, QueryProvider, UIProvider
 │    │    ├── routes/            # React Router v7 route configuration
 │    │    ├── styles/            # Tailwind v4 base stylesheet
 │    │    └── utils/             # Format helpers
 │    ├── .env.example
 │    ├── .env.development
 │    ├── .env.production
 │    ├── eslint.config.js
 │    ├── jsconfig.json
 │    └── vite.config.js
 │
 ├── server/                     # Express API + Socket.io backend
 │    ├── src/
 │    │    ├── config/            # DB connection, Socket.io init
 │    │    ├── constants/         # Roles, permissions, statuses, messages, HTTP codes
 │    │    ├── controllers/       # Thin HTTP handlers (no business logic)
 │    │    ├── middlewares/       # errorHandler, notFoundHandler, requestLogger
 │    │    ├── models/            # Mongoose schemas (added per feature)
 │    │    ├── repositories/      # BaseRepository + feature repositories
 │    │    ├── routes/            # Express router aggregation
 │    │    ├── services/          # BaseService + feature business logic
 │    │    ├── utils/             # ApiError, ApiResponse, asyncHandler, logger
 │    │    ├── validators/        # Request validation (validateRequest, requireFields)
 │    │    ├── app.js             # Express app configuration
 │    │    └── index.js           # HTTP server bootstrapper
 │    ├── .env.example
 │    ├── .env.development
 │    ├── .env.production
 │    ├── eslint.config.js
 │    └── jsconfig.json
 │
 ├── docs/                       # System documentation
 │    ├── ARCHITECTURE.md
 │    ├── STATE_MANAGEMENT.md
 │    └── REALTIME.md
 │
 ├── .gitignore
 ├── .prettierrc
 └── package.json                # Root workspace (npm workspaces)
```

---

## Installation

### Prerequisites
- Node.js >= 20.x
- MongoDB >= 7.x (local or Atlas)
- npm >= 10.x

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/your-org/nexora-ai.git
cd nexora-ai

# 2. Install all workspace dependencies (root, client, server)
npm install

# 3. Configure environment variables
cp server/.env.example server/.env.development
cp client/.env.example client/.env.development
# Fill in the required values in both files
```

---

## Environment Variables

### Server (`server/.env.development`)
| Variable | Description | Required |
|---|---|---|
| `NODE_ENV` | Environment (`development` / `production`) | ✅ |
| `PORT` | Express server port | ✅ |
| `MONGODB_URI` | MongoDB connection string | ✅ |
| `JWT_ACCESS_SECRET` | Access token signing key (min 32 chars) | ✅ |
| `JWT_REFRESH_SECRET` | Refresh token signing key (min 32 chars) | ✅ |
| `CORS_ORIGIN` | Allowed CORS origin | ✅ |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | ⚙️ |
| `GEMINI_API_KEY` | Google Gemini AI key | ⚙️ |
| `SMTP_*` | Email credentials (Nodemailer) | ⚙️ |

### Client (`client/.env.development`)
| Variable | Description | Required |
|---|---|---|
| `VITE_API_BASE_URL` | Backend API base URL | ✅ |
| `VITE_SOCKET_URL` | Socket.io server URL | ✅ |
| `VITE_APP_NAME` | Application display name | ✅ |

---

## Scripts

### Root (runs both concurrently)
```bash
npm run dev          # Start both server + client in dev mode
npm run build        # Build the client for production
npm run install:all  # Install all workspace dependencies
```

### Server only
```bash
npm run dev          # nodemon — hot reload
npm run start        # node — production
npm run lint         # ESLint check
npm run lint:fix     # ESLint auto-fix
npm run format       # Prettier format
```

### Client only
```bash
npm run dev          # Vite dev server
npm run build        # Production bundle
npm run preview      # Preview production build
npm run lint         # ESLint check
npm run format       # Prettier format
```

---

## Development Workflow

```
1. git checkout -b feature/your-feature-name
2. Implement feature following layered architecture:
   Controller → Service → Repository → Model
3. Add validators in server/src/validators/
4. Export new routes in server/src/routes/api.js
5. Write TanStack Query hooks in client/src/features/<module>/services/
6. Run npm run lint before committing
7. Open a Pull Request
```

---

## Architecture

See [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) for the full system blueprint.

### Key Principles

| Principle | Rule |
|---|---|
| **Thin Controllers** | Only HTTP — no business logic |
| **Service Layer** | All business logic lives here |
| **Repository Pattern** | All DB queries live in repositories |
| **Constants over Strings** | Never hardcode status, role, or route strings |
| **ApiError over throw** | Use `ApiError.notFound()`, `ApiError.badRequest()` etc. |
| **asyncHandler** | Wrap all async controllers — no try-catch boilerplate |
| **ApiResponse** | All API responses use the standard envelope |

---

## Coding Standards

- **JavaScript only** — No TypeScript
- **ESM modules** (`import/export`) everywhere
- **Prettier** enforced on all commits (single quote, semicolons, 100 char width)
- **ESLint** — zero `no-unused-vars`, zero `no-console` (except warn/error)
- **`prefer-const`** — never use `var` or unnecessary `let`
- **`@/`** path alias — never use `../../../../` relative imports
- **`Object.freeze()`** — all constant objects are frozen

---

## Deployment Preparation

- Set `NODE_ENV=production` in server environment
- Set all secrets as environment variables (never in code)
- Use MongoDB Atlas for managed cloud database
- Use Cloudinary CDN for file storage
- Deploy server to Railway / Render / AWS EC2
- Deploy client to Vercel / Netlify / AWS CloudFront

---

*Built with enterprise architecture by the Nexora.ai Engineering Team.*
