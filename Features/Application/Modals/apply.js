const Application = require("../../../Database/Models/Application/application");
const { buildApplicationEmbed } = require("../Utils/ApplicationEmbed");

const APPLICATION_CHANNEL_ID = "1494371736953557206";
const HIGH_COMMAND_ROLE_ID   = "1470972691287638149";

module.exports = {
  customID: "apply",
  execute: async function (interaction, client) {
    await interaction.deferReply({ flags: 64 });

    if (!interaction.client.database?.isConnected()) {
      return interaction.editReply({ content: "<a:loading:1506059355227947181> Database is unavailable. Please try again later." });
    }

    const answers = [
      interaction.fields.getTextInputValue("q1"),
      interaction.fields.getTextInputValue("q2"),
      interaction.fields.getTextInputValue("q3"),
      interaction.fields.getTextInputValue("q4"),
      interaction.fields.getTextInputValue("q5"),
    ];

    const app = await Application.create({
      userId:    interaction.user.id,
      username:  interaction.user.username,
      guildId:   interaction.guild.id,
      answers,
      status:    "pending",
    }).catch(() => null);

    if (!app) {
      return interaction.editReply({ content: "<a:loading:1506059355227947181> Failed to submit your application. Please try again." });
    }

    const appId = app._id.toString();

    const channel = await client.channels.fetch(APPLICATION_CHANNEL_ID).catch(() => null);
    if (!channel) {
      return interaction.editReply({ content: "<a:loading:1506059355227947181> Could not find the application channel. Please contact an administrator." });
    }

    const embed = buildApplicationEmbed({ appId, answers, status: "pending" });
    const msg = await channel.send(embed).catch(() => null);

    if (msg) {
      const thread = await channel.threads.create({
        name:              `Application — ${interaction.user.username}`,
        startMessage:      msg,
        autoArchiveDuration: 1440,
      }).catch(() => null);

      const updates = { channelId: channel.id, messageId: msg.id };
      if (thread) {
        updates.threadId = thread.id;
        await thread.send({ content: `<@&${HIGH_COMMAND_ROLE_ID}> New application from <@${interaction.user.id}>.` }).catch(() => null);
      }

      await Application.findByIdAndUpdate(appId, updates).catch(() => null);
    }

    await interaction.editReply({ content: "<:clipboard:1497255025561436262> Your application has been submitted and is pending review." });
  },
};
