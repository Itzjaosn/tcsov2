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
                      url: "https://media.discordapp.net/attachments/1510013734591004802/1510013826886795436/New_Project.png?ex=6a1c96f7&is=6a1b4577&hm=29b84ec57eda9e1feef50f7f0074c97f73165010960a8b7a1e3103bf20a0d758&=&format=webp&quality=lossless&width=3744&height=134",
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
