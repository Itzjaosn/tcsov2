const Infraction = require("../../../Database/Models/Infraction/infraction");
const { buildInfractionEmbed } = require("../Utils/InfractionEmbed");

module.exports = {
  customID: "infraction",
  execute: async function (interaction, client, args) {
    if (args?.[0] === "editstatement") {
      const infractionId = args[1];
      const newStatement = interaction.fields.getTextInputValue("statement");

      await interaction.deferReply({ flags: 64 });

      const infraction = interaction.client.database?.isConnected()
        ? await Infraction.findOne({ infractionId }).catch(() => null)
        : null;

      if (!infraction) {
        return interaction.editReply({ content: "Could not find that infraction in the database." });
      }

      await Infraction.findOneAndUpdate({ infractionId }, { statement: newStatement }).catch(() => {});

      try {
        const channel = await interaction.client.channels.fetch(infraction.channelId);
        const message = await channel.messages.fetch(infraction.messageId);
        await message.edit(
          buildInfractionEmbed({
            targetMention: `<@${infraction.targetId}>`,
            issuerName:    infraction.issuedByTag,
            statement:     newStatement,
            punishment:    infraction.punishment,
            paddedId:      infraction.infractionId,
            timestamp:     infraction.timestamp,
            voidedBy:      infraction.voided ? `<@${infraction.voidedById}>` : null,
            voidReason:    infraction.voidReason ?? null,
          })
        );
      } catch {}

      return interaction.editReply({ content: "<:check:1508589586551406664> Punishment statement has been updated." });
    }

    if (args?.[0] !== "reason") return;

    const infractionId = args[1];
    const reason = interaction.fields.getTextInputValue("reason");

    await interaction.deferReply({ flags: 64 });

    const infraction = interaction.client.database?.isConnected()
      ? await Infraction.findOne({ infractionId }).catch(() => null)
      : null;

    if (!infraction) {
      return interaction.editReply({ content: "<a:loading:1506059355227947181> Could not find that infraction in the database." });
    }

    if (infraction.voided) {
      return interaction.editReply({ content: "<a:loading:1506059355227947181> This infraction has already been voided." });
    }

    await Infraction.findOneAndUpdate(
      { infractionId },
      { voided: true, voidedById: interaction.user.id, voidedByTag: interaction.user.username, voidReason: reason }
    ).catch(() => {});

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
          voidedBy:      `<@${interaction.user.id}>`,
          voidReason:    reason,
        })
      );
      await message.reply({ content: `<:notes:1497254373158420530> Infraction was voided by <@${interaction.user.id}>` });
    } catch {}

    await interaction.editReply({ content: "<:check:1508589586551406664> Infraction has been voided." });
  },
};
