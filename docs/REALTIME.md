# Nexora.ai Real-Time Socket Architecture

To achieve a modern collaborative experience similar to Linear, ClickUp, or Jira, Nexora.ai implements a robust **Socket.io** orchestration protocol.

```
 Client (Browser)                                         Server (Express)
        │                                                         │
        │ ── [Socket.io Handshake with JWT token] ──────────────> │
        │                                                         │ (verify connection middleware)
        │ <── [Connection Acknowledged] ───────────────────────── │
        ├─────────────────────────────────────────────────────────┤
        │                                                         │
        │ ── [Join Board Room] (e.g. project:id) ───────────────> │
        │                                                         │ (subscribe client to redis/memory room)
        ├─────────────────────────────────────────────────────────┤
        │                                                         │
        │ ── [Task Moved Event] (payload: lane change) ──────────> │
        │                                                         │ (processes service mutation)
        │ <── [Broadcast to Room] (task:updated, ignore sender) ─── │
```

---

## 1. Handshake & Security
Socket.io connections must be authenticated. The server configures middleware that parses incoming connections, retrieves authorization tokens, and validates them against the JWT secret.
- Reject connection if authorization fails.
- Bind the decoded authenticated payload (e.g., `user.id`, `user.orgId`) to the `socket.user` instance for easy identification in custom event handlers.

---

## 2. Namespace & Room Structure
To prevent namespace pollution and excess bandwidth usage, interactions are grouped using Socket.io rooms:

- **Project Room (`project:<projectId>`)**: Joined by members currently viewing a project board. Broadcasts board configuration changes, lane creation, and collaborative project edits.
- **Task Room (`task:<taskId>`)**: Joined by members viewing task detail modals. Broadcasts typing events, comments additions, and description edits.
- **User Room (`user:<userId>`)**: A private room specific to each user. Used to deliver localized, high-importance events like mentions, project assignments, and personal system notifications.

---

## 3. Real-Time Event Registry
Standard event naming conventions are defined as:

| Event Name | Direction | Payload | Description |
| :--- | :--- | :--- | :--- |
| `board:join` | Client -> Server | `{ projectId: string }` | Join room for board updates |
| `board:leave` | Client -> Server | `{ projectId: string }` | Leave room for board updates |
| `task:activity:typing` | Client -> Server | `{ taskId: string, typing: boolean }` | User is typing in description or comments |
| `task:activity:update` | Server -> Client | `{ taskId: string, field: string, value: any }` | Notify users that a task attribute changed |
| `notification:receive` | Server -> Client | `{ notificationId: string, message: string }` | Send a private notification event |
