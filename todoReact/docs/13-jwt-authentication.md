# JWT Authentication and Refresh Tokens

This app now uses a JWT-based auth flow for the browser app. The frontend keeps a short-lived access token and a longer-lived refresh token in `localStorage`, and the backend verifies the access token on protected routes.

## The flow

1. User logs in or registers.
2. The server creates:
   - an access token for protected requests
   - a refresh token for renewing expired access tokens
3. The browser saves both in localStorage.
4. Every protected request sends `Authorization: Bearer <accessToken>`.
5. If the access token is expired, the frontend sends the refresh token to `/users/refresh`.
6. If refresh succeeds, a new access token is saved and the user keeps working.
7. If refresh fails, both tokens are cleared and the user is sent back to login.

## Frontend token storage

The app stores the tokens under these keys:

```js
localStorage.setItem("accessToken", data.accessToken);
localStorage.setItem("refreshToken", data.refreshToken);
```

The logout button clears both:

```js
localStorage.removeItem("accessToken");
localStorage.removeItem("refreshToken");
```

## Frontend helper for protected requests

The app uses a small helper that adds the bearer token automatically and refreshes it when a `401` appears.

```js
async function authFetch(url, options = {}) {
  const accessToken = localStorage.getItem("accessToken");
  if (!accessToken) {
    navigate("/Login");
    return null;
  }

  let response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (response.status === 401) {
    const refreshed = await refreshAccessToken();
    if (!refreshed) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      navigate("/Login");
      return null;
    }

    response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
  }

  return response;
}
```

This keeps the code clean and prevents protected pages from failing repeatedly when the access token expires.

## Refresh helper

The refresh helper is split into its own file so the page logic stays simple.

```js
export default async function refreshAccessToken() {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) return false;

  const response = await fetch(`${API_URL}/users/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) return false;

  const data = await response.json();
  localStorage.setItem("accessToken", data.accessToken);
  return true;
}
```

## Backend JWT creation

The backend issues both tokens during login/register:

```js
function createTokens(user) {
  const accessToken = jwt.sign(
    { userId: user.ID, email: user.email },
    JWT_SECRET,
    {
      expiresIn: "15m",
    },
  );

  const refreshToken = jwt.sign({ userId: user.ID }, JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });

  return { accessToken, refreshToken };
}
```

This means:

- access token: short-lived, used for most requests
- refresh token: longer-lived, used only to mint a new access token

## Backend refresh endpoint

The server exposes a refresh route for browser clients:

```js
app.post("/users/refresh", async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ error: "Refresh token required" });
  }

  try {
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    const user = await usersCollection.findOne({ ID: decoded.userId });
    if (!user) {
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    const { accessToken } = createTokens(user);
    return res.status(200).json({ accessToken });
  } catch (e) {
    return res.status(401).json({ error: "Invalid refresh token" });
  }
});
```

## Backend auth lookup

Protected routes verify the token from the Authorization header and decode the user from the JWT payload.

```js
async function getAuthUser(req) {
  const token = getTokenFromHeader(req);
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return await usersCollection.findOne({ ID: decoded.userId });
  } catch (e) {
    return null;
  }
}
```

This replaces the old pattern of storing a plain token string directly on the user and looking it up by value.

## Important rules

- Keep `JWT_SECRET` and `JWT_REFRESH_SECRET` different.
- Access tokens should be short-lived.
- Refresh tokens are only used to issue new access tokens.
- If refresh fails, clear tokens and force login.
- Never put the real secrets in the repository or in the app bundle.

## Why JWT here

The app still keeps a simple pattern that fits the project size: the browser stores tokens in localStorage, the server verifies them quickly, and the frontend refreshes them when needed.

This is a great middle ground for a learning project: simple enough to understand, but production-ready in spirit because the token flow is explicit and the access token has a short lifetime.
