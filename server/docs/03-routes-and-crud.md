# Routes — The API and Its CRUD Operations

Every endpoint the server exposes, and what happens inside each one.

## Overview

| Method | Route          | Auth   | Body                  | Success                                             |
| ------ | -------------- | ------ | --------------------- | --------------------------------------------------- |
| POST   | `/users`       | —      | `{ email, password }` | `201` `{ message, userId, token }`                  |
| POST   | `/users/login` | —      | `{ email, password }` | `200` `{ message, userId, token }`                  |
| DELETE | `/users/:id`   | —      | —                     | `200` `{ message }`                                 |
| GET    | `/tasks`       | Bearer | —                     | `200` `[ { _id, description, completed, userId } ]` |
| POST   | `/tasks`       | Bearer | `{ description }`     | `201` `{ message, taskId }`                         |
| PATCH  | `/tasks/:id`   | Bearer | — (server toggles)    | `200` `{ message, task }`                           |
| DELETE | `/tasks/:id`   | Bearer | —                     | `200` `{ message }`                                 |
| GET    | `/`            | —      | —                     | health check ("Server is running!")                 |

All failures respond `{ error: string }` with a 4xx/5xx status. Two former dev-only routes (`GET /users`, `PATCH /users/:id`) were removed — one leaked password hashes, the other used Mongoose syntax that crashes the native driver.

## The shape every route shares

1. **Extract input** — `req.body` (JSON body), `req.params` (URL parts like `:id`), headers.
2. **Validate / authenticate** — reject early with the right status.
3. **Query MongoDB** inside `try/catch`.
4. **Respond** — `res.status(...).json({...})`.

## Users

### POST `/users` — register (Create)

- Validates: both fields present (`400`), `validator.isEmail` (`400`), password ≥ 6 chars (`400`).
- Hashes the password: `bcrypt.hash(password, 8)`.
- Builds the user: hashed password, sequential `ID` from `usersCounter`, a `uuid`, and a fresh `token` (uuid v4).
- `insertOne(userObj)` → `201` with `result.insertedId` and the token, so the client is logged in immediately after registering.

### POST `/users/login` — authenticate

- Same email/password presence + format validation.
- `findOne({ email })`, then `bcrypt.compare(plaintext, user.password)`.
- Wrong email **or** wrong password → the same `401 "invalid email or password"` — deliberately not saying which was wrong.
- On success, returns the user's existing token (generating one only if missing).

### DELETE `/users/:id` — remove a user (Delete)

- `deleteOne({ _id: new ObjectId(req.params.id) })`; `404` if nothing was deleted.
- Note: currently unauthenticated and unused by the client — a leftover to protect before real deployment.

## Tasks — the full CRUD

All four require a valid Bearer token; the resolved user scopes every operation (see the auth doc).

### GET `/tasks` — Read

```js
const tasks = await tasksCollection.find({ userId: user.ID }).toArray();
res.send(tasks);
```

Only the requesting user's tasks — the filter _is_ the security.

### POST `/tasks` — Create

- Requires `description` (`400` if missing).
- `insertOne({ description, completed: false, userId: user.ID })` → `201` with `taskId` (the new `_id`), which the client uses to build the task object in state.

### PATCH `/tasks/:id` — Update (toggle)

- Finds the task by `ObjectId(req.params.id)` → `404` if missing.
- **Ownership check**: `task.userId !== user.ID` → `403` (authenticated, but not yours).
- Flips `task.completed = !task.completed`, saves with `replaceOne`, returns the updated `task` so the client can put it straight into state.

### DELETE `/tasks/:id` — Delete

- Same ownership check → `403`.
- `deleteOne({ _id: new ObjectId(req.params.id) })` → `404` if nothing deleted, otherwise `{ message: "Task deleted" }`.

## Status codes used, and when

| Code | Meaning here                                         |
| ---- | ---------------------------------------------------- |
| 200  | Read/update/delete succeeded                         |
| 201  | Something was created (user, task)                   |
| 400  | Bad input (missing/invalid fields, bad id)           |
| 401  | No token, invalid token, or bad credentials          |
| 403  | Valid user, but the resource belongs to someone else |
| 404  | Resource doesn't exist                               |
| 500  | Unexpected server/database failure                   |
