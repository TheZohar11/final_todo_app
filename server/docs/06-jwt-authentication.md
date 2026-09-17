# JWT Authentication for the Server

This server now issues and validates JSON Web Tokens for the browser client. The token flow is intentionally simple and fits the current app architecture.

## Why JWT is used

The old flow used a plain random token stored on the user document. That is easy to understand, but it has two drawbacks:

- the token is long-lived unless manually rotated
- the server keeps doing a direct value lookup on every protected request

JWT solves the first problem by giving us a short-lived access token and a longer-lived refresh token.

## The two secrets

The server expects two environment variables:

```env
JWT_SECRET=your_access_token_secret
JWT_REFRESH_SECRET=your_refresh_token_secret
```

These must be different values.

- `JWT_SECRET` signs the access token
- `JWT_REFRESH_SECRET` signs the refresh token

## Token creation

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

The access token is for normal authenticated requests. The refresh token is only used to get a fresh access token when the old one expires.

## Minimal refresh-token protection

To make refresh tokens a little safer without a full session system, the server stores a hash of the refresh token instead of the raw token value.

```js
function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}
```

When a user logs in or registers, the server stores the hash:

```js
await usersCollection.updateOne(
  { _id: user._id },
  { $set: { refreshTokenHash: hashToken(refreshToken) } },
);
```

Then when the client calls `/users/refresh`, the server verifies the signature and compares the hash:

```js
if (!user || hashToken(refreshToken) !== user.refreshTokenHash) {
  return res.status(401).json({ error: "Invalid refresh token" });
}
```

This is a small but meaningful improvement: the database does not store the raw refresh token, but it can still reject stale or revoked values.

## Login and register responses

Both routes return both tokens:

```js
res.status(200).json({
  message: "login successfully",
  userId: user.ID,
  accessToken,
  refreshToken,
});
```

```js
res.status(201).json({
  message: "created a new user",
  userId: result.insertedId,
  accessToken,
  refreshToken,
});
```

This keeps the frontend logic straightforward.

## Refresh route

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

The refresh flow should be used only when `401` happens from an expired access token.

## Logout invalidation

The app also exposes a small logout route that clears the stored refresh-token hash from the database.

```js
app.post("/users/logout", async (req, res) => {
  const user = await getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: "Invalid token" });
  }

  await usersCollection.updateOne(
    { _id: user._id },
    { $unset: { refreshTokenHash: "" } },
  );

  return res.status(200).json({ message: "logged out" });
});
```

This gives the app a minimal server-side invalidation step without a full session-table design.

## Protected routes

Each protected route does a token verification step before reading a task or user.

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

This checks the signed token and then fetches the user from MongoDB by id.

## Important server settings

Make sure the server has these env values in production:

```env
MONGODB_URI=...
JWT_SECRET=...
JWT_REFRESH_SECRET=...
```

Never store production secrets in the repo.

## Production note

This project is a learning app, so the JWT flow is intentionally minimal. In a stronger production setup, you would also add token rotation, revocation lists, and possibly secure cookie-based sessions instead of localStorage.
