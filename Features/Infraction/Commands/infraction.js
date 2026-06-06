const {
  SlashCommandBuilder,
  ModalBuilder,
  ActionRowBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("infract")
    .setDescription("Issue an infraction to a deputy")
    .addUserOption(opt =>
      opt.setName("user")
        .setDescription("deputy you're punishing")
        .setRequired(true)
    ),
  execute: async function (interaction, client) {
    const HIGH_COMMAND_ROLE_ID = "1470972691287638149";
    const SUPERVISORY_ROLE_ID  = "1470972695188344883";

    const hasAccess =
      interaction.member.roles.cache.has(HIGH_COMMAND_ROLE_ID) ||
      interaction.member.roles.cache.has(SUPERVISORY_ROLE_ID);

    if (!hasAccess) {
      return interaction.reply({ content: "<a:loading:1506059355227947181> You're not allowed to use this command.", flags: 64 });
    }

    const target = interaction.options.getUser("user");

    const modal = new ModalBuilder()
      .setCustomId(`infract_modal_${target.id}`)
      .setTitle("Issue Infraction")
      .addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("statement")
            .setLabel("Statement")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("punishment")
            .setLabel("Punishment")
            .setPlaceholder("E.g., Warning, Suspension, Termination, etc.")
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
        )
      );

    await interaction.showModal(modal);
  },
};
