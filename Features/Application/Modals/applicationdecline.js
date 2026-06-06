const Application = require("../../../Database/Models/Application/application");
const { buildApplicationEmbed } = require("../Utils/ApplicationEmbed");

module.exports = {
  customID: "applicationdecline",
  execute: async function (interaction, client, args) {
    const appId  = args?.[0];
    const reason = interaction.fields.getTextInputValue("reason");

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
      status:        "declined",
      declineReason: reason,
      reviewedById:  interaction.user.id,
      reviewedByTag: interaction.user.username,
    }).catch(() => null);

    try {
      const channel = await client.channels.fetch(app.channelId);
      const message = await channel.messages.fetch(app.messageId);
      await message.edit(
        buildApplicationEmbed({ appId, answers: app.answers, status: "declined", declineReason: reason })
      );
    } catch {}

    if (app.threadId) {
      const thread = await client.channels.fetch(app.threadId).catch(() => null);
      if (thread) {
        await thread.send({ content: `Application declined by <@${interaction.user.id}>. Reason: ${reason}` }).catch(() => null);
      }
    }

    await interaction.editReply({ content: "<:warning:1489218432850464768> Application has been denied" });
  },
};
