const Application = require("../Database/Models/Application/application");
const { buildApplicationEmbed, buildResultsEmbed } = require("../Utils/ApplicationEmbed");

const RESULTS_CHANNEL_ID = "1475827783686029396";
const APPROVED_ROLES = [
  "1472332231195492593",
  "1485111870200352798",
  "1470972706332606612",
  "1490204254504353794",
  "1502277023425364048",
  "1502371091727909184",
];

module.exports = {
  customID: "applicationapprove",
  execute: async function (interaction, client, args) {
    const appId   = args?.[0];
    const comment = interaction.fields.getTextInputValue("comment");

    await interaction.deferReply({ flags: 64 });

    if (!interaction.client.database?.isConnected()) {
      return interaction.editReply({ content: "<a:loading:1506059355227947181> Database is unavailable. Please try again later." });
    }

    const app = await Application.findById(appId).catch(() => null);
    if (!app) {
      return interaction.editReply({ content: "<a:loading:1506059355227947181> Application not found." });
    }

    if (app.status !== "pending") {
      return interaction.editReply({ content: "<a:loading:1506059355227947181> This application has already been reviewed." });
    }

    await Application.findByIdAndUpdate(appId, {
      status:        "approved",
      reviewedById:  interaction.user.id,
      reviewedByTag: interaction.user.username,
    }).catch(() => null);

    try {
      const channel = await client.channels.fetch(app.channelId);
      const message = await channel.messages.fetch(app.messageId);
      await message.edit(
        buildApplicationEmbed({ appId, answers: app.answers, status: "approved" })
      );
    } catch {}

    const resultsChannel = await client.channels.fetch(RESULTS_CHANNEL_ID).catch(() => null);
    if (resultsChannel) {
      await resultsChannel.send(
        buildResultsEmbed({ userId: app.userId, comment })
      ).catch(() => null);
    }

    try {
      const member = await interaction.guild.members.fetch(app.userId);
      await member.roles.add(APPROVED_ROLES);
    } catch {}

    if (app.threadId) {
      const thread = await client.channels.fetch(app.threadId).catch(() => null);
      if (thread) {
        await thread.send({ content: `Application approved by <@${interaction.user.id}>.` }).catch(() => null);
      }
    }

    await interaction.editReply({ content: "<:warning:1489218432850464768> `-` Application has been accepted" });
  },
};
