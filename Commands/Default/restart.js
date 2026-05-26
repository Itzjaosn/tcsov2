const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("restart")
    .setDescription("Pull latest code from GitHub and restart the bot.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  execute: async function (interaction) {
    await interaction.deferReply({ ephemeral: true });

    const { PANEL_URL, PANEL_API_KEY, PANEL_SERVER_ID } = process.env;

    const res = await fetch(
      `${PANEL_URL}/api/client/servers/${PANEL_SERVER_ID}/power`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PANEL_API_KEY}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ signal: "restart" }),
      }
    );

    if (res.status === 204) {
      await interaction.editReply("Restarting... back in a moment.");
    } else {
      const body = await res.text();
      await interaction.editReply(`Failed to restart. Status: ${res.status}\n\`\`\`${body}\`\`\``);
    }
  },
};
