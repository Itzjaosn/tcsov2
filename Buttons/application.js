const {
  ModalBuilder,
  ActionRowBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");
const Application = require("../Database/Models/Application/application");
const { buildApplicationEmbed } = require("../Utils/ApplicationEmbed");

const HIGH_COMMAND_ROLE_ID = "1470972691287638149";
const SUPERVISORY_ROLE_ID  = "1470972695188344883";

module.exports = {
  customID: "application",
  execute: async function (interaction, client, args) {
    const action = args?.[0];
    const appId  = args?.[1];

    if (action !== "approve" && action !== "decline") return;

    const hasAccess =
      interaction.member.roles.cache.has(HIGH_COMMAND_ROLE_ID) ||
      interaction.member.roles.cache.has(SUPERVISORY_ROLE_ID);

    if (!hasAccess) {
      return interaction.reply({ content: "<a:loading:1506059355227947181> You're not allowed to use this button.", flags: 64 });
    }

    if (!interaction.client.database?.isConnected()) {
      return interaction.reply({ content: "<a:loading:1506059355227947181> Database is unavailable. Please try again later.", flags: 64 });
    }

    const app = await Application.findById(appId).catch(() => null);
    if (!app) {
      return interaction.reply({ content: "<a:loading:1506059355227947181> Application not found.", flags: 64 });
    }

    if (app.status !== "pending") {
      return interaction.reply({ content: "<a:loading:1506059355227947181> This application has already been reviewed.", flags: 64 });
    }

    if (action === "approve") {
      const modal = new ModalBuilder()
        .setCustomId(`applicationapprove_${appId}`)
        .setTitle("Approve Application")
        .addComponents(
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId("comment")
              .setLabel("Application comments")
              .setStyle(TextInputStyle.Paragraph)
              .setRequired(true)
          )
        );

      return interaction.showModal(modal);
    }

    if (action === "decline") {
      const modal = new ModalBuilder()
        .setCustomId(`applicationdecline_${appId}`)
        .setTitle("Decline Application")
        .addComponents(
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId("reason")
              .setLabel("Reason for declining")
              .setStyle(TextInputStyle.Paragraph)
              .setRequired(true)
          )
        );

      return interaction.showModal(modal);
    }
  },
};
