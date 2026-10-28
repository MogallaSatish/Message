# My First Full-Stack App

A very simple beginner-friendly full-stack app that shows how the **frontend**, **backend**, and **database** connect.

- **Frontend:** React + Vite (this folder)
- **Backend:** Node.js + Express (in the `backend/` folder)
- **Database:** MongoDB Atlas, accessed through Mongoose

## What it does

- Shows a heading: **My First Full-Stack App**.
- You type a message and click **Save Message**.
- React sends the message to the Express backend, which saves it to MongoDB Atlas.
- All saved messages are listed on the page.
- Each message has a **Delete** button that removes it from MongoDB.
- The list refreshes automatically after saving or deleting.

## The request/response flow (simple version)

1. **Page loads** — React sends `GET /api/messages` to Express. Express uses Mongoose to read every message from MongoDB and returns them as JSON. React shows them.
2. **You save a message** — React sends `POST /api/messages` with `{ text: "your message" }`. Express checks the text isn't empty, then Mongoose saves a new document to MongoDB. React re-fetches the list.
3. **You delete a message** — React sends `DELETE /api/messages/<id>`. Express uses Mongoose to remove that document from MongoDB. React re-fetches the list.

Every action follows the same round trip:

```
Button click in React
   -> fetch() sends an HTTP request
   -> Express route handler runs
   -> Mongoose model reads/writes MongoDB
   -> HTTP JSON response goes back to React
   -> React updates the screen
```

## Project structure

```
.
├── index.html              # Vite entry HTML
├── package.json            # Frontend dependencies & scripts
├── vite.config.ts          # Vite config (proxies /api -> backend on port 5000)
├── src/
│   ├── App.tsx             # The React UI (messages, input, delete buttons)
│   ├── api.ts              # Helper functions that call the backend API
│   └── main.tsx            # React entry point
└── backend/                # The Express + Mongoose backend (separate folder)
    ├── package.json        # Backend dependencies & scripts
    ├── server.js           # Express app: routes + MongoDB connection
    ├── models/
    │   └── Message.js      # Mongoose Message model (required text + timestamps)
    └── .env.example        # Copy this to .env and add your MONGODB_URI
```

## Setup

### 1. Get your MongoDB Atlas connection string

1. Create a free account at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Build a free cluster.
3. Add a database user (username + password).
4. Click **Connect** → **Drivers** → copy the connection string. It looks like:

   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### 2. Configure the backend

```bash
cd backend
npm install
cp .env.example .env
```

Open `backend/.env` and replace the placeholder with your real connection string:

```
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
PORT=5000
```

> **If `MONGODB_URI` is missing**, the backend will refuse to start and print instructions. On **Replit**, add it under **Tools → Secrets** as a key `MONGODB_URI` with the connection string as the value. Never commit `.env` to git — it is in `.gitignore`.

### 3. Configure the frontend

From the project root (the folder with this README):

```bash
npm install
```

## Running the app

You need **two terminals** — one for the backend, one for the frontend.

**Terminal 1 — backend:**
```bash
cd backend
npm start
```
You should see: `Connected to MongoDB Atlas` and `Backend API running at http://localhost:5000`.

**Terminal 2 — frontend:**
```bash
npm run dev
```
Open the URL Vite prints (usually `http://localhost:5176`).

### Replit run command

On Replit, the frontend is the main app. Set the run command to start both:

```bash
npm --prefix backend start & npm run dev
```

This starts the Express backend in the background, then starts Vite. The Vite config proxies `/api` requests to `http://localhost:5000`, so the frontend reaches the backend automatically.

> Add `MONGODB_URI` under **Tools → Secrets** on Replit. The backend reads it via `process.env.MONGODB_URI`.

## API reference

| Method  | URL                    | Body                  | Description                      |
|---------|------------------------|-----------------------|----------------------------------|
| GET     | `/api/messages`        | —                     | Return all messages (newest first) |
| POST    | `/api/messages`        | `{ "text": "..." }`   | Save a new message               |
| DELETE  | `/api/messages/:id`    | —                     | Delete the message with that id  |

## Testing it yourself

1. Start the backend and confirm it says `Connected to MongoDB Atlas`.
2. Start the frontend and open it in your browser.
3. Type a message and click **Save Message** — it should appear in the list.
4. Click **Delete** on a message — it should disappear.
5. Refresh the page — the messages persist (they're stored in MongoDB, not memory).

If saving, retrieving, or deleting doesn't work, check that `MONGODB_URI` is set and that your Atlas cluster allows connections from your IP (Network Access in the Atlas dashboard).
