const { MessageFlags } = require("discord.js");

module.exports = {
  customID: "shiftAttend",
  execute: async function (interaction, client) {
    if (!client.shiftAttendees) client.shiftAttendees = new Map();

    const messageId = interaction.message.id;
    if (!client.shiftAttendees.has(messageId)) {
      client.shiftAttendees.set(messageId, new Set());
    }

    const attendees = client.shiftAttendees.get(messageId);
    const userId = interaction.user.id;

    if (attendees.has(userId)) {
      attendees.delete(userId);
      await interaction.reply({
        content: "<:check:1508589586551406664> You're no longer attending.",
        flags: MessageFlags.Ephemeral,
      });
    } else {
      attendees.add(userId);
      await interaction.reply({
        content: "<:check:1508589586551406664> Marked as attending.\n-# We thank you so much for your continued support and dedication within the deaprtment.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
