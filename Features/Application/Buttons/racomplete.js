const {
  ModalBuilder,
  ActionRowBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");

const FIELD_SUPERVISOR_ROLE_ID = "1470972695188344883";

module.exports = {
  customID: "racomplete",
  execute: async function (interaction, client, args) {
    const requesterId = args?.[0];

    const hasAccess = interaction.member.roles.cache.has(FIELD_SUPERVISOR_ROLE_ID);

    if (!hasAccess) {
      return interaction.reply({
        content: "<a:loading:1506059355227947181> You don't have permission to use this button.",
        flags: 64,
      });
    }

    const modal = new ModalBuilder()
      .setCustomId(`racomplete_${requesterId}`)
      .setTitle("Complete Ride Along")
      .addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("result")
            .setLabel("Pass or Fail?")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("Pass / Fail")
            .setRequired(true)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("statement")
            .setLabel("Statement")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
        )
      );

    return interaction.showModal(modal);
  },
};
