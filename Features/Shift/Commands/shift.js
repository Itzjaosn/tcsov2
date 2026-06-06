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
                    content: "# Department Shift\n-# <@&1470972706332606612>\n- We are hosting a shift for the\<:HCSO:1509640458379464957> **Harris County Sheriff's Office**. Our high command team is expecting you to attening our shift. As always, thank you for your support within TCSO.",
                  },
                ],
                accessory: {
                  type: 11,
                  media: {
                    url: "https://media.discordapp.net/attachments/1470972888747343956/1510012319021797528/HCSO_Banner_1.png?ex=6a1c958f&is=6a1b440f&hm=b1d8fe0a6d0799b6cc768e881a297b1808cd2a6f2956c07c741c402625658261&=&format=webp&quality=lossless&width=3744&height=1248",
                  },
                },
              },
              {
                type: 12,
                items: [
                  {
                    media: {
                      url: "https://media.discordapp.net/attachments/1510013734591004802/1510013826886795436/New_Project.png?ex=6a1c96f7&is=6a1b4577&hm=29b84ec57eda9e1feef50f7f0074c97f73165010960a8b7a1e3103bf20a0d758&=&format=webp&quality=lossless&width=3744&height=134",
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
