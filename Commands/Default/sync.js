const { SlashCommandBuilder } = require("discord.js");
const Infraction = require("../../Database/Models/Infraction/infraction");
const Application = require("../../Database/Models/Application/application");
const { buildInfractionEmbed } = require("../../Features/Infraction/Utils/InfractionEmbed");
const { buildApplicationEmbed } = require("../../Features/Application/Utils/ApplicationEmbed");

const HIGH_COMMAND_ROLE_ID = "1470972691287638149";
const SUPERVISORY_ROLE_ID  = "1470972695188344883";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("sync")
    .setDescription("Re-sync all stored embeds to reflect current database state"),
  execute: async function (interaction, client) {
    const hasAccess =
      interaction.member.roles.cache.has(HIGH_COMMAND_ROLE_ID) ||
      interaction.member.roles.cache.has(SUPERVISORY_ROLE_ID);

    if (!hasAccess) {
      return interaction.reply({ content: "You're not allowed to use this command.", flags: 64 });
    }

    if (!interaction.client.database?.isConnected()) {
      return interaction.reply({ content: "Database is not connected.", flags: 64 });
    }

    await interaction.deferReply({ flags: 64 });

    let infraUpdated = 0, infraFailed = 0;
    let appUpdated = 0, appFailed = 0;

    const infractions = await Infraction.find({ guildId: interaction.guildId }).catch(() => []);
    for (const infraction of infractions) {
      if (!infraction.channelId || !infraction.messageId) { infraFailed++; continue; }
      try {
        const channel = await interaction.client.channels.fetch(infraction.channelId);
        const message = await channel.messages.fetch(infraction.messageId);
        await message.edit(
          buildInfractionEmbed({
            targetMention: `<@${infraction.targetId}>`,
            issuerName:    infraction.issuedByTag,
            statement:     infraction.statement,
            punishment:    infraction.punishment,
            paddedId:      infraction.infractionId,
            timestamp:     infraction.timestamp,
            voidedBy:      infraction.voided ? `<@${infraction.voidedById}>` : null,
            voidReason:    infraction.voidReason ?? null,
          })
        );
        infraUpdated++;
      } catch {
        infraFailed++;
      }
    }

    const applications = await Application.find({ guildId: interaction.guildId }).catch(() => []);
    for (const app of applications) {
      if (!app.channelId || !app.messageId) { appFailed++; continue; }
      try {
        const channel = await interaction.client.channels.fetch(app.channelId);
        const message = await channel.messages.fetch(app.messageId);
        await message.edit(
          buildApplicationEmbed({
            appId:         app._id.toString(),
            answers:       app.answers,
            status:        app.status,
            declineReason: app.declineReason ?? null,
          })
        );
        appUpdated++;
      } catch {
        appFailed++;
      }
    }

    return interaction.editReply({
      content: [
        `<:check:1508589586551406664> Sync complete.`,
        `**Infractions:** ${infraUpdated} updated, ${infraFailed} skipped/failed`,
        `**Applications:** ${appUpdated} updated, ${appFailed} skipped/failed`,
      ].join("\n"),
    });
  },
};
