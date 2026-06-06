const mongoose = require("mongoose");

const PromotionSchema = new mongoose.Schema({
  guildId:      { type: String, required: true },
  targetId:     { type: String, required: true },
  targetTag:    { type: String, required: true },
  issuedById:   { type: String, required: true },
  issuedByTag:  { type: String, required: true },
  rankId:       { type: String, required: true },
  rankName:     { type: String, required: true },
  reason:       { type: String, required: true },
  messageId:    { type: String },
  channelId:    { type: String },
  timestamp:    { type: Number },
}, { timestamps: true });

PromotionSchema.index({ guildId: 1 });
PromotionSchema.index({ targetId: 1 });

module.exports = mongoose.model("Promotion", PromotionSchema);
