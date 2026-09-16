# React Routing

Client-side navigation with `react-router-dom` — multiple "pages" in a single-page app.

## Setup

Install the library:

```bash
npm install react-router-dom
```

In `main.jsx`, wrap the App component with a browser router:

```jsx
import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
```

In `App.jsx`, define the routes with a path and an element for each page:

```jsx
import { Routes, Route } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Login" element={<Login />} />
      </Routes>
    </>
  );
}

export default App;
```

## Navigating

There are two ways to move between screens — pick by **who triggers the move**:

**The user clicks a link** → use the `Link` component (renders as an `<a>` tag):

```jsx
<Link to="/Login">Login</Link>
```

**Your code decides to move** (after a successful login, a redirect...) → use the `useNavigate` hook:

```jsx
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  function handleOnClick(e) {
    // ... do work first (e.g. a successful HTTP call)
    navigate("/Home");
  }

  return <Button onClick={handleOnClick} text="Log In" />;
}
```

## Key rules

- `useNavigate()` is a hook — call it at the **top of the component**, not inside the handler.
- `Link` is for JSX, `navigate()` is for logic. Don't wrap a button in a `Link` when the click also runs code — navigate from the handler after the work succeeds.
- Route paths are matched against the URL — keep the same casing in `path="..."`, `to="..."`, and `navigate("...")`.
