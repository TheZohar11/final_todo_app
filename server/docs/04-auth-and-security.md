# Authentication and Security

How the server knows who's calling: tokens, password hashing, validation, and the Logic helpers.

## The token scheme

This server uses **opaque bearer tokens**: a random uuid stored on the user document. Possessing the token _is_ the proof of identity.

The full cycle:

1. **Register/Login** generate (or reuse) a token — `uuidv4()` — save it on the user, and return it to the client.
2. The client sends it on every protected call: `Authorization: Bearer <token>`.
3. Each protected route looks the token up: `usersCollection.findOne({ token })` — the found document tells the server _who_ is calling.

(The industry alternative is JWT — signed tokens that don't need a DB lookup. Opaque tokens are simpler and revocable by just clearing the field; a fine choice here.)

## Authentication vs authorization

Two different questions, two different status codes:

- **Authentication — who are you?** No token or unknown token → **`401`**.
- **Authorization — are you allowed to touch _this_?** Valid user, but the task's `userId` isn't theirs → **`403`**:

```js
if (task.userId !== user.ID) {
  return res.status(403).json({ error: "Not authorized to update this task" });
}
```

Every task route does both checks: token → user, then user → ownership.

## The Logic files

### `Logic/getTokenFromHeader.js`

Extracts the token from the standard header format:

```js
function getTokenFromHeader(req) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7); // strip "Bearer "
  }
  return null;
}
```

`null` means "no usable token" — routes translate that into `401`.

### `Logic/tokenVerify.js` — a middleware draft

The token→user lookup is repeated in four routes. This file sketches the Express-middleware version — resolve the user once, attach it to `req.user`, and let routes just use it:

```js
async function tokenVerify(req, res, next) {
  const token = getTokenFromHeader(req);
  if (!token)
    return res.status(401).json({ error: "Authorization token required" });
  const user = await usersCollection.findOne({ token });
  if (!user) return res.status(401).json({ error: "Invalid token" });
  req.user = user;
  next();
}
// usage when wired up: app.get("/tasks", tokenVerify, handler)
```

It isn't wired in yet (it would need access to `usersCollection` and a CommonJS export) — a good future refactor to remove the duplication.

## Passwords — bcryptjs

Passwords are **hashed, never stored**:

```js
const hashedPassword = await bcrypt.hash(password, 8); // 8 = salt rounds
// ...later, at login:
const ok = await bcrypt.compare(password, user.password);
```

- Hashing is one-way: even with full DB access nobody can read the original password.
- The salt (generated per password) means two users with the same password get different hashes.
- `compare` re-hashes the attempt and checks — the plain password never touches the database.
- Login failures return the **same message** for wrong email and wrong password — don't help attackers enumerate accounts.

## Input validation — validator

Validate at the boundary, before touching the DB:

```js
if (!email || !password)
  return res.status(400).json({ error: "Email and password are required" });
if (!validator.isEmail(email))
  return res.status(400).json({ error: "Invalid email format" });
if (password.length < 6)
  return res
    .status(400)
    .json({ error: "Password must be at least 6 characters" });
```

The client validates too — but client checks are for UX; **server checks are the real gate** (anyone can call the API directly).

## uuid

`uuidv4()` generates cryptographically random, practically-unique 128-bit ids — used for tokens and the user `uuid` field. As covered in the database doc: the sequential `usersCounter` was a simplification for this project; real user identifiers should be uuids or Mongo's `ObjectId`, which aren't guessable and can't collide under concurrency.
