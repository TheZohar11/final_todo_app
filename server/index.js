require("dotenv").config();
const crypto = require("crypto");
const express = require("express");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const { MongoClient, ObjectId } = require("mongodb");
const app = express();

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "dev-refresh-secret";

const cors = require("cors");
const { getTokenFromHeader } = require("./Logic/getTokenFromHeader");
app.use(cors());

const PORT = process.env.PORT || 5000;
const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("MONGODB_URI is not set in .env");
}
const client = new MongoClient(uri);

app.use(express.json());
let usersCollection;
let tasksCollection;
let countersCollection;

async function connectDB() {
  await client.connect();
  const db = client.db("todoApp");
  usersCollection = db.collection("users");
  tasksCollection = db.collection("tasks");
  countersCollection = db.collection("usersCounter");
  console.log("connected to mongo");
}

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

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

try {
  connectDB();
} catch (e) {
  console.log(e);
}

//login route
app.post("/users/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  if (!validator.isEmail(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  try {
    const user = await usersCollection.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
      const { accessToken, refreshToken } = createTokens(user);
      await usersCollection.updateOne(
        { _id: user._id },
        { $set: { refreshTokenHash: hashToken(refreshToken) } },
      );
      res.status(200).json({
        message: "login successfully",
        userId: user.ID,
        accessToken,
        refreshToken,
      });
    } else {
      res.status(401).json({ error: "invalid email or password" });
    }
  } catch (e) {
    res.status(500).send();
  }
});

//creating a user (sign up)
app.post("/users", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  if (!validator.isEmail(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }
  if (password.length < 6) {
    return res
      .status(400)
      .json({ error: "Password must be at least 6 characters" });
  }

  try {
    let counterDoc = await countersCollection.findOne();
    let count = counterDoc ? counterDoc.count : 1;

    const hashedPassword = await bcrypt.hash(password, 8);
    const userObj = {
      email,
      password: hashedPassword,
      ID: count,
      uuid: uuidv4(),
      token: uuidv4(),
      refreshTokenHash: "",
    };
    const result = await usersCollection.insertOne(userObj);
    await countersCollection.updateOne(
      { _id: "userCount" },
      { $set: { count: count + 1 } },
      { upsert: true },
    );
    if (!result) {
      res.status(400);
    }
    const { accessToken, refreshToken } = createTokens(userObj);
    await usersCollection.updateOne(
      { _id: result.insertedId },
      { $set: { refreshTokenHash: hashToken(refreshToken) } },
    );
    res.status(201).json({
      message: "created a new user",
      userId: result.insertedId,
      accessToken,
      refreshToken,
    });
  } catch (e) {
    res.status(500).json({ error: "error creating the user" });
  }
});

app.post("/users/refresh", async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ error: "Refresh token required" });
  }

  try {
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    const user = await usersCollection.findOne({ ID: decoded.userId });
    if (!user || hashToken(refreshToken) !== user.refreshTokenHash) {
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    const { accessToken } = createTokens(user);
    return res.status(200).json({ accessToken });
  } catch (e) {
    return res.status(401).json({ error: "Invalid refresh token" });
  }
});

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

//creating a task
app.post("/tasks", async (req, res) => {
  const { description, completed } = req.body;

  // Validate required fields
  if (!description) {
    return res.status(400).json({ error: "description is required" });
  }

  try {
    const user = await getAuthUser(req);
    if (!user) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const result = await tasksCollection.insertOne({
      description,
      completed: completed !== undefined ? completed : false,
      userId: user.ID,
    });
    if (!result) {
      res.status(400);
    }
    res
      .status(201)
      .json({ message: "created a new task", taskId: result.insertedId });
  } catch (e) {
    res.status(500).json({ error: "error creating the task" });
  }
});

// reading all tasks for a specific user (get home data)
app.get("/tasks", async (req, res) => {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const tasks = await tasksCollection.find({ userId: user.ID }).toArray();
    res.send(tasks);
  } catch (e) {
    res.status(500).send(e);
  }
});

//updating a task
app.patch("/tasks/:id", async (req, res) => {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return res.status(401).json({ error: "Invalid token" });
    }

    // Find the task
    const task = await tasksCollection.findOne({
      _id: new ObjectId(req.params.id),
    });

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    // Verify task belongs to this user
    if (task.userId !== user.ID) {
      return res
        .status(403)
        .json({ error: "Not authorized to update this task" });
    }

    // Toggle completion status
    task.completed = !task.completed;
    await tasksCollection.replaceOne(
      { _id: new ObjectId(req.params.id) },
      task,
    );

    res.status(200).json({ message: "Task updated successfully", task });
  } catch (e) {
    res.status(400).send(e);
  }
});

//deleting a task (temporary- not completed yet)
app.delete("/tasks/:id", async (req, res) => {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return res.status(401).json({ error: "Invalid token" });
    }
    const task = await tasksCollection.findOne({
      _id: new ObjectId(req.params.id),
    });
    if (task.userId !== user.ID) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this task" });
    }

    const result = await tasksCollection.deleteOne({
      _id: new ObjectId(req.params.id),
    });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.json({ message: "Task deleted" });
  } catch (e) {
    res.status(400).send(e);
  }
});

//deleting a user (temporary- not completed yet)
app.delete("/users/:id", async (req, res) => {
  try {
    const result = usersCollection.deleteOne({
      _id: new ObjectId(req.params.id),
    });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ message: "user deleted" });
  } catch (e) {
    res.status(400).send(e);
  }
});

// Example route
app.get("/", (req, res) => {
  res.send("Server is running!");
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
