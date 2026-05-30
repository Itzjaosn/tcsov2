const { PermissionFlagsBits } = require("discord.js");

const TOP_BANNER    = "https://scnx-cdn.scootkit.net/1776352008370-guild-1wtgUFHbymVXQcYHLmEhIUn6pJ6FYZvKhcTnNqO00UDHtagE.png";
const BOTTOM_BANNER = "https://scnx-cdn.scootkit.net/1776266196390-guild-LjjdP0ksIIUvwqxpgWIOBv4DH2hfOeD9eBwivv5nNEy19dDS.png";

module.exports = {
  name: "panel",
  description: "Post server panels",
  execute: async function (message, client, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return message.reply({ content: "<a:loading:1506059355227947181> You don't have permission to use this command." });
    }

    const sub = args[0]?.toLowerCase();

    if (sub !== "apply") {
      return message.reply({ content: "Usage: `.panel apply`" });
    }

    await message.delete().catch(() => null);

    await message.channel.send({
      flags: 32768,
      components: [
        {
          type: 17,
          accent_color: null,
          components: [
            { type: 12, items: [{ media: { url: TOP_BANNER } }] },
            { type: 14, divider: true, spacing: 2 },
            {
              type: 10,
              content: "##    <:HCSO:1509640458379464957> Harris County Sheriff's Office Entry Application",
            },
            { type: 14, divider: true, spacing: 2 },
            {
              type: 10,
              content: "> *Welcome to the <:HCSO:1509640458379464957> **Harris County Sheriff's Office**. Here we strive with professionalism, good administration, and activity. When you join the department, you will see some of the best roleplay experiences that we offer here. During this application, we expect you to fill out all responses with the best of your ability. If you don't understand something, go to the next question. We hope that you pass this application and get into the department. See you soon!*\n\n**`Department Requirements`** \n> - Must be 13+ years of age \n> - Must have LEO experience \n> - Must be professional \n> - Must use Grammar",
            },
            { type: 14, divider: true, spacing: 2 },
            {
              type: 1,
              components: [{
                type: 2,
                style: 4,
                label: "Apply",
                custom_id: "apply",
              }],
            },
            { type: 12, items: [{ media: { url: BOTTOM_BANNER } }] },
          ],
        },
      ],
    });
  },
};
