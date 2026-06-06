const {
  ModalBuilder,
  ActionRowBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");
const Infraction = require("../../../Database/Models/Infraction/infraction");

const HIGH_COMMAND_ROLE_ID = "1470972691287638149";
const SUPERVISORY_ROLE_ID  = "1470972695188344883";

module.exports = {
  customID: "infraction",
  execute: async function (interaction, client, args) {
    const infractionId = args[0];
    const action = interaction.values[0];

    const hasAccess =
      interaction.member.roles.cache.has(HIGH_COMMAND_ROLE_ID) ||
      interaction.member.roles.cache.has(SUPERVISORY_ROLE_ID);

    if (!hasAccess) {
      return interaction.reply({ content: "<a:loading:1506059355227947181> You're not allowed to use this.", flags: 64 });
    }

    let infraction = null;
    if (interaction.client.database?.isConnected()) {
      infraction = await Infraction.findOne({ infractionId }).catch(() => null);
      if (action === "void" && infraction?.voided) {
        return interaction.reply({ content: "<a:loading:1506059355227947181> This infraction has already been voided.", flags: 64 });
      }
    }

    if (action === "void") {
      const modal = new ModalBuilder()
        .setCustomId(`infraction_reason_${infractionId}`)
        .setTitle("Void Infraction")
        .addComponents(
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId("reason")
              .setLabel("Reason for voiding")
              .setStyle(TextInputStyle.Short)
              .setRequired(true)
          )
        );

      return interaction.showModal(modal);
    }

    if (action === "editstatement") {
      const modal = new ModalBuilder()
        .setCustomId(`infraction_editstatement_${infractionId}`)
        .setTitle("Edit Statement")
        .addComponents(
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId("statement")
              .setLabel("New statement")
              .setStyle(TextInputStyle.Paragraph)
              .setValue(infraction?.statement ?? "")
              .setRequired(true)
          )
        );

      return interaction.showModal(modal);
    }
  },
};
