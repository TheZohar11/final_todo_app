# Working with Server Data

Loading a list from the server when a page opens, creating new items, and keeping React state in sync — as implemented in the Home screen.

## Fetching data on mount (useEffect + GET)

### The problem it solves

The Home page needs the user's tasks from the server as soon as the page opens — no button click involved. But you can't just call `fetch` in the component body: the body runs on **every render**, and fetching triggers a state update which triggers a render... an infinite loop. `useEffect` is React's tool for "run this side effect at a controlled time."

### How useEffect works

```jsx
useEffect(() => {
  // the effect - runs AFTER the render
}, []); // the dependency array - controls WHEN it re-runs
```

- The **empty array `[]`** means "run once, when the component mounts" — exactly what loading initial data needs.
- Without the array it would run after **every** render (the infinite loop above).
- The effect callback itself **cannot be `async`**, so we define an `async` function inside it and call it immediately.

### The pattern (from `Home.jsx`)

```jsx
const [listi, setList] = useState([]); // starts empty, filled by the server

useEffect(() => {
  async function getTasks() {
    try {
      const response = await fetch("http://localhost:5000/tasks", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error);
        return;
      }
      setList(data);
    } catch (e) {
      setError("could not reach the server");
    }
  }
  getTasks();
}, []);
```

Same 4-stage HTTP pattern as always (send → parse → check → act), with two differences:

- **GET has no body** and no `Content-Type` header — we're only reading.
- **The route is protected**, so we prove who we are with the `Authorization: Bearer <token>` header, using the token saved at login. The server uses it to return only **this user's** tasks.

## How the data is stored

The server responds with an **array of objects**, and we put it straight into state:

```js
[
  {
    _id: "665f1c...",
    description: "buy milk",
    completed: false,
    userId: "...",
  },
  {
    _id: "665f1d...",
    description: "learn react",
    completed: true,
    userId: "...",
  },
];
```

So the state went from an array of **strings** to an array of **objects**. `useState([])` doesn't change — what changes is how we read each item:

```jsx
<ul className="list">
  {listi.map((task) => (
    <TaskItem
      key={task._id}
      task={task.description}
      onDelete={() => handleDelete(task._id)}
    />
  ))}
</ul>
```

- **`key={task._id}`** — the database id is a stable, unique key. Array indexes shift when items are deleted; ids never do.
- **`task.description`** — render the field, not the object. Rendering a whole object throws "Objects are not valid as a React child".
- **`task._id` is also what the server needs** for delete/update calls (`/tasks/:id`), so handlers receive the id, not an index.

## Creating data (POST a new item)

### The pattern (from `Home.jsx`)

```jsx
async function handleOnClick() {
  try {
    // 1. Validate - don't send empty tasks
    if (!task.trim()) return;

    // 2. Send - protected route, so BOTH headers are needed
    const response = await fetch("http://localhost:5000/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
      body: JSON.stringify({ description: task }),
    });

    // 3. Parse
    const data = await response.json();

    // 4. Act
    if (!response.ok) {
      setError(data.error);
      return;
    }
    setList([
      ...listi,
      { _id: data.taskId, description: task, completed: false },
    ]);
    setTask("");
  } catch (e) {
    setError("could not reach the server");
  }
}
```

### Working with the response data

The server does **not** return the full task — only `{ message, taskId }`. But we already know everything else (we just typed the description, and new tasks start uncompleted), so we **build the task object ourselves** and append it:

```js
setList([...listi, { _id: data.taskId, description: task, completed: false }]);
```

- **`...listi` (spread)** copies the existing tasks into a **new** array — never mutate state (`listi.push(...)` is the classic mistake: React won't re-render). `[listi, newTask]` (without dots) is another trap — it nests the whole old array as the first item.
- **`_id: data.taskId`** — we take the real database id from the response, so delete/update work on this task immediately without a refresh.
- The alternative is to **re-fetch the whole list** after a successful POST — simpler to reason about, one extra round trip. Appending locally is the snappier UX.

## Key rules for protected routes

- **Every `/tasks` call needs the `Authorization` header** — GET, POST, PATCH, DELETE alike. Forgetting it gets a `401` even though you're logged in.
- **POST needs `Content-Type: application/json` too** (there's a body); GET/DELETE don't (no body).
- **Update state from the server's truth**: use ids from the response, keep state as a new array (spread / `filter` / `map`), and clear the input only after success.
