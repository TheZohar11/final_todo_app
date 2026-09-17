# Route Protection and Logout

Keeping `/Home` private: redirecting users without a valid token, and logging out.

## The idea

The server already refuses requests without a valid token — but the _page_ would still render, empty and broken. Route protection makes the client match the server: no token → you don't even see the page.

There are two cases to cover:

1. **No token at all** (never logged in, or logged out) — known _before_ asking the server.
2. **A stale token** (exists in localStorage but the server rejects it with `401`) — known only _after_ asking.

## 1. No token → redirect before fetching (from `Home.jsx`)

First thing inside the effect, before any network call:

```jsx
const navigate = useNavigate();

useEffect(() => {
  async function getTasks() {
    if (!localStorage.getItem("authToken")) {
      navigate("/Login");
      return; // don't fetch - we're leaving
    }
    // ... fetch tasks as usual
  }
  getTasks();
}, []);
```

The `return` matters: `navigate` doesn't stop the function — without it, the fetch still runs.

## 2. Stale token → 401 handling

After parsing the response, check for `401` **before** the generic error check, clean up, and leave:

```jsx
if (response.status === 401) {
  localStorage.removeItem("authToken");
  navigate("/Login");
  return;
}
if (!response.ok) {
  setError(data.error);
  return;
}
```

Removing the token is what makes case 2 turn back into case 1 — next visit redirects instantly instead of hitting the server with a dead token again.

## Logout

Logout is just the same cleanup, triggered by the user:

```jsx
<Button
  text="logout"
  onClick={() => {
    localStorage.removeItem("authToken");
    navigate("/Landing");
  }}
/>
```

Two steps, both required:

- **`removeItem`** — without it, the "protected" page lets you right back in.
- **`navigate`** — localStorage changes don't re-render React; you must move the user yourself. This app sends them to `/Landing` (the welcome screen with Login/Register links) rather than straight to `/Login` — a design choice.

## How to test it

- Visit `/Home` logged out → should land on `/Login`.
- Log in, then in DevTools → Application → Local Storage, delete `authToken`, refresh `/Home` → redirected.
- Log out → back on `/Landing`; pressing the browser Back button to `/Home` should bounce to `/Login`.

## Key rules

- **Check the token before fetching** — no point paying for a round trip you know will fail.
- **`return` after every `navigate`** — navigation doesn't abort the running function.
- **`401` means "clean up and redirect"**, not "show an error" — a stale token isn't the user's problem to read about.
- **Logout = remove + navigate** — forgetting either half leaves the app half-logged-in.
