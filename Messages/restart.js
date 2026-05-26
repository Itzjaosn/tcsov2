module.exports = {
  name: "restart",
  userPerms: ["Administrator"],
  async execute(message) {
    const { PANEL_URL, PANEL_API_KEY, PANEL_SERVER_ID } = process.env;

    const res = await fetch(
      `${PANEL_URL}/api/client/servers/${PANEL_SERVER_ID}/power`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PANEL_API_KEY}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ signal: "restart" }),
      }
    );

    if (res.status === 204) {
      await message.reply("Restarting... back in a moment.");
    } else {
      const body = await res.text();
      await message.reply(`Failed to restart. Status: ${res.status}\n\`\`\`${body}\`\`\``);
    }
  },
};
