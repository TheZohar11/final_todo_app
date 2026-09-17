# Querying MongoDB — The Driver Cookbook

Every query pattern this server uses (and a few it will want next), with the native `mongodb` driver.

## Reading

### One document — `findOne`

Returns the first match or `null`:

```js
const user = await usersCollection.findOne({ email });
const user = await usersCollection.findOne({ token });
const task = await tasksCollection.findOne({
  _id: new ObjectId(req.params.id),
});
```

The filter object is "field equals value". Multiple fields mean AND:

```js
await tasksCollection.findOne({ userId: user.ID, completed: false });
```

### Many documents — `find` + `toArray`

`find` returns a **cursor**, not data — `toArray()` actually fetches:

```js
const tasks = await tasksCollection.find({ userId: user.ID }).toArray();
```

Forgetting `toArray()` and `res.send`-ing the cursor is a classic bug — the client gets cursor metadata, not documents.

### Filtering beyond equality — query operators

```js
{ completed: true }                          // equals
{ ID: { $gt: 5 } }                           // greater than ($gte, $lt, $lte, $ne)
{ description: { $regex: "milk", $options: "i" } }  // contains, case-insensitive
{ userId: { $in: [1, 2, 3] } }               // one of
{ $or: [{ completed: false }, { userId: 7 }] }      // OR
```

### Sorting, limiting, projecting

Chain on the cursor before `toArray`:

```js
await tasksCollection
  .find({ userId: user.ID })
  .sort({ completed: 1, description: 1 }) // 1 asc, -1 desc
  .limit(20) // first 20
  .skip(20) // pagination: page 2
  .project({ description: 1, completed: 1 }) // only these fields (+_id)
  .toArray();
```

(This app currently sorts completed-last on the _client_; `.sort({ completed: 1 })` is the server-side equivalent.)

## Creating — `insertOne`

```js
const result = await tasksCollection.insertOne({
  description,
  completed: false,
  userId: user.ID,
});
// result.insertedId -> the new ObjectId (returned to the client as taskId)
```

No schema needed — the document you insert is the shape you get back.

## Updating

### `updateOne` — change specific fields

```js
await usersCollection.updateOne(
  { email }, // filter: which document
  { $set: { token } }, // update operators: what changes
  { upsert: true }, // optional: insert if no match (used by usersCounter)
);
```

Common operators: `$set` (assign), `$unset` (remove field), `$inc` (add to number — the race-safe way to do counters).

### `replaceOne` — swap the whole document

Used by the task toggle: read, mutate in JS, write back whole:

```js
task.completed = !task.completed;
await tasksCollection.replaceOne({ _id: new ObjectId(req.params.id) }, task);
```

Simpler to reason about; `updateOne` with `$set: { completed: !task.completed }` would be the lighter alternative.

## Deleting — `deleteOne`

```js
const result = await tasksCollection.deleteOne({
  _id: new ObjectId(req.params.id),
});
if (result.deletedCount === 0) {
  return res.status(404).json({ error: "Task not found" });
}
```

**Always check `deletedCount`** — deleting something that isn't there is not an error to Mongo, only to your API. (`deleteMany` exists for bulk cleanup.)

## ObjectId — the string/id bridge

URL params are strings; `_id` is an `ObjectId`. Convert or nothing matches:

```js
const { ObjectId } = require("mongodb");
{
  _id: new ObjectId(req.params.id);
} // ✅ matches
{
  _id: req.params.id;
} // ❌ silently matches nothing
```

An invalid string (wrong length/characters) makes `new ObjectId(...)` **throw** — which is why the routes' `try/catch` answers `400` for garbage ids.

## Key rules

- **`findOne` → document or `null`; `find` → cursor** (needs `toArray`).
- **`await` everything** — every driver call returns a promise; a forgotten await sends empty results with no error. (`deleteOne` in `DELETE /users/:id` is missing one — spot the bug.)
- **Check the result objects**: `deletedCount`, `insertedId`, `matchedCount` tell you what actually happened.
- **Filter by owner on every task query** — the `userId` filter is the row-level security of this app.
- **Convert URL ids with `new ObjectId(...)`** inside try/catch.
