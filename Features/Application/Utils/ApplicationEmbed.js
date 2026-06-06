const TOP_BANNER    = "https://media.discordapp.net/attachments/1470972888747343956/1510012319021797528/HCSO_Banner_1.png?ex=6a1d3e4f&is=6a1beccf&hm=224ff516ba78d9a01b32a3d7f20344db029b4df170190f54e255098a0d25e2d0&=&format=webp&quality=lossless&width=3744&height=1248";
const BOTTOM_BANNER = "https://media.discordapp.net/attachments/1510013734591004802/1510013826886795436/New_Project.png?ex=6a1d3fb7&is=6a1bee37&hm=88d719c08e29dc5c342d11f4bb83412e7fdf61d1ae664670a066c77820771a40&=&format=webp&quality=lossless&width=3744&height=134";

const HIGH_COMMAND_ROLE_ID = "1470972691287638149";

const QUESTIONS = [
  "Do you have any law enforcement experience (IRL or ERLC)?",
  "What does a law enforcement officer mean to you?",
  "Why do you wish to join the **Harris County Sheriff's Office**?",
  "You're on a traffic stop, and a suspect decides to be very uncompliant. What steps do you take to de-escalate the situation?",
  "What are some pro's and con's about yourself?",
];

function buildApplicationEmbed({ appId, answers, status = "pending", declineReason = null }) {
  const accentColor = status === "approved" ? 0x00FF00 : status === "declined" ? 0xFF0000 : null;
  const isResolved  = status !== "pending";

  const qaComponents = QUESTIONS.map((q, i) => ({
    type: 10,
    content: `**Question${i + 1}:** ${q}\n- Answer: \`${answers[i] ?? ""}\``,
  }));

  const statusComponent = status === "approved"
    ? [{ type: 10, content: "-# Approved" }]
    : status === "declined" && declineReason
    ? [{ type: 10, content: `-# Denied: ${declineReason}` }]
    : [];

  return {
    flags: 32768,
    components: [
      {
        type: 17,
        accent_color: null,
        components: [
          { type: 10, content: `@here | <@&${HIGH_COMMAND_ROLE_ID}>` },
          { type: 12, items: [{ media: { url: TOP_BANNER } }] },
          { type: 14, divider: true, spacing: 2 },
          { type: 10, content: `##    <:HCSO:1509640458379464957> Harris County Sheriff's Office | New Application` },
          { type: 14, divider: true, spacing: 2 },
          ...qaComponents,
          { type: 14, divider: true, spacing: 2 },
          {
            type: 1,
            components: [
              {
                type: 2,
                style: 1,
                label: "Approve",
                custom_id: `application_approve_${appId}`,
                disabled: isResolved,
              },
              {
                type: 2,
                style: 1,
                label: "Decline",
                custom_id: `application_decline_${appId}`,
                disabled: isResolved,
              },
            ],
          },
          ...statusComponent,
          { type: 12, items: [{ media: { url: BOTTOM_BANNER } }] },
        ],
      },
    ],
  };
}

function buildResultsEmbed({ userId, comment }) {
  return {
    flags: 32768,
    components: [
      {
        type: 17,
        accent_color: null,
        components: [
          { type: 10, content: `<@${userId}>` },
          { type: 12, items: [{ media: { url: TOP_BANNER } }] },
          { type: 14, divider: true, spacing: 1 },
          { type: 10, content: `##    <:HCSO:1509640458379464957> Application Accepted` },
          {
            type: 10,
            content: `Congrats and welcome to the **Harris County Sheriff's Office!!** We are thrilled to have you here. Any questions in regards to your training/ride along can be answered in support.\n\n**Application Comments**\n\`\`\`${comment}\`\`\``,
          },
          { type: 12, items: [{ media: { url: BOTTOM_BANNER } }] },
        ],
      },
    ],
  };
}

module.exports = { buildApplicationEmbed, buildResultsEmbed };
