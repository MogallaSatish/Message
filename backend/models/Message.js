// This file defines the Mongoose "Message" model.
// A model is like a blueprint that tells MongoDB what each message document
// should look like (which fields it has, what types they are, etc.)

const mongoose = require('mongoose');

// A Schema describes the shape of the data.
// Here we say: every message has a "text" field that:
//   - is a String
//   - is required (cannot be empty)
//   - is trimmed (leading/trailing spaces are removed)
const messageSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    // timestamps: true automatically adds two fields to every document:
    //   createdAt  -> when the message was first saved
    //   updatedAt  -> when the message was last changed
    timestamps: true,
  }
);

// mongoose.model('Message', schema) creates a usable Model called "Message".
// We export it so the route handlers in server.js can use it to save and
// fetch messages from the MongoDB database.
module.exports = mongoose.model('Message', messageSchema);
