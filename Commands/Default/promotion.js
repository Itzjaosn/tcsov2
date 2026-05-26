const { SlashCommandBuilder } = require("@discordjs/builders");
const { Routes, MessageFlags } = require("discord.js");

const PROMOTION_CHANNEL_ID = "1470972970162716765";
const HIGH_COMMAND_ROLE_ID = "1470972691287638149";
const SUPERVISORY_ROLE_ID  = "1470972695188344883";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("promote")
    .setDescription("Promote a deputy")
    .addUserOption(opt =>
      opt.setName("user")
        .setDescription("The deputy being promoted")
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName("reason")
        .setDescription("Reason for the promotion")
        .setRequired(true)
    )
    .addRoleOption(opt =>
      opt.setName("rank")
        .setDescription("The new rank/role being given")
        .setRequired(true)
    ),
  execute: async function (interaction, client) {
    const hasAccess =
      interaction.member.roles.cache.has(HIGH_COMMAND_ROLE_ID) ||
      interaction.member.roles.cache.has(SUPERVISORY_ROLE_ID);

    if (!hasAccess) {
      return interaction.reply({ content: "<a:loading:1506059355227947181> You're not allowed to use this command.", flags: MessageFlags.Ephemeral });
    }

    const target = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason");
    const rank   = interaction.options.getRole("rank");

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    await client.rest.post(Routes.channelMessages(PROMOTION_CHANNEL_ID), {
      body: {
        flags: 32768,
        allowed_mentions: { parse: [] },
        components: [
          {
            type: 17,
            components: [
              {
                type: 9,
                components: [
                  {
                    type: 10,
                    content: `# <:TCSO_Logo:1480462877382148290> Deputy Promotion\n\n-# <@${target.id}>\nGiven your past dedication, hard work, and commitment, we've decided to honor you by promoting you. Keep up the amazing hard work you've committed to.\n\n**<:stats:1508597506001604740> New Rank:** <@&${rank.id}>\n**<:clipboard:1508597608505937940> Reason:** ${reason}`,
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
                      url: "https://images-ext-1.discordapp.net/external/ottJy5VsNYBLqpCxmEY3CvsDkS7QMPZWDkXxT3A7WeI/%3Fformat%3Dwebp%26quality%3Dlossless/https/images-ext-1.discordapp.net/external/MzIksgwnY_eQTOsW8oVYHRd8gjdTpYHoLGuCDtw5p9o/https/scnx-cdn.scootkit.net/1776266196390-guild-LjjdP0ksIIUvwqxpgWIOBv4DH2hfOeD9eBwivv5nNEy19dDS.png?format=webp&quality=lossless",
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
    });

    await interaction.editReply({ content: `<a:loading:1506059355227947181> Successfully promoted <@${target.id}> to **${rank.name}**.` });
  },
};
