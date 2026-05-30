const { SlashCommandBuilder } = require("@discordjs/builders");
const { Routes, MessageFlags } = require("discord.js");

const RA_REQUEST_CHANNEL_ID = "1502275758364688485";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ra")
    .setDescription("Ride Along commands")
    .addSubcommand((sub) =>
      sub.setName("request").setDescription("Submit a ride along request")
    ),
  execute: async function (interaction, client) {
    const subcommand = interaction.options.getSubcommand();
    if (subcommand !== "request") return;

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const message = await client.rest.post(Routes.channelMessages(RA_REQUEST_CHANNEL_ID), {
      body: {
        flags: 32768,
        components: [
          {
            type: 17,
            components: [
              {
                type: 10,
                content: `# <:HCSO:1509640458379464957> Ride Along Request\n-# <@&1470972695188344883>\n- <@${interaction.user.id}> has requested to get a **ride along** complete by a field supervisor. Click the complete button once the RA is complete.`,
              },
              {
                type: 1,
                components: [
                  {
                    type: 2,
                    style: 1,
                    label: "Complete",
                    custom_id: `racomplete_${interaction.user.id}`,
                  },
                ],
              },
              {
                type: 12,
                items: [
                  {
                    media: {
                      url: "https://media.discordapp.net/attachments/1470972888747343956/1507444850025304317/tcso_footer.png?ex=6a11eceb&is=6a109b6b&hm=f489d3c142b5fb42d581e88fa193a1a7055826a8dc00764099cd4052a0ab698d&=&format=webp&quality=lossless",
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
    });

    const thread = await client.rest.post(Routes.threads(RA_REQUEST_CHANNEL_ID, message.id), {
      body: { name: `RA — ${interaction.user.username}` },
    });

    await client.rest.post(Routes.channelMessages(thread.id), {
      body: { content: "A supervisor will take this ride along, and discuss how you're preforming here." },
    });

    await interaction.editReply({ content: "<a:loading:1506059355227947181> Your ride along request has been submitted." });
  },
};
