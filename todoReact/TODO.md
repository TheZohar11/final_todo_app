# TODO — Remaining Work for Basic Functionality

This document describes the remaining tasks required to complete the basic todo app (React web client + Express/MongoDB server). The Register flow is fully implemented and should be used as the reference pattern for all HTTP calls (see "Making HTTP Calls" in [README.md](./README.md)).

## Current State

| Area                       | Status                                                     |
| -------------------------- | ---------------------------------------------------------- |
| Server (Express + MongoDB) | All endpoints implemented; dev-only routes removed         |
| Register page              | Done — POST `/users`, token stored, navigation on success  |
| Login page                 | Done — POST `/users/login`, token stored, link to Register |
| Home page                  | Done — full CRUD, route protection, logout, loading/error  |
| Route protection / logout  | Done                                                       |

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

### 1. Login page — connect to server ✅ DONE

**File:** `src/pages/Login/Login.jsx`

- ~~Mirror the Register implementation: on button click, POST to `/users/login` with `{ email, password }`.~~ Done.
- ~~Parse the response with `await response.json()`; on `!response.ok` show `data.error` via an `error` state.~~ Done (also clears stale errors before each attempt).
- ~~On success: `localStorage.setItem("authToken", data.token)` and `navigate("/Home")`.~~ Done.
- ~~Add a `<Link to="/Register">` for users without an account.~~ Done (styled with `.register-link`).

### 2. Home page — load tasks from server ✅ DONE

**File:** `src/pages/Home/Home.jsx`

- ~~On mount (`useEffect` with `[]` deps), GET `/tasks` with the auth header.~~ Done.
- ~~Replace the string-array state with the server's task objects: `{ _id, description, completed }`.~~ Done.
- ~~Update rendering accordingly: `key={task._id}`, display `task.description`.~~ Done.

See [Working with Server Data](./docs/05-server-data.md) for the full pattern.

### 3. Add task — persist to server ✅ DONE

**File:** `src/pages/Home/Home.jsx`

- ~~On add click, POST `/tasks` with body `{ description: task }` and the auth header.~~ Done.
- ~~On success, either re-fetch the list or append the created task to state (the response contains `taskId`).~~ Done (appends `{ _id: data.taskId, description: task, completed: false }`).
- ~~Keep the existing guard against empty input.~~ Done (`if (!task.trim()) return;`).

See [Working with Server Data](./docs/05-server-data.md) for the full pattern.

### 4. Delete task — persist to server ✅ DONE

**Files:** `src/pages/Home/Home.jsx`, `src/components/TaskItem/TaskItem.jsx`

- Change `handleDelete` to call DELETE `/tasks/:id` (auth header required), passing the task's `_id` instead of the array index.
- On success, remove the task from state with `filter`.

### 5. Toggle completed — persist to server ✅ DONE

**Files:** `src/pages/Home/Home.jsx`, `src/components/TaskItem/TaskItem.jsx`

- Wire the `MdDone` icon to PATCH `/tasks/:id` (no body needed — the server toggles `completed`).
- On success, update the task in state with the returned `task` object.
- Style completed tasks (e.g. `text-decoration: line-through` when `task.completed` is true).

### 6. Route protection ✅ DONE

**File:** `src/pages/Home/Home.jsx`

- ~~If `localStorage.getItem("authToken")` is missing, redirect to `/Login` (`useEffect` + `navigate`).~~ Done (checked before fetching).
- ~~Additionally, if any server call returns `401`, clear the token and redirect to `/Login` (token may be stale).~~ Done (in `getTasks`).

### 7. Logout ✅ DONE

**File:** `src/pages/Home/Home.jsx`

- ~~Add a logout button: `localStorage.removeItem("authToken")`, then navigate.~~ Done (navigates to `/Landing` by design).

### 8. Configuration cleanup ✅ DONE

**File:** `src/config.js`

- ~~Export the base URL once and use it in every fetch instead of hardcoded strings.~~ Done — `API_URL` reads `VITE_API_URL` (set on Render in production) and falls back to `http://localhost:5000` locally.

### 9. UX states ✅ DONE

**File:** `src/pages/Home/Home.jsx`

- ~~`loading` state while fetching tasks.~~ Done (`ClipLoader` from react-spinners, `finally` clears it).
- ~~`error` state for failed requests.~~ Done.

### 10. Server cleanup ✅ DONE

**File:** `server/index.js`

- ~~Remove the broken `PATCH /users/:id` route (Mongoose syntax).~~ Removed.
- ~~Remove `GET /users` (returned password hashes and tokens).~~ Removed.

## Suggested Order

All tasks 1–10 are done. 🎉 Optional next: a mobile/responsive UX pass (touch targets, input widths, ≥16px fonts).

## Definition of Done

- A new user can register, log out, and log back in.
- Tasks persist across page refreshes and belong to the logged-in user only.
- Add, delete, and toggle-complete all work against the server.
- Visiting `/Home` without a token redirects to `/Login`.
- No hardcoded server URLs in components.
