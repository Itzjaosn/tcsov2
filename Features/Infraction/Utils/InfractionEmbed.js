const BANNER_URL = "https://media.discordapp.net/attachments/1470972888747343956/1510012319021797528/HCSO_Banner_1.png?ex=6a25274f&is=6a23d5cf&hm=554e8da908c035013cb501bf0cc33ac1004023e00ab30b4210222dc3654a75ae&=&format=webp&quality=lossless&width=4080&height=1360";

function buildInfractionEmbed({ targetMention, issuerName, statement, punishment, paddedId, timestamp, voidedBy = null, voidReason = null }) {
  const isVoided = voidedBy !== null;
  const footer = isVoided
    ? `-# This infraction has been voided by ${voidedBy}. \`${voidReason}\``
    : `-# This infraction was given by ${issuerName} with the punishment of a **${punishment}.**`;

  return {
    flags: 32768,
    components: [
      {
        type: 17,
        components: [
          { type: 12, items: [{ media: { url: BANNER_URL } }] },
          { type: 14, divider: true, spacing: 1 },
          {
            type: 10,
            content: `<:dot:1496186898643681351> **User**\n${targetMention}\n<:dot:1496186898643681351> **Issued**\n<t:${timestamp}:D>\n<:dot:1496186898643681351> **Statement**\n${statement}`,
          },
          { type: 10, content: footer },
          { type: 14, divider: true, spacing: 2 },
          {
            type: 1,
            components: [
              { type: 2, style: 2, label: `ID: ${paddedId}`, disabled: true, custom_id: `infraction_id_${paddedId}` },
              { type: 2, style: 4, label: "Void", custom_id: `infraction_void_${paddedId}`, disabled: isVoided },
            ],
          },
        ],
      },
    ],
  };
}

module.exports = { buildInfractionEmbed };
