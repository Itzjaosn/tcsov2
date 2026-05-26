const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  dev: true,
  owner: true, 

  guilds: ["123456789012345678"],
  channels: ["123456789012345678"],
  roles: ["123456789012345678"],
  users: ["123456789012345678"],

  cooldown: 5, // cooldown in seconds

  userPerms: ["ManageGuild"], 
  botPerms: ["Administrator"], 

  data: new SlashCommandBuilder()
    .setName("restricted")
    .setDescription("A restricted command")
    .addStringOption((x) =>
      x
        .setName("input")
        .setDescription("The input to echo back")
        .setRequired(true)
    ),
  async execute(interaction) {
    const input = interaction.options.getString("input");
    await interaction.reply(`You provided: ${input}`);
  },
};
