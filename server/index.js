require("dotenv").config();
const express = require("express");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const { MongoClient, ObjectId } = require("mongodb");
const app = express();

const cors = require("cors");
app.use(cors());

const PORT = 5000;
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

try {
  connectDB();
} catch (e) {
  console.log(e);
}

//login route
app.post("/users/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await usersCollection.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
      //res.status(200).json({ message: 'login successfully', userId: user._id })
      res.status(200).json({
        message: "login successfully",
        userId: user.ID,
        token: user.token,
      }); // ? maybe this line instead of
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
  try {
    let counterDoc = await countersCollection.findOne();
    let count = counterDoc ? counterDoc.count : 1;

    const hashedPassword = await bcrypt.hash(password, 8);
    const userObj = {
      email,
      password: hashedPassword,
      ID: count,
      uuid: uuidv4(),
    };
    const result = await usersCollection.insertOne(userObj);
    await countersCollection.updateOne(
      { _id: "userCount" },
      { $set: { count: count + 1 } },
      { upsert: true }
    );
    if (!result) {
      res.status(400);
    }
    res
      .status(201)
      .json({ message: "created a new user", userId: result.insertedId });
  } catch (e) {
    res.status(500).json({ error: "error creating thr user" });
  }
});

//creating a task
app.post("/tasks", async (req, res) => {
  const { description, completed } = req.body;
  const token = req.query.token;

  if (!token) {
    return res.status(401).json({ error: "Token is required" });
  }

  // Validate required fields
  if (!description) {
    return res.status(400).json({ error: "description is required" });
  }

  try {
    // Get user by token
    const user = await usersCollection.findOne({ token });
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

//reading all users (temporary)
app.get("/users", async (req, res) => {
  try {
    const users = await usersCollection.find();
    res.send(users);
  } catch (e) {
    res.status(500).send(e);
  }
});

// reading all tasks for a specific user (get home data)
app.get("/tasks", async (req, res) => {
  const userId = req.query.userId;
  const token = req.query.token;

  try {
    let query = {};

    if (token) {
      // Find user by token
      const user = await usersCollection.findOne({ token });
      if (!user) {
        return res.status(401).json({ error: "Invalid token" });
      }
      query.userId = user.ID;
    } else if (userId) {
      // use userId if no token is provided
      query.userId = parseInt(userId);
    } else {
      return res
        .status(400)
        .json({ error: "Either token or userId must be provided" });
    }

    const tasks = await tasksCollection.find(query).toArray();
    res.send(tasks);
  } catch (e) {
    res.status(500).send(e);
  }
});

//updating a user
app.patch("/users/:id", async (req, res) => {
  const updates = Object.keys(req.body);
  try {
    const user = await usersCollection.findById(req.params.id);
    updates.forEach((update) => (user[update] = req.body[update]));
    await user.save();
  } catch (e) {
    res.status(400).send(e);
  }
});

//updating a task
app.patch("/tasks/:id", async (req, res) => {
  const updates = Object.keys(req.body);
  try {
    const task = await tasksCollection.findById(req.params.id);
    updates.forEach((update) => (task[update] = req.body[update]));
    await user.save();
  } catch (e) {
    res.status(400).send(e);
  }
});

//deleting a task (temporary- not completed yet)
app.delete("/tasks/:id", async (req, res) => {
  try {
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
