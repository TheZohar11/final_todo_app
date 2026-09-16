# todoReact — Documentation

A React todo app (Vite) working against the Express/MongoDB server. The docs are split by subject under [docs/](./docs/) — each file is self-contained and ordered the way you'd build the feature.

## Contents

1. [Getting Started](./docs/01-getting-started.md) — creating the project with Vite, running server + client, npm scripts
2. [React Routing](./docs/02-react-routing.md) — pages, `Link`, `useNavigate`
3. [Components, Props and State](./docs/03-components-and-state.md) — reusable components, controlled inputs, `useState`, layout/styling
4. [Making HTTP Calls](./docs/04-http-calls.md) — the validate → send → parse → act pattern, async/await, error handling
5. [Working with Server Data](./docs/05-server-data.md) — fetching on mount with `useEffect`, rendering lists of objects, POSTing new items
6. [Auth and localStorage](./docs/06-auth-and-localstorage.md) — the token lifecycle, protected requests, route protection
7. [Updating and Deleting Data](./docs/07-update-and-delete.md) — PATCH/DELETE with ids in the URL, map/filter state updates, sorting
8. [Icons and Conditional Rendering](./docs/08-icons-and-conditional-rendering.md) — react-icons, toggling icons with a ternary

For what's left to build, see [TODO.md](./TODO.md).
