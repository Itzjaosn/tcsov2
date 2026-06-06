const { SlashCommandBuilder } = require("discord.js");
const Infraction = require("../../../Database/Models/Infraction/infraction");

const HIGH_COMMAND_ROLE_ID = "1470972691287638149";
const SUPERVISORY_ROLE_ID  = "1470972695188344883";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("infraction")
    .setDescription("Manage infractions")
    .addSubcommand(sub =>
      sub.setName("manage")
        .setDescription("Manage an existing infraction")
        .addStringOption(opt =>
          opt.setName("id")
            .setDescription("The infraction case ID (e.g. 001)")
            .setRequired(true)
        )
    ),
  execute: async function (interaction, client) {
    const hasAccess =
      interaction.member.roles.cache.has(HIGH_COMMAND_ROLE_ID) ||
      interaction.member.roles.cache.has(SUPERVISORY_ROLE_ID);

    if (!hasAccess) {
      return interaction.reply({ content: "<a:loading:1506059355227947181> You're not allowed to use this command.", flags: 64 });
    }

    const rawId = interaction.options.getString("id");
    const paddedId = rawId.padStart(3, "0");

    let infraction = null;
    if (interaction.client.database?.isConnected()) {
      infraction = await Infraction.findOne({ infractionId: paddedId }).catch(() => null);
    }

    if (!infraction) {
      return interaction.reply({ content: `<a:loading:1506059355227947181> No infraction found with case ID \`${paddedId}\`.`, flags: 64 });
    }

    const isVoided = infraction.voided;

    return interaction.reply({
      flags: 32768 | 64,
      components: [
        {
          type: 17,
          components: [
            {
              type: 10,
              content: `-# Infraction Manage Panel`,
            },
            {
              type: 10,
              content: `<:dot:1496186898643681351> **User:** <@${infraction.targetId}>\n<:dot:1496186898643681351> **Statement:** ${infraction.statement}\n<:dot:1496186898643681351> **Punishment:** ${infraction.punishment}${isVoided ? `\n\n-# <:movetofolder:1497254662896615436> This infraction has been voided.` : ""}`,
            },
            {
              type: 1,
              components: [
                {
                  type: 3,
                  custom_id: `infraction_${paddedId}`,
                  placeholder: "Infraction panel options",
                  disabled: isVoided,
                  options: [
                    {
                      label: "Void Infraction",
                      value: "void",
                      description: "Void this infraction with a reason",
                    },
                    {
                      label: "Edit Statement",
                      value: "editstatement",
                      description: "Edit the infraction statement",
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });
  },
};
