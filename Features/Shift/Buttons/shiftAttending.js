const { MessageFlags } = require("discord.js");

module.exports = {
  customID: "shiftAttending",
  execute: async function (interaction, client) {
    if (!client.shiftAttendees) client.shiftAttendees = new Map();

    const messageId = interaction.message.id;
    const attendees = client.shiftAttendees.get(messageId) ?? new Set();

    const userList =
      attendees.size > 0
        ? [...attendees].map((id) => `<@${id}>`).join("\n")
        : "*No one is attending yet.*";

    await interaction.reply({
      flags: MessageFlags.Ephemeral | 32768,
      components: [
        {
          type: 17,
          components: [
            {
              type: 10,
              content: `-# View who's attending this shift.\n\n${userList}`,
            },
          ],
        },
      ],
    });
  },
};
