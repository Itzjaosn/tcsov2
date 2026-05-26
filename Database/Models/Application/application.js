const mongoose = require("mongoose");

const ApplicationSchema = new mongoose.Schema({
  userId:        { type: String, required: true },
  username:      { type: String, required: true },
  guildId:       { type: String, required: true },
  messageId:     { type: String },
  channelId:     { type: String },
  threadId:      { type: String },
  answers:       { type: [String], required: true },
  status:        { type: String, enum: ["pending", "approved", "declined"], default: "pending" },
  declineReason: { type: String },
  reviewedById:  { type: String },
  reviewedByTag: { type: String },
}, { timestamps: true });

ApplicationSchema.index({ userId: 1, status: 1 });
ApplicationSchema.index({ messageId: 1 });

module.exports = mongoose.model("Application", ApplicationSchema);
