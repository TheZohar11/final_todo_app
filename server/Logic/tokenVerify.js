export async function tokenVerify(req, res, next) {
  const token = getTokenFromHeader(req);

  if (!token) {
    return res.status(401).json({ error: "Authorization token required" });
  }

  try {
    // Verify user by token
    const user = await usersCollection.findOne({ token });
    if (!user) {
      return res.status(401).json({ error: "Invalid token" });
    }
    req.user = user;
    next();
  } catch (e) {
    res.status(500).json({ error: "Server error during token verification" });
  }
}
