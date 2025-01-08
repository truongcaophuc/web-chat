const mongoose = require("mongoose");

const GroupConversationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },

  participants: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  ],
  messages: [
    {
      to: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
      from: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
      type: {
        type: String,
        enum: ["Text", "Media", "Document", "Link"],
      },
      created_at: {
        type: Date,
        default: Date.now(),
      },
      text: {
        type: String,
      },
      file: {
        type: String,
      },
      is_read: {
        type: Boolean,
        default: false,
      },
    },
  ],
});

const GroupConversation = new mongoose.model(
  "GroupConversation",
  GroupConversationSchema
);
module.exports = GroupConversation;
