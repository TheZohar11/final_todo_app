# Updating and Deleting Data (PATCH + DELETE)

Completing the CRUD loop: removing a task and toggling its `completed` flag, as implemented in the Home screen.

## The URL carries the id

Unlike GET (all tasks) and POST (a new task), update and delete target **one specific task** — the id travels in the URL, built with a template literal:

```js
const response = await fetch(`http://localhost:5000/tasks/${taskId}`, { ... });
```

**Backticks, not quotes.** `"...${taskId}"` sends the literal text `${taskId}` to the server — a classic bug that fails with "task not found". Only backtick strings interpolate.

Because the id is in the URL, **neither call needs a body** — and with no body there's no `Content-Type` header either. The only header is the auth token.

## Delete (from `Home.jsx`)

```jsx
async function handleDelete(taskId) {
  try {
    const response = await fetch(`http://localhost:5000/tasks/${taskId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error);
      return;
    }
    setList(listi.filter((t) => t._id !== taskId));
  } catch (e) {
    setError("could not reach server");
  }
}
```

On success, remove the task from state with **`filter`** — it returns a new array without the matching item, so state is replaced, never mutated.

## Update / toggle (from `Home.jsx`)

The server toggles `completed` by itself on every PATCH — the client just points at the task:

```jsx
async function handleUpdate(taskId) {
  try {
    const response = await fetch(`http://localhost:5000/tasks/${taskId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error);
      return;
    }
    setList(listi.map((t) => (t._id === taskId ? data.task : t)));
  } catch (e) {
    setError("could not reach server");
  }
}
```

On success the server returns the **updated task object** in `data.task`. Replace it in state with **`map`**: every item maps to itself, except the matching id which maps to the fresh server copy.

## The state-update toolbox

Each operation pairs with one array method — all of them return a _new_ array:

| Operation | Method   | Pattern                                                |
| --------- | -------- | ------------------------------------------------------ |
| Add       | spread   | `[...listi, newTask]`                                  |
| Delete    | `filter` | `listi.filter((t) => t._id !== taskId)`                |
| Update    | `map`    | `listi.map((t) => (t._id === taskId ? data.task : t))` |

## Related: sorting completed tasks to the bottom

Done at **render time**, leaving state untouched:

```jsx
{[...listi]
  .sort((a, b) => a.completed - b.completed)
  .map((task) => ( ... ))}
```

- `[...listi]` copies first — `sort` mutates in place, and state must never be mutated.
- `a.completed - b.completed` works because booleans coerce to numbers (`false` = 0, `true` = 1), so incomplete tasks sort before completed ones.
- Because sorting happens on every render, toggling a task moves it down/up automatically — no extra logic.

## Key rules

- **Backticks for URL interpolation** — the #1 bug in this pattern.
- **No body, no `Content-Type`** — the id in the URL is all the server needs.
- **Auth header on every call** — DELETE and PATCH are protected like the rest of `/tasks`. It goes _inside_ the `headers` object; placed directly on the options object it's silently ignored and the server answers 401.
- **Prefer the server's copy**: after PATCH, put `data.task` into state rather than computing the new value yourself — the server is the source of truth.
