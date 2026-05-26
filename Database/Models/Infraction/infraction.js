const mongoose = require("mongoose");

const InfractionSchema = new mongoose.Schema({
  infractionId: { type: String, required: true, unique: true },
  guildId:      { type: String, required: true },
  targetId:     { type: String, required: true },
  targetTag:    { type: String, required: true },
  issuedById:   { type: String, required: true },
  issuedByTag:  { type: String, required: true },
  statement:    { type: String, required: true },
  punishment:   { type: String, required: true },
  messageId:    { type: String },
  channelId:    { type: String },
  timestamp:    { type: Number },
  voided:       { type: Boolean, default: false },
  voidedById:   { type: String },
  voidedByTag:  { type: String },
  voidReason:   { type: String },
}, { timestamps: true });

InfractionSchema.index({ guildId: 1 });
InfractionSchema.index({ targetId: 1 });

module.exports = mongoose.model("Infraction", InfractionSchema);
