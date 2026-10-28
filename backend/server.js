// server.js — the Express backend
// ---------------------------------------------------------------------
// This is the "backend" of the app. It does three jobs:
//   1. Connects to the MongoDB Atlas database using Mongoose.
//   2. Exposes a REST API the React frontend can call:
//        GET    /api/messages       -> return all saved messages
//        POST   /api/messages       -> save a new message
//        DELETE /api/messages/:id   -> delete one message by its id
//   3. Listens on a port (default 5000) so the frontend can reach it.
//
// Request/response flow, in simple terms:
//   - The browser (React) sends an HTTP request to one of these URLs.
//   - Express matches the URL + method to one of the route handlers below.
//   - That handler uses the Mongoose "Message" model to read/write MongoDB.
//   - Express sends an HTTP response back (JSON), which React then displays.
// ---------------------------------------------------------------------

require('dotenv').config(); // loads MONGODB_URI and PORT from backend/.env

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Message = require('./models/Message'); // the Mongoose model

const app = express();
const PORT = process.env.PORT || 5000;

// Allow the React frontend (running on a different port) to call this API.
// In production you'd lock this down to your real frontend URL.
app.use(cors());

// Parse JSON bodies in incoming requests so req.body works for POST.
app.use(express.json());

// Connect to MongoDB Atlas. process.env.MONGODB_URI comes from backend/.env.
// If it is missing, we log a clear message explaining how to add it.
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('\n[ERROR] MONGODB_URI is not set!');
  console.error('Create a file called backend/.env with:');
  console.error('  MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority');
  console.error('Or, on Replit, add MONGODB_URI under Tools -> Secrets.\n');
  process.exit(1);
}

// Mongoose connects to the database.mongoose.connect is async, so we wait.
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch((err) => {
    console.error('Failed to connect to MongoDB Atlas:', err.message);
    process.exit(1);
  });

// ------------------------------------------------------------------
// GET /api/messages
// The frontend calls this to display all saved messages.
// Message.find({}) asks MongoDB for every document in the messages
// collection, sorted with the newest first (createdAt descending).
// We respond with a JSON array.
// ------------------------------------------------------------------
app.get('/api/messages', async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// ------------------------------------------------------------------
// POST /api/messages
// The frontend sends { text: "some message" } in the request body.
// We validate that text exists and isn't just whitespace, then use
// Mongoose to create + save a new document in MongoDB.
// We respond with the saved message (including its new _id and timestamps).
// ------------------------------------------------------------------
app.post('/api/messages', async (req, res) => {
  try {
    const text = (req.body && req.body.text || '').trim();
    if (!text) {
      return res.status(400).json({ error: 'Message text is required' });
    }

    // new Message({...}) builds a document; .save() writes it to MongoDB.
    const newMessage = await Message.create({ text });
    res.status(201).json(newMessage);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save message' });
  }
});

// ------------------------------------------------------------------
// DELETE /api/messages/:id
// The ":id" part is a URL parameter (the message's MongoDB _id).
// Message.findByIdAndDelete(id) removes that one document from MongoDB.
// We respond with a small confirmation so the frontend knows it worked.
// ------------------------------------------------------------------
app.delete('/api/messages/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Message.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Message not found' });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

// Start the server.
app.listen(PORT, () => {
  console.log(`Backend API running at http://localhost:${PORT}`);
});
