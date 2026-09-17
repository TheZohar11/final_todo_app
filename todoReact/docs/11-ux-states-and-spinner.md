# UX States — Loading, Errors, and Spinners

Telling the user what the app is doing: a spinner while data loads, a message when something fails.

## Why UX states exist

Every HTTP call has three moments the UI must reflect: **waiting**, **success**, and **failure**. Success renders the data; the other two need their own state:

```jsx
const [loading, setLoading] = useState(true); // true - we fetch on mount
const [error, setError] = useState("");
```

## The loading state

Wrap the fetch so `loading` is true for exactly the duration of the request:

```jsx
async function getTasks() {
  setLoading(true);
  try {
    // ...fetch, parse, act...
  } catch (e) {
    setError("could not reach the server");
  } finally {
    setLoading(false);
  }
}
```

**`finally` is the trick** — it runs on success, on server error, and on network failure alike, so the spinner can never get stuck spinning. Setting `loading` to `false` in three separate places is the bug-prone alternative.

Initializing with `useState(true)` (not `false`) avoids a flash of empty list before the first fetch starts.

## The spinner — react-spinners

```bash
npm install react-spinners
```

The library ships dozens of spinner components (`ClipLoader`, `BeatLoader`, `RingLoader`...) that all work the same way — a component with `loading`, `size`, and `color` props:

```jsx
import { ClipLoader } from "react-spinners";

{
  loading && <ClipLoader loading={loading} size={150} color="#ffecec" />;
}
```

- The `{loading && ...}` guard unmounts it entirely when idle (the `loading` prop alone would also hide it — belt and suspenders).
- `size` is pixels; `color` any CSS color — match it to the app's palette.
- Swapping the style later is a one-line change: import a different loader, same props.

## The error state

Same pattern used everywhere in this app since Register:

```jsx
if (!response.ok) {
  setError(data.error); // the server's own message
  return;
}
```

```jsx
{
  error && <p>{error}</p>;
}
```

Two error sources, two messages:

- **Server said no** (400/500 with a JSON body) → show `data.error`, the specific reason.
- **Server unreachable** (fetch threw) → the catch block's generic "could not reach the server".

## Key rules

- **`finally` for cleanup** — the only place `setLoading(false)` can't be forgotten.
- **Start `loading` as `true`** when the page fetches on mount.
- **Conditional render with `&&`** for both spinner and error — absent things should not be in the DOM.
- **Show the server's message when you have one** — it knows _why_ it refused; the generic message is only for when there was no answer at all.
