const Infraction = require("../Database/Models/Infraction/infraction");
const Promotion  = require("../Database/Models/Promotion/promotion");
const { buildInfractionEmbed } = require("../Features/Infraction/Utils/InfractionEmbed");
const { buildPromotionEmbed }  = require("../Features/Promotion/Utils/PromotionEmbed");

const HIGH_COMMAND_ROLE_ID = "1470972691287638149";
const SUPERVISORY_ROLE_ID  = "1470972695188344883";

module.exports = {
  name: "migrate",
  description: "Re-edit all stored embeds to the current layout",
  async execute(message, client, args) {
    const hasAccess =
      message.member?.roles.cache.has(HIGH_COMMAND_ROLE_ID) ||
      message.member?.roles.cache.has(SUPERVISORY_ROLE_ID);

    if (!hasAccess) {
      return message.reply("You're not allowed to use this command.");
    }

    if (!client.database?.isConnected()) {
      return message.reply("Database is not connected.");
    }

    const sub = args[0]?.toLowerCase();

    if (sub === "infractions") {
      const status = await message.reply("Migrating infractions...");
      const infractions = await Infraction.find({ guildId: message.guildId }).catch(() => []);
      let updated = 0, failed = 0;

      for (const infraction of infractions) {
        if (!infraction.channelId || !infraction.messageId) { failed++; continue; }
        try {
          const channel = await client.channels.fetch(infraction.channelId);
          const msg     = await channel.messages.fetch(infraction.messageId);
          await msg.edit(
            buildInfractionEmbed({
              targetMention: `<@${infraction.targetId}>`,
              issuerName:    infraction.issuedByTag,
              statement:     infraction.statement,
              punishment:    infraction.punishment,
              paddedId:      infraction.infractionId,
              timestamp:     infraction.timestamp,
              voidedBy:      infraction.voided ? `<@${infraction.voidedById}>` : null,
              voidReason:    infraction.voidReason ?? null,
            })
          );
          updated++;
        } catch {
          failed++;
        }
      }

      return status.edit(`Done. **${updated}** updated, **${failed}** skipped/failed.`);
    }

    if (sub === "promotions") {
      const status = await message.reply("Migrating promotions...");
      const promotions = await Promotion.find({ guildId: message.guildId }).catch(() => []);
      let updated = 0, failed = 0;

      for (const promotion of promotions) {
        if (!promotion.channelId || !promotion.messageId) { failed++; continue; }
        try {
          const channel = await client.channels.fetch(promotion.channelId);
          const msg     = await channel.messages.fetch(promotion.messageId);
          await msg.edit(
            buildPromotionEmbed({
              targetId: promotion.targetId,
              rankId:   promotion.rankId,
              reason:   promotion.reason,
            })
          );
          updated++;
        } catch {
          failed++;
        }
      }

      return status.edit(`Done. **${updated}** updated, **${failed}** skipped/failed.`);
    }

    return message.reply("Usage: `-migrate infractions` or `-migrate promotions`");
  },
};
