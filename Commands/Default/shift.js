const { SlashCommandBuilder } = require("@discordjs/builders");
const { Routes, MessageFlags, PermissionFlagsBits } = require("discord.js");

const SHIFT_CHANNEL_ID = "1470972967809712192";
const HIGH_COMMAND_ROLE_ID = "1470972691287638149";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("mass")
    .setDescription("Mass commands")
    .addSubcommand((sub) =>
      sub.setName("shift").setDescription("Mass shift announcement")
    ),
  execute: async function (interaction, client) {
    const subcommand = interaction.options.getSubcommand();
    if (subcommand !== "shift") return;

    const hasAccess =
      interaction.member.permissions.has(PermissionFlagsBits.Administrator) ||
      interaction.member.roles.cache.has(HIGH_COMMAND_ROLE_ID);

    if (!hasAccess) {
      return interaction.reply({
        content: "<a:loading:1506059355227947181> You don't have permission to use this command.",
        flags: MessageFlags.Ephemeral,
      });
    }

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    await client.rest.post(Routes.channelMessages(SHIFT_CHANNEL_ID), {
      body: {
        flags: 32768,
        components: [
          {
            type: 17,
            components: [
              {
                type: 9,
                components: [
                  {
                    type: 10,
                    content: "# Department Shift\n-# <@&1470972706332606612>\n- We are hosting a shift for the <:TCSO_Logo:1480462877382148290> **Tarrant County Sheriff's Office**. Our high command team is expecting you to attening our shift. As always, thank you for your support within TCSO.",
                  },
                ],
                accessory: {
                  type: 11,
                  media: {
                    url: "https://images-ext-1.discordapp.net/external/4d0soQge718gFmgHn8Im8p8CDLnuO3PMoHWxItWef0g/%3Fsize%3D1024/https/cdn.discordapp.com/icons/1443780884527448125/5821d50eacec1d96eb7e32d9ce9ef44a.png?format=webp&quality=lossless",
                  },
                },
              },
              {
                type: 12,
                items: [
                  {
                    media: {
                      url: "https://images-ext-1.discordapp.net/external/MzIksgwnY_eQTOsW8oVYHRd8gjdTpYHoLGuCDtw5p9o/https/scnx-cdn.scootkit.net/1776266196390-guild-LjjdP0ksIIUvwqxpgWIOBv4DH2hfOeD9eBwivv5nNEy19dDS.png?format=webp&quality=lossless",
                    },
                  },
                ],
              },
              {
                type: 1,
                components: [
                  {
                    type: 2,
                    style: 1,
                    label: "Attend",
                    custom_id: "shiftAttend",
                  },
                  {
                    type: 2,
                    style: 2,
                    label: "Attending",
                    custom_id: "shiftAttending",
                  },
                ],
              },
            ],
          },
        ],
      },
    });

    await interaction.editReply({ content: "<a:loading:1506059355227947181> Mass shift sent." });
  },
};
