const BANNER_URL = "https://images-ext-1.discordapp.net/external/v428gQbn5YD4sY3bgrKbTew1mb8g7rfj-IQByJZDBj4/https/scnx-cdn.scootkit.net/1776352008370-guild-1wtgUFHbymVXQcYHLmEhIUn6pJ6FYZvKhcTnNqO00UDHtagE.png?format=webp&quality=lossless&width=1860&height=431";

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
          {
            type: 10,
            content: `\n\n ${targetMention}.`,
          },
          { type: 14, spacing: 1 },
          {
            type: 10,
            content: `<:alert:1472674963080216809> **User**\n${targetMention}\n<:dot:1496186898643681351> **Issued**\n<t:${timestamp}:D>\n<:folder:1497254635902341170> **Statement**\n${statement}`,
          },
          { type: 10, content: footer },
          { type: 14, spacing: 2 },
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
