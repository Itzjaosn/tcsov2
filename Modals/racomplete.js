const { Routes } = require("discord.js");

const RA_LOG_CHANNEL_ID = "1507526058239463545";
const RA_ROLES = [
  "1470972697604522045",
  "1485111870200352798",
  "1470972706332606612",
  "1490204254504353794",
];

module.exports = {
  customID: "racomplete",
  execute: async function (interaction, client, args) {
    const requesterId = args?.[0];
    const result = interaction.fields.getTextInputValue("result").trim();
    const statement = interaction.fields.getTextInputValue("statement").trim();

    await interaction.deferReply({ flags: 64 });

    const isPassed = /^pass(ed)?$/i.test(result);

    if (!isPassed) {
      return interaction.editReply({ content: "<a:loading:1506059355227947181> Ride along marked as **Failed**. No log has been created." });
    }

    const member = await interaction.guild.members.fetch(requesterId).catch(() => null);
    if (member) {
      for (const roleId of RA_ROLES) {
        await member.roles.add(roleId).catch((err) => client.logs?.error?.(err));
      }
    }

    const posted = await client.rest.post(Routes.channelMessages(RA_LOG_CHANNEL_ID), {
      body: {
        flags: 32768,
        components: [
          {
            type: 17,
            components: [
              {
                type: 10,
                content: `# <:HCSO:1509640458379464957> Ride Along Log\n-# Supervisor: <@${interaction.user.id}>\n- **Pass or Fail?**\n\`\`\`Passed\`\`\`\n- **Statement**\n\`\`\`${statement}\`\`\`\n\n\n`,
              },
              {
                type: 12,
                items: [
                  {
                    media: {
                      url: "https://images-ext-1.discordapp.net/external/MzIksgwnY_eQTOsW8oVYHRd8gjdTpYHoLGuCDtw5p9o/https/scnx-cdn.scootkit.net/1776266196390-guild-LjjdP0ksIIUvwqxpgWIOBv4DH2hfOeD9eBwivv5nNEy19dDS.png?format=webp&quality=lossless",
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
    }).catch((err) => {
      client.logs?.error?.(err);
      return null;
    });

    if (!posted) {
      return interaction.editReply({ content: "<a:loading:1506059355227947181> Failed to post the RA log. Please try again." });
    }

    await interaction.editReply({ content: "<a:loading:1506059355227947181> Ride along has been logged successfully." });
  },
};
