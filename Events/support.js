const {
  PermissionFlagsBits,
  ChannelType,
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");
const crypto = require("crypto");

const Ticket = require("../Database/Models/Ticket/ticket");
const { COOKIE_API_KEY } = require("../config");

const SUPPORT_CATEGORY_ID        = "1470972904559738912";
const SUPPORT_ROLE_ID            = "1470972695188344883";
const COMMAND_ROLE_ID            = "1470972691287638149";
const OFFICE_OF_SHERIFF_ROLE_ID  = "1502788965671895160";

const BANNER_URL = "https://media.discordapp.net/attachments/1470972888747343956/1491044800391020705/CIV_OPS_2.png?ex=6a0cf96e&is=6a0ba7ee&hm=5be2fa81d0b2daafa1a5cbeff8bf87a60150094d18635c838268fe5d3241b30a&=&format=webp&quality=lossless&width=1730&height=576";
const FOOTER_URL = "https://scnx-cdn.scootkit.net/1776266196390-guild-LjjdP0ksIIUvwqxpgWIOBv4DH2hfOeD9eBwivv5nNEy19dDS.png";

const TRANSCRIPT_LOG_CHANNEL_ID = "1494366880620875777";

const SELECT_MENU_ID       = "ticket_type_select";
const MODAL_GENERAL_ID     = "modal_general";
const MODAL_HIGHCOMMAND_ID = "modal_command";
const BTN_CLAIM_ID         = "btn_claim";
const BTN_CLOSE_ID         = "btn_close";

const claimState = new Map(); // channelId → userId
const ticketData = new Map(); // channelId → { inquiry, userMention, pingRole, message }

function buildSupportPanel() {
  return {
    flags: 32768,
    components: [
      {
        type: 17,
        accent_color: 3692197,
        spoiler: false,
        components: [
          { type: 12, items: [{ media: { url: BANNER_URL }, spoiler: false }] },
          { type: 14, divider: true, spacing: 2 },
          { type: 10, content: "## <:HCSO:1509640458379464957> Harris County Sheriff's Office Assistance" },
          { type: 14, divider: true, spacing: 2 },
          { type: 10, content: "**<:support:1472674814153068544> General Support**\n* Discord Support \n* General Questions" },
          { type: 10, content: "**<:alert:1472674963080216809> Internal Affairs**\n* Deputy Reports\n* Infraction Appeals" },
          { type: 10, content: "**<:technical:1472674913054888181> High Command**\n* Major Concerns \n* Admin Reports" },
          { type: 14, divider: true, spacing: 2 },
          { type: 12, items: [{ media: { url: FOOTER_URL } }] },
          { type: 14 },
          {
            type: 1,
            components: [
              {
                type: 3,
                custom_id: SELECT_MENU_ID,
                placeholder: "Contact Support",
                min_values: 1,
                max_values: 1,
                options: [
                  { label: "General Support", value: "general",  description: "Support from the supervisory staff" },
                  { label: "High Command",     value: "command",  description: "Support from the command team" },
                ],
              },
            ],
          },
        ],
      },
    ],
  };
}

function buildTicketEmbed(userMention, inquiry, pingRoleId, claimLabel = "Claim") {
  return {
    flags: 32768,
    components: [
      {
        type: 17,
        accent_color: null,
        spoiler: false,
        components: [
          { type: 10, content: `${userMention} | <@&${pingRoleId}>` },
          { type: 12, items: [{ media: { url: BANNER_URL } }] },
          {
            type: 10,
            content: `\nThank you for contacting the superivosry staff here at the **<:HCSO:1509640458379464957> Harris County Sheriff's Office**\n\n**Inquiry**\n\`\`\`\n${inquiry}\n\`\`\`\n`,
          },
          { type: 14 },
          {
            type: 1,
            components: [
              { type: 2, style: 2, label: claimLabel, custom_id: BTN_CLAIM_ID },
              { type: 2, style: 4, label: "Close", custom_id: BTN_CLOSE_ID },
            ],
          },
        ],
      },
    ],
  };
}

function buildResolvedEmbed(resolverMention, reason = null) {
  const reasonLine = reason ? `\n> **Reason:** ${reason}` : "";
  return {
    flags: 32768,
    components: [
      {
        type: 17,
        components: [
          {
            type: 10,
            content: `<:technical:1472674913054888181> Ticket has been marked resolved by ${resolverMention}${reasonLine}\n> Ticket will close in **10 seconds...**`,
          },
        ],
      },
    ],
  };
}

function buildTranscriptLogEmbed(claimerMention, closerMention, inquiry, transcriptUrl) {
  return {
    flags: 32768,
    components: [
      {
        type: 17,
        components: [
          {
            type: 10,
            content: `# <:mail:1483865955108126831> Ticket Closed\nA member from the **Harris County Sheriff's** has closed your ticket.\n\n`,
          },
          { type: 14, divider: true, spacing: 2 },
          {
            type: 10,
            content: `**Claimed**\n${claimerMention}\n**Closed By:**\n${closerMention}\n**Inquiry**\n${inquiry || "No inquiry recorded"}\n`,
          },
          { type: 14, spacing: 2 },
          {
            type: 1,
            components: [
              { type: 2, style: 5, label: "Transcript", url: transcriptUrl },
            ],
          },
        ],
      },
    ],
  };
}

function buildCloseEmbed() {
  return {
    flags: 32768,
    components: [
      {
        type: 17,
        components: [
          {
            type: 10,
            content: `<:alert:1472674963080216809> Ticket tick has been marked **resolved**\n-# Transcript saving. Ticket will close in **5 secounds...**`,
          },
        ],
      },
    ],
  };
}

function buildModal(customId, title, inquiryPlaceholder) {
  return new ModalBuilder()
    .setCustomId(customId)
    .setTitle(title)
    .addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId("inquiry_text")
          .setLabel("Inquiry")
          .setPlaceholder(inquiryPlaceholder)
          .setStyle(TextInputStyle.Paragraph)
          .setMinLength(20)
          .setMaxLength(300)
          .setRequired(true)
      )
    );
}

const buildGeneralModal = () =>
  buildModal(MODAL_GENERAL_ID, "General Support", "Please provide details on questions for supervisors.");

const buildHighCommandModal = () =>
  buildModal(MODAL_HIGHCOMMAND_ID, "High Command Support", "Please provide details on your concerns for command staff.");

function buildSimple(content, ephemeral = false) {
  return {
    flags: ephemeral ? 32768 | 64 : 32768,
    components: [{ type: 17, components: [{ type: 10, content }] }],
  };
}

function hasSupport(member) {
  return member.roles.cache.has(SUPPORT_ROLE_ID);
}

async function createTicketChannel(guild, user, prefix) {
  const username = user.username.toLowerCase().replace(/[^a-z0-9]/g, "");
  return guild.channels.create({
    name: `${prefix}-${username}`,
    type: ChannelType.GuildText,
    parent: SUPPORT_CATEGORY_ID,
    permissionOverwrites: [
      { id: guild.roles.everyone, deny: [PermissionFlagsBits.ViewChannel] },
      {
        id: user.id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory,
        ],
      },
      {
        id: SUPPORT_ROLE_ID,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory,
          PermissionFlagsBits.ManageChannels,
        ],
      },
    ],
  });
}

async function saveAndPostTranscript(channel, closedByUser, client) {
  let ticket = null;
  if (client.database?.isConnected()) {
    ticket = await Ticket.findOne({ channelId: channel.id }).catch(() => null);
    if (ticket) {
      ticket.closedById  = closedByUser.id;
      ticket.closedByTag = closedByUser.username;
      ticket.status      = "closed";
      await ticket.save().catch(() => {});
    }
  }

  const apiKey = client.config.COOKIE_API_KEY || COOKIE_API_KEY;
  if (!apiKey) return;

  let transcriptUrl = null;
  try {
    const res = await fetch(
      `https://api.cookie-api.com/api/transcript?channel_id=${channel.id}`,
      {
        method:  "POST",
        headers: { "Content-Type": "application/json", "Authorization": apiKey },
        body:    JSON.stringify({ bot_token: client.config.TOKEN }),
      }
    );
    const data = await res.json();
    if (data.success) transcriptUrl = data.url;
  } catch {}

  if (!transcriptUrl) return;

  const logChannel = client.channels.cache.get(TRANSCRIPT_LOG_CHANNEL_ID);
  if (logChannel) {
    const claimerMention = ticket?.claimedById ? `<@${ticket.claimedById}>` : "Not claimed";
    const closerMention  = `<@${closedByUser.id}>`;
    await logChannel.send(
      buildTranscriptLogEmbed(claimerMention, closerMention, ticket?.inquiry ?? null, transcriptUrl)
    ).catch(() => {});
  }
}

async function handleSelectMenu(interaction) {
  const value = interaction.values[0];
  if (value === "general")  await interaction.showModal(buildGeneralModal());
  else if (value === "command") await interaction.showModal(buildHighCommandModal());
  await interaction.message.edit(buildSupportPanel()).catch(() => {});
}

async function handleModalSubmit(interaction, prefix, type) {
  await interaction.deferReply({ flags: 64 });
  const { guild, user } = interaction;
  const username = user.username.toLowerCase().replace(/[^a-z0-9]/g, "");

  const existing = guild.channels.cache.find(
    (c) => c.parentId === SUPPORT_CATEGORY_ID && c.name.endsWith(username)
  );
  if (existing) {
    return interaction.editReply(buildSimple(`You already have a ticket open: <#${existing.id}>`));
  }

  const inquiry = interaction.fields.getTextInputValue("inquiry_text");
  const channel = await createTicketChannel(guild, user, prefix);
  const pingRole = type === "command" ? COMMAND_ROLE_ID : SUPPORT_ROLE_ID;
  const userMention = `<@${user.id}>`;
  const ticketMsg = await channel.send(buildTicketEmbed(userMention, inquiry, pingRole));
  ticketData.set(channel.id, { inquiry, userMention, pingRole, message: ticketMsg });

  if (interaction.client.database?.isConnected()) {
    await new Ticket({
      ticketId:    crypto.randomBytes(6).toString("hex"),
      channelId:   channel.id,
      guildId:     guild.id,
      channelName: channel.name,
      type,
      inquiry,
      openedById:  user.id,
      openedByTag: user.username,
    }).save().catch(() => {});
  }

  await interaction.editReply(buildSimple(`You can check your ticket: <#${channel.id}>`));
}

async function handleClaimButton(interaction) {
  if (!hasSupport(interaction.member)) {
    return interaction.reply(buildSimple("You can't claim this ticket.", true));
  }

  const channelId = interaction.channel.id;
  const isClaimed = claimState.has(channelId);
  const data = ticketData.get(channelId);

  await interaction.deferUpdate();

  if (!isClaimed) {
    claimState.set(channelId, interaction.user.id);
    if (data) await data.message.edit(buildTicketEmbed(data.userMention, data.inquiry, data.pingRole, "Unclaim")).catch(() => {});
    await interaction.channel.send({ content: `<:alert:1472674963080216809> <@${interaction.user.id}> will be handling this ticket` });
  } else {
    claimState.delete(channelId);
    if (data) await data.message.edit(buildTicketEmbed(data.userMention, data.inquiry, data.pingRole, "Claim")).catch(() => {});
    await interaction.channel.send({ content: `<:alert:1472674963080216809> <@${interaction.user.id}> will no longer be handling this ticket.` });
  }
}

async function handleCloseButton(interaction) {
  if (!hasSupport(interaction.member)) {
    return interaction.reply(buildSimple("You can't close this ticket.", true));
  }
  await interaction.deferUpdate();
  claimState.delete(interaction.channel.id);
  ticketData.delete(interaction.channel.id);
  await interaction.channel.send({ content: `<:alert:1472674963080216809> Ticket tick has been marked **resolved**\n-# Transcript saving. Ticket will close in **5 secounds...**` });
  await saveAndPostTranscript(interaction.channel, interaction.user, interaction.client);
  setTimeout(async () => {
    try { await interaction.channel.delete("Ticket closed"); } catch {}
  }, 5_000);
}

async function handleMessage(message) {
  if (message.author.bot || !message.guild) return;

  const member  = message.member;
  const content = message.content.trim();

  if (content === ".panel") {
    if (!hasSupport(member) && !member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return message.reply(buildSimple("You don't have permission to post the support panel."));
    }
    await message.delete().catch(() => {});
    await message.channel.send(buildSupportPanel());
    return;
  }

  if (!hasSupport(member)) return;

  if (content === ".close" || content.startsWith(".close ")) {
    const reason = content.startsWith(".close ") ? content.slice(7).trim() : null;
    await message.delete().catch(() => {});
    claimState.delete(message.channel.id);
    ticketData.delete(message.channel.id);
    await saveAndPostTranscript(message.channel, message.author, message.client);
    await message.channel.send(buildResolvedEmbed(`<@${message.author.id}>`, reason));
    setTimeout(async () => {
      try { await message.channel.delete("Ticket closed by staff"); } catch {}
    }, 10_000);
    return;
  }

  if (content.startsWith(".rename ")) {
    const newName = content.slice(8).trim().toLowerCase().replace(/\s+/g, "-");
    if (!newName) return message.reply(buildSimple("Provide a valid name for the ticket to be renamed to..."));
    await message.delete().catch(() => {});
    await message.channel.setName(newName);
  }

  if (content.startsWith(".add ")) {
    const userId = content.slice(5).trim().replace(/\D/g, "");
    if (!userId) return;
    await message.delete().catch(() => {});
    await message.channel.permissionOverwrites.edit(userId, {
      ViewChannel: true,
      SendMessages: true,
      ReadMessageHistory: true,
    }).catch(() => {});
    await message.channel.send({ content: `<:alert:1472674963080216809> <@${userId}> has been added sucessfully.` });
    return;
  }

  if (content.startsWith(".remove ")) {
    const userId = content.slice(8).trim().replace(/\D/g, "");
    if (!userId) return;
    await message.delete().catch(() => {});
    await message.channel.permissionOverwrites.delete(userId).catch(() => {});
    await message.channel.send({ content: `<:alert:1472674963080216809> <@${userId}> has been removed sucessfully.` });
    return;
  }
}

module.exports = {
  name: "messageCreate",
  execute: () => {},
  handleMessage,
  handleSelectMenu,
  handleModalSubmit,
  handleClaimButton,
  handleCloseButton,
};
