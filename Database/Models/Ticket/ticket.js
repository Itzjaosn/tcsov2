const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  authorId:    { type: String, required: true },
  authorTag:   { type: String, required: true },
  content:     { type: String, default: "" },
  attachments: { type: [String], default: [] },
  timestamp:   { type: Date, required: true },
}, { _id: false });

const TicketSchema = new mongoose.Schema({
  ticketId:    { type: String, required: true, unique: true },
  channelId:   { type: String, required: true, unique: true },
  guildId:     { type: String, required: true },
  channelName: { type: String, required: true },
  type:        { type: String, enum: ["general", "highcommand"], required: true },
  openedById:   { type: String, required: true },
  openedByTag:  { type: String, required: true },
  claimedById:  { type: String },
  claimedByTag: { type: String },
  closedById:   { type: String },
  closedByTag:  { type: String },
  inquiry:      { type: String, default: "" },
  status:       { type: String, enum: ["open", "closed"], default: "open" },
  messages:     { type: [MessageSchema], default: [] },
}, { timestamps: true });

TicketSchema.index({ guildId: 1 });
TicketSchema.index({ openedById: 1 });

module.exports = mongoose.model("Ticket", TicketSchema);
