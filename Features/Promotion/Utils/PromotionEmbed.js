const BANNER_URL = "https://media.discordapp.net/attachments/1510013734591004802/1510013826886795436/New_Project.png?ex=6a25d177&is=6a247ff7&hm=8e469e993563e894308e8c0e49f8b36cb3674ffd8041f790c8ccc0ffff3e19f6&=&format=webp&quality=lossless&width=4080&height=146";

function buildPromotionEmbed({ targetId, rankId, reason }) {
  return {
    flags: 32768,
    allowed_mentions: { parse: [] },
    components: [
      {
        type: 17,
        components: [
          {
            type: 10,
            content: `# <:HCSO:1509640458379464957> Deputy Promotion\n\n-# <@${targetId}>\nGiven your past dedication, hard work, and commitment, we've decided to honor you by promoting you. Keep up the amazing hard work you've committed to.\n\n**<:dot:1496186898643681351> New Rank:** <@&${rankId}>\n**<:dot:1496186898643681351> Reason:** ${reason}`,
          },
          {
            type: 12,
            items: [{ media: { url: BANNER_URL } }],
          },
        ],
      },
    ],
  };
}

module.exports = { buildPromotionEmbed };
