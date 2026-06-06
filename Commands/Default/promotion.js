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
                    content: `# <:HCSO:1509640458379464957> Deputy Promotion\n\n-# <@${target.id}>\nGiven your past dedication, hard work, and commitment, we've decided to honor you by promoting you. Keep up the amazing hard work you've committed to.\n\n**<:stats:1508597506001604740> New Rank:** <@&${rank.id}>\n**<:clipboard:1508597608505937940> Reason:** ${reason}`,
                  },
                ],
                accessory: {
                  type: 11,
                  media: {
                    url: "hhttps://media.discordapp.net/attachments/1510013734591004802/1510013826886795436/New_Project.png?ex=6a2528b7&is=6a23d737&hm=e875e7a90570d7718de35ca3871762d89e38c976cbaca792ebf857a78b1a526c&=&format=webp&quality=lossless&width=4080&height=146",
                  },
                },
              },
              {
                type: 12,
                items: [
                  {
                    media: {
                      url: "https://images-ext-1.discordapp.net/external/nH_sA5u_4cndYP4RamxRNzfi_d_GG_kms2kqzUX6KiE/%3Fsize%3D512/https/cdn.discordapp.com/icons/1443780884527448125/e7308f678c38c55a50757b7c7a8bc962.png?format=webp&quality=lossless&width=358&height=358",
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
    });

    try {
      const member = await interaction.guild.members.fetch(target.id);
      await member.roles.add(rank.id);
    } catch {}

    await interaction.editReply({ content: `<a:loading:1506059355227947181> Successfully promoted <@${target.id}> to **${rank.name}**.` });
  },
};
