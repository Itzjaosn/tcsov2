const { SlashCommandBuilder } = require("@discordjs/builders");
const { Routes, MessageFlags } = require("discord.js");
const Promotion = require("../../Database/Models/Promotion/promotion");
const { buildPromotionEmbed } = require("../../Features/Promotion/Utils/PromotionEmbed");

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
    const timestamp = Math.floor(Date.now() / 1000);

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const sentMsg = await client.rest.post(Routes.channelMessages(PROMOTION_CHANNEL_ID), {
      body: buildPromotionEmbed({ targetId: target.id, rankId: rank.id, reason }),
    });

    if (client.database?.isConnected()) {
      await new Promotion({
        guildId:    interaction.guildId,
        targetId:   target.id,
        targetTag:  target.username,
        issuedById: interaction.user.id,
        issuedByTag: interaction.user.username,
        rankId:     rank.id,
        rankName:   rank.name,
        reason,
        messageId:  sentMsg.id,
        channelId:  PROMOTION_CHANNEL_ID,
        timestamp,
      }).save().catch(() => {});
    }

    try {
      const member = await interaction.guild.members.fetch(target.id);
      await member.roles.add(rank.id);
    } catch {}

    await interaction.editReply({ content: `<a:loading:1506059355227947181> Successfully promoted <@${target.id}> to **${rank.name}**.` });
  },
};
