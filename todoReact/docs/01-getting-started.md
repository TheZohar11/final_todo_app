# Getting Started — Creating and Running the Project

## Creating the React app

The client was scaffolded with **Vite** (the modern replacement for create-react-app — same idea, much faster):

```bash
npm create vite@latest todoReact -- --template react
cd todoReact
npm install
```

This generates the project skeleton: `index.html`, `src/main.jsx` (the entry point), `src/App.jsx`, and a `package.json` with the dev scripts.

Extra libraries this project uses:

```bash
npm install react-router-dom   # client-side routing
npm install react-icons        # icon components
```

## Running the project

The app needs **two processes** running side by side — the API server and the React dev server — each in its own terminal.

**Terminal 1 — the server** (Express + MongoDB, port 5000):

```bash
cd final_todo_app/server
npm install        # first time only
npm run dev        # nodemon - restarts automatically on file changes
```

**Terminal 2 — the React app** (Vite dev server):

```bash
cd final_todo_app/todoReact
npm install        # first time only
npm run dev
```

Vite prints a local URL (usually `http://localhost:5173`) — open it in the browser.

## The scripts (from `package.json`)

| Command           | What it does                                        |
| ----------------- | --------------------------------------------------- |
| `npm run dev`     | Start the dev server with hot reload — daily driver |
| `npm run build`   | Production build into `dist/`                       |
| `npm run preview` | Serve the production build locally to check it      |
| `npm run lint`    | Run the linter (oxlint)                             |

## Key rules

- **Both processes must be up.** If the React app shows "could not reach the server", the first thing to check is whether the server terminal is running on port 5000.
- **Hot reload means no restarts** — saving a file updates the browser instantly. Restart only when changing config files (`vite.config.js`, `.env`).
- **`npm install` runs once per machine/clone**, and again only when `package.json` dependencies change.
