const WELCOME_CHANNEL_ID = "1470972949715619962";
const WELCOME_ROLE_ID    = "1470972765623292085";
const APPLY_URL          = "https://discord.com/channels/1443780884527448125/1503412186482217162";

module.exports = {
  name: "guildMemberAdd",
  execute: async function (client, member) {
    const memberCount = member.guild.memberCount;

    const channel = client.channels.cache.get(WELCOME_CHANNEL_ID);
    if (channel) {
      await channel.send({
        flags: 32768,
        components: [
          {
            type: 10,
            content: `Welcome <@${member.id}> to the <:HCSO:1509640458379464957> **Harris County Sheriff's Office**`,
          },
          {
            type: 1,
            components: [
              {
                type: 2,
                style: 2,
                label: String(memberCount),
                custom_id: `welcome_count_${member.id}`,
                disabled: true,
              },
              {
                type: 2,
                style: 5,
                label: "Apply",
                url: APPLY_URL,
              },
            ],
          },
        ],
      }).catch(() => {});
    }

    await member.roles.add(WELCOME_ROLE_ID).catch(() => {});
  },
};
