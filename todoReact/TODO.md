# TODO — Remaining Work for Basic Functionality

This document describes the remaining tasks required to complete the basic todo app (React web client + Express/MongoDB server). The Register flow is fully implemented and should be used as the reference pattern for all HTTP calls (see "Making HTTP Calls" in [README.md](./README.md)).

## Current State

| Area                       | Status                                                    |
| -------------------------- | --------------------------------------------------------- |
| Server (Express + MongoDB) | All endpoints implemented and running                     |
| Register page              | Done — POST `/users`, token stored, navigation on success |
| Login page                 | UI only — no HTTP call                                    |
| Home page                  | Local state only — not connected to the server            |
| Route protection / logout  | Not implemented                                           |

**Token convention:** the token is stored in `localStorage` under the key `authToken`. Protected endpoints expect the header `Authorization: Bearer <token>`.

## API Reference

Base URL: `http://localhost:5000`

| Method | Route          | Auth   | Body                    | Success response                                  |
| ------ | -------------- | ------ | ----------------------- | ------------------------------------------------- |
| POST   | `/users`       | —      | `{ email, password }`   | `201` `{ message, userId, token }`                |
| POST   | `/users/login` | —      | `{ email, password }`   | `200` `{ message, userId, token }`                |
| GET    | `/tasks`       | Bearer | —                       | `200` `[{ _id, description, completed, userId }]` |
| POST   | `/tasks`       | Bearer | `{ description }`       | `201` `{ message, taskId }`                       |
| PATCH  | `/tasks/:id`   | Bearer | — (toggles `completed`) | `200` `{ message, task }`                         |
| DELETE | `/tasks/:id`   | Bearer | —                       | `200` `{ message }`                               |

All error responses have the shape `{ error: string }` with an appropriate 4xx/5xx status.

## Tasks

### 1. Login page — connect to server

**File:** `src/pages/Login/Login.jsx`

- Mirror the Register implementation: on button click, POST to `/users/login` with `{ email, password }`.
- Parse the response with `await response.json()`; on `!response.ok` show `data.error` via an `error` state.
- On success: `localStorage.setItem("authToken", data.token)` and `navigate("/Home")`.
- Add a `<Link to="/Register">` for users without an account.

### 2. Home page — load tasks from server

**File:** `src/pages/Home/Home.jsx`

- On mount (`useEffect` with `[]` deps), GET `/tasks` with the auth header:
  ```js
  headers: {
    Authorization: `Bearer ${localStorage.getItem("authToken")}`;
  }
  ```
- Replace the string-array state with the server's task objects: `{ _id, description, completed }`.
- Update rendering accordingly: `key={task._id}`, display `task.description`.

### 3. Add task — persist to server

**File:** `src/pages/Home/Home.jsx`

- On add click, POST `/tasks` with body `{ description: task }` and the auth header.
- On success, either re-fetch the list or append the created task to state (the response contains `taskId`).
- Keep the existing guard against empty input.

### 4. Delete task — persist to server

**Files:** `src/pages/Home/Home.jsx`, `src/components/TaskItem/TaskItem.jsx`

- Change `handleDelete` to call DELETE `/tasks/:id` (auth header required), passing the task's `_id` instead of the array index.
- On success, remove the task from state with `filter`.

### 5. Toggle completed — persist to server

**Files:** `src/pages/Home/Home.jsx`, `src/components/TaskItem/TaskItem.jsx`

- Wire the `MdDone` icon to PATCH `/tasks/:id` (no body needed — the server toggles `completed`).
- On success, update the task in state with the returned `task` object.
- Style completed tasks (e.g. `text-decoration: line-through` when `task.completed` is true).

### 6. Route protection

**File:** `src/pages/Home/Home.jsx` (or a small wrapper component)

- If `localStorage.getItem("authToken")` is missing, redirect to `/Login` (`useEffect` + `navigate`).
- Additionally, if any server call returns `401`, clear the token and redirect to `/Login` (token may be stale).

### 7. Logout

**File:** `src/pages/Home/Home.jsx`

- Add a logout button: `localStorage.removeItem("authToken")`, then `navigate("/Login")`.

### 8. Configuration cleanup

**New file:** `src/config.js`

- Export the base URL once (`export const API_URL = "http://localhost:5000";`) and use it in every fetch instead of hardcoded strings.

### 9. UX states (recommended)

**File:** `src/pages/Home/Home.jsx`

- `loading` state while fetching tasks ("loading…" message).
- `error` state for failed requests (same pattern as Register).

### 10. Server cleanup

**File:** `server/index.js`

- `PATCH /users/:id` uses Mongoose syntax (`findById`, `.save()`) that will crash with the native MongoDB driver — remove the route or rewrite it with `updateOne`. It also lacks auth and never sends a success response.
- `GET /users` returns all users including password hashes and tokens — remove it or restrict it before any deployment (development-only as-is).

## Suggested Order

1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10

Tasks 1–2 unblock everything else; 3–5 complete the core loop; 6–10 wrap up.

## Definition of Done

- A new user can register, log out, and log back in.
- Tasks persist across page refreshes and belong to the logged-in user only.
- Add, delete, and toggle-complete all work against the server.
- Visiting `/Home` without a token redirects to `/Login`.
- No hardcoded server URLs in components.
