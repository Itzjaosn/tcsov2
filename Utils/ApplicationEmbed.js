const TOP_BANNER    = "https://scnx-cdn.scootkit.net/1776352008370-guild-1wtgUFHbymVXQcYHLmEhIUn6pJ6FYZvKhcTnNqO00UDHtagE.png";
const BOTTOM_BANNER = "https://scnx-cdn.scootkit.net/1776266196390-guild-LjjdP0ksIIUvwqxpgWIOBv4DH2hfOeD9eBwivv5nNEy19dDS.png";

const HIGH_COMMAND_ROLE_ID = "1470972691287638149";

const QUESTIONS = [
  "Do you have any law enforcement experience (IRL or ERLC)?",
  "What does a law enforcement officer mean to you?",
  "Why do you wish to join the **Tarrant County Sheriff's Office**?",
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
        accent_color: accentColor,
        components: [
          { type: 10, content: `@here | <@&${HIGH_COMMAND_ROLE_ID}>` },
          { type: 12, items: [{ media: { url: TOP_BANNER } }] },
          { type: 14, divider: true, spacing: 2 },
          { type: 10, content: `##    <:TCSO_Logo:1480462877382148290> Tarrant County Sheriff's Office | New Application` },
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
          { type: 10, content: `##    <:TCSO_Logo:1480462877382148290> Application Accepted` },
          {
            type: 10,
            content: `Congrats and welcome to the **Tarrant County Sheriff's Office!!** We are thrilled to have you here. Any questions in regards to your training/ride along can be answered in support.\n\n**Application Comments**\n\`\`\`${comment}\`\`\``,
          },
          { type: 12, items: [{ media: { url: BOTTOM_BANNER } }] },
        ],
      },
    ],
  };
}

module.exports = { buildApplicationEmbed, buildResultsEmbed };
