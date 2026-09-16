# Making HTTP Calls

The universal pattern for calling a server from a click handler, as implemented in the Register and Login screens.

## The pattern

A good HTTP call has 4 stages: **validate → send → parse → act on the result**, all wrapped in try/catch.

Why these stages? Each one answers a different question:

1. **Validate** — is the data even worth sending? Checks that need no server (empty fields, passwords that don't match) happen first, so the user gets instant feedback and we don't waste a round trip.
2. **Send** — `fetch` takes the URL plus an options object: the `method` (POST for creating things), a `Content-Type: application/json` header telling the server how to read the body, and the `body` itself — which must be a **string**, so we convert our JS object with `JSON.stringify`.
3. **Parse** — the response body arrives as raw text; `response.json()` turns it back into a JS object. We parse it _before_ checking success, because the server sends useful JSON in **both** cases: `{ error: "..." }` on failure, `{ token: "..." }` on success.
4. **Act** — decide what happens next: show the server's error message, or store the token and move the user to the next screen.

The try/catch around everything covers the one case the stages can't: the server not being reachable at all (it's down, wrong URL, no network). Only then does `fetch` throw.

```jsx
async function handleOnClick(e) {
  try {
    // 1. Validate locally first - don't waste a request
    if (password !== verifyPassword) {
      setError("password must be equal to verify password");
      return;
    }

    // 2. Send the request
    const response = await fetch("http://localhost:5000/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    // 3. Parse the body ONCE, before checking ok
    const data = await response.json();

    // 4. Act on the result
    if (!response.ok) {
      setError(data.error); // server's message (invalid email, short password...)
      return;
    }
    localStorage.setItem("authToken", data.token);
    navigate("/Home");
  } catch (e) {
    // fetch only throws when the server is unreachable (network error)
    setError("could not reach the server");
  }
}
```

## Why `async/await`?

An HTTP call takes time — the browser can't freeze while waiting. `fetch` therefore returns a _promise_ (a "result that will arrive later"). Marking the handler `async` lets us write `await`, which pauses **only this function** (not the page) until the result arrives, and then continues with the real value. Both `fetch(...)` and `response.json()` are asynchronous, so both need `await`.

## How errors reach the user

A click handler's return value goes nowhere — React ignores it. The only way to show something on screen is through **state**: we keep an `error` string in `useState`, call `setError("...")` when something goes wrong, and render it conditionally in the JSX with `{error && <p>{error}</p>}`. When `setError` runs, React re-renders and the message appears.

Bonus: clear stale errors with `setError("")` at the start of the handler, so an old message doesn't linger over a new attempt.

## What the server actually sends back

Every response has two parts we care about:

- **The status code** (`response.status`, or the shortcut `response.ok` which is true for 200–299). This tells us _whether_ it worked.
- **The body** (`data` after parsing). This tells us _the details_ — the keys match exactly whatever the server put in `res.json({...})`. Our server sends `{ error }` on failure and `{ message, userId, token }` on success, so we read `data.error` and `data.token`.

## Key rules

- **`async/await`**: the handler is `async`, every `fetch` and `.json()` needs `await`. `response.json()` is a function call — forgetting the `()` gives you the function itself, not the data.
- **`fetch` does not throw on 400/500** — only on network failure. A "wrong password" response is still a _successful_ HTTP exchange from fetch's point of view, so always check `response.ok` yourself.
- **The data is in the parsed body**, not on the response object: `data.token`, `data.error` (matches whatever keys the server sends in `res.json({...})`). There is no `response.data` — that's axios, not fetch.
- **Early `return` after every error** — otherwise the code keeps running and acts like the call succeeded (navigating away, saving an undefined token, putting an error object into a list...).
- **Show errors through state** (`const [error, setError] = useState("")` + `{error && <p>{error}</p>}` in the JSX). Returning a value from a click handler goes nowhere.
