# Configuration — One API URL for Dev and Production

Getting hardcoded URLs out of components, so the same code runs against localhost in development and the real server in production.

## The problem

Six different fetches said `"http://localhost:5000/..."`. That works on your machine and breaks everywhere else — and changing environments would mean editing every component.

## The solution: `src/config.js`

One tiny module owns the base URL:

```js
// Set VITE_API_URL in the deployment environment (e.g. Render) to override
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
```

Every component imports it and builds URLs with template literals:

```jsx
import { API_URL } from "../../config";

const response = await fetch(`${API_URL}/tasks/${taskId}`, { ... });
```

## How the environment variable works

- **`import.meta.env`** is Vite's way of exposing environment variables to client code. Only variables prefixed with **`VITE_`** are exposed — everything else is hidden from the browser bundle on purpose.
- **Locally** the variable isn't set, so the `||` fallback gives `http://localhost:5000`. Nothing to configure.
- **In production** (deploying the client on Render, Netlify, Vercel...), set `VITE_API_URL=https://your-server.onrender.com` in the service's environment settings. Vite reads it **at build time** and bakes the value into the bundle.

You can also put it in an env file instead of the dashboard — Vite loads `.env.production` automatically during `npm run build`:

```
VITE_API_URL=https://your-server.onrender.com
```

## Key rules

- **One source of truth** — components never spell out a host; they always compose `` `${API_URL}/route` ``.
- **Build-time, not runtime** — changing the variable requires a rebuild/redeploy; the browser never reads env vars live.
- **`VITE_` prefix is mandatory** — `API_URL=...` without the prefix is silently invisible to `import.meta.env`.
- **No secrets here** — anything in the client bundle is public. A server URL is fine; API keys are not.
