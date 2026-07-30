# Nexora.ai State Management Architecture

Nexora.ai enforces a strict division between **Server State** and **Client UI State** to prevent performance bottlenecks, out-of-sync cache bugs, and state pollution.

```
┌────────────────────────────────────────────────────────────────────────┐
│                              Application State                         │
└───────────────────┬────────────────────────────────┬───────────────────┘
                    │                                │
                    ▼                                ▼
     ┌──────────────────────────────┐ ┌──────────────────────────────┐
     │         Server State         │ │        Client UI State       │
     │      (TanStack Query)        │ │    (Context API / State)     │
     └──────────────┬───────────────┘ └──────────────┬───────────────┘
                    │                                │
                    ▼                                ▼
     - Database Records (Projects, Tasks)    - Sidebar collapse toggle
     - Real-time Board updates                - Active Modals
     - Cache synchronization                  - UI Dark/Light Theme status
     - Optimistic UI transitions             - Form wizard local steps
```

---

## 1. Server State (TanStack Query)
All data retrieved from or written to the remote database is classified as **Server State**. For this state, we bypass local React state or generic Redux/Context architectures and use **TanStack Query** exclusively.

### Key Rules:
- **No Manual useEffect Fetching**: Component data retrieval must be driven by custom TanStack hooks defined inside their respective feature's `services/` directory (e.g. `useProjectDetail(id)`).
- **Custom Mutation Hooks**: Data modifications (POST/PUT/DELETE) must hook into `useMutation` handlers. These hooks will coordinate cache invalidation via `queryClient.invalidateQueries`.
- **Optimistic Updates**: For operations requiring instant responsiveness (e.g. dragging a task to a different lane), use TanStack Query's `onMutate` parameter to optimistically update the cache and rollback on failure.

---

## 2. Client UI State (React Context / Local State)
Ephemeral state that governs the user interface layout but does not sync with a database is considered **Client UI State**.

### Key Rules:
- **Local State First**: If a state is only used in a single component (e.g. `isOpen` for a dropdown or accordion), keep it in a simple `useState` hook at the component level.
- **Context API for Global Cross-Cutting Concerns**: Use React Context only for values that truly span multiple decoupled layout features. Examples include:
  - Theme toggler (`ThemeContext`)
  - Shared viewport UI layout constraints (`UIContext` for sidebar/navigation state)
- **Do Not Bloat Context**: Do not use Context to store fetched database tables, user listings, or board entities. This leads to component re-rendering issues and invalidates the caching mechanisms of TanStack Query.
