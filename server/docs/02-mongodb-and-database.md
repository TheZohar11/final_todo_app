# MongoDB — Connection and Database Structure

How the server connects to MongoDB with the native driver, and what the data looks like.

## Connecting with MongoClient

```js
const { MongoClient, ObjectId } = require("mongodb");

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("MONGODB_URI is not set in .env");
}
const client = new MongoClient(uri);

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

connectDB();
```

The pattern:

1. **One client for the whole process** — created once, connected once at startup. The driver manages a connection pool internally; you never connect per-request.
2. **`client.db("todoApp")`** selects the database; **`db.collection(...)`** returns a handle per collection.
3. Handles are stored in **module-level variables** so every route can use them. (In MongoDB, databases and collections are created lazily — the first insert brings them into existence; no schema or migration step.)

## The database: `todoApp`

Three collections:

### `users`

```js
{
  _id: ObjectId("..."),      // Mongo's own id
  email: "user@example.com",
  password: "$2a$08$...",     // bcrypt HASH - never the real password
  ID: 7,                      // sequential number from usersCounter (see note!)
  uuid: "9b1deb4d-...",       // random unique id
  token: "3f2504e0-...",      // current auth token (uuid v4)
}
```

### `tasks`

```js
{
  _id: ObjectId("..."),       // used by the client as the task key and in URLs
  description: "buy milk",
  completed: false,
  userId: 7,                  // references users.ID - the owner
}
```

### `usersCounter`

```js
{ _id: "userCount", count: 8 }  // a single document holding the next user number
```

## ⚠️ Note on `usersCounter` vs uuid

The sequential-counter collection exists **only to keep this learning project simple**. In real systems it's an anti-pattern:

- Sequential IDs are **guessable** (user 7 implies users 1–6 exist) — an enumeration risk.
- The read-then-update of the counter is a **race condition** — two simultaneous registrations can get the same `ID`.
- It costs an extra round trip on every registration.

The standard choices are the **`_id` ObjectId** Mongo already generates for free, or a **uuid** (which this project already stores per user anyway). New projects should key users on one of those and skip the counter entirely.

## Relationships without joins

MongoDB has no foreign keys. The link `tasks.userId → users.ID` is **by convention**, enforced in route code:

```js
const user = await usersCollection.findOne({ token });
const tasks = await tasksCollection.find({ userId: user.ID }).toArray();
```

Every task query filters by the owner's id — that's what keeps each user seeing only their own tasks.
