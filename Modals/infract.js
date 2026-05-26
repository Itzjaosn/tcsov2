const Infraction = require("../Database/Models/Infraction/infraction");
const { buildInfractionEmbed } = require("../Utils/InfractionEmbed");

const INFRACTION_LOG_CHANNEL_ID = "1470972970947186873";

module.exports = {
  customID: "infract",
  execute: async function (interaction, client, args) {
    if (args?.[0] !== "modal") return;

    const targetId = args[1];
    if (!targetId) return;

    await interaction.deferReply({ flags: 64 });

    const statement  = interaction.fields.getTextInputValue("statement");
    const punishment = interaction.fields.getTextInputValue("punishment");
    const timestamp  = Math.floor(Date.now() / 1000);

    let target;
    try {
      target = await interaction.client.users.fetch(targetId);
    } catch {
      return interaction.editReply({ content: "Could not find that user." });
    }

    let infractionNum = 1;
    if (interaction.client.database?.isConnected()) {
      const count = await Infraction.countDocuments({ guildId: interaction.guildId }).catch(() => 0);
      infractionNum = count + 1;
    }

    const paddedId     = String(infractionNum).padStart(3, "0");
    const targetMention = `<@${target.id}>`;

    const logChannel = interaction.client.channels.cache.get(INFRACTION_LOG_CHANNEL_ID);
    const sentMsg = await (logChannel ?? interaction.channel).send(
      buildInfractionEmbed({
        targetMention,
        issuerName: interaction.user.username,
        statement,
        punishment,
        paddedId,
        timestamp,
      })
    );

    if (interaction.client.database?.isConnected()) {
      await new Infraction({
        infractionId: paddedId,
        guildId:      interaction.guildId,
        targetId:     target.id,
        targetTag:    target.username,
        issuedById:   interaction.user.id,
        issuedByTag:  interaction.user.username,
        statement,
        punishment,
        timestamp,
        messageId:    sentMsg.id,
        channelId:    sentMsg.channelId,
      }).save().catch(() => {});
    }

    await interaction.editReply({ content: "<:technical:1472674913054888181> infraction has been sent." });
  },
};
