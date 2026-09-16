# Auth and localStorage

How the app keeps a user logged in: the token, where it lives, and how every protected request uses it.

## What localStorage is and why we need it

React state lives in memory — refresh the page and it's gone. `localStorage` is the browser's small key/value store that **survives refreshes, tab closes, and restarts**. That's what keeps a user "logged in": we save the token once, and every future page load can find it.

It's a tiny API — three methods, all taking/returning **strings**:

```js
localStorage.setItem("key", "value"); // save (overwrites if exists)
localStorage.getItem("key"); // read - returns the string, or null if missing
localStorage.removeItem("key"); // delete
```

## The token lifecycle in this app

One convention, used everywhere: the token is stored under the key **`authToken`**, and protected endpoints expect the header `Authorization: Bearer <token>`.

**1. Save — after a successful register or login** (`Register.jsx`, `Login.jsx`):

```js
localStorage.setItem("authToken", data.token);
navigate("/Home");
```

**2. Read — on every protected request** (`Home.jsx`), inline inside the header:

```js
headers: {
  Authorization: `Bearer ${localStorage.getItem("authToken")}`,
},
```

We read it fresh on each call instead of copying it into state — localStorage is already the single source of truth, and duplicating it in state just creates two copies that can disagree.

**3. Remove — on logout** (and when the server answers `401`, meaning the token is stale):

```js
localStorage.removeItem("authToken");
navigate("/Login");
```

## Route protection

A page that requires login checks for the token and redirects when it's missing:

```js
if (!localStorage.getItem("authToken")) navigate("/Login");
```

And any server call that answers `401` should clear the token and redirect too — a stored token can expire or be invalidated server-side.

## Key rules

- **Strings only.** The token is already a string so it just works — but to store an object you'd need `JSON.stringify` on the way in and `JSON.parse` on the way out.
- **`getItem` returns `null` when the key is missing** — that's the check for "is anyone logged in?".
- **It's not secure storage.** Anyone with access to the browser (or any script on the page) can read it. Fine for a learning project's token; never store passwords in it.
- **Changing it does not re-render React.** localStorage is invisible to React — after removing the token you must navigate/update state yourself.
- **One key, one convention.** Always the same key name (`authToken`) — a typo like `"authtoken"` silently returns `null` and every request starts failing with 401.
