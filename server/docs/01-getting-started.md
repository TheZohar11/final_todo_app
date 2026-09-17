# Server — Getting Started

An Express + MongoDB REST API for the todo app, written in Node.js (CommonJS).

## Running it

```bash
cd final_todo_app/server
npm install        # first time only
npm run dev        # nodemon - restarts on every file change
```

`npm start` (plain `node index.js`) is the production command; `npm run dev` is for development.

## Environment — `.env`

The server reads configuration from a `.env` file (loaded by `dotenv` at the very first line of `index.js`):

```
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net
PORT=5000
```

- `MONGODB_URI` is **required** — the server throws on startup without it. Get it from MongoDB Atlas → Connect → Drivers.
- `PORT` is optional (defaults to 5000). Hosting platforms like Render inject their own.
- `.env` is never committed — it holds credentials.

## Libraries used

| Library       | Why                                                             |
| ------------- | --------------------------------------------------------------- |
| **express**   | The web framework — routes, JSON parsing, responses             |
| **mongodb**   | Official native driver — `MongoClient`, collections, `ObjectId` |
| **bcryptjs**  | Password hashing — never store plain-text passwords             |
| **validator** | Input validation (`isEmail`)                                    |
| **uuid**      | Generating auth tokens (and user uuids)                         |
| **cors**      | Allows the React app (a different origin/port) to call this API |
| **dotenv**    | Loads `.env` into `process.env`                                 |
| **nodemon**   | (dev only) auto-restart on save                                 |

## The two global middlewares

```js
app.use(cors()); // answer cross-origin requests from the React dev server
app.use(express.json()); // parse JSON request bodies into req.body
```

Without `cors()` the browser blocks the React app's requests; without `express.json()` every `req.body` is `undefined`.

## Project structure

```
server/
  index.js                  # everything: DB connect, all routes, listen
  Logic/
    getTokenFromHeader.js   # extracts the Bearer token from a request
    tokenVerify.js          # (middleware draft) token -> user lookup
  package.json
  .env                      # not committed
```

## Startup flow (top of `index.js`)

1. `dotenv` loads `.env`.
2. `MongoClient` is created with the URI (throws early if missing).
3. `connectDB()` connects and grabs handles to the three collections (`users`, `tasks`, `usersCounter`) into module-level variables that all routes share.
4. `app.listen(PORT)` starts accepting requests.

See the rest of the server docs for the database, the routes, auth, and querying.
