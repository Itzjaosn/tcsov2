const { handleModalSubmit } = require("../Events/support");

module.exports = {
  customID: "modal",
  execute: async function (interaction, client, args) {
    const type = args?.[0];
    if (type === "general")     return handleModalSubmit(interaction, "support", "general");
    if (type === "command")     return handleModalSubmit(interaction, "highcommand", "command");
  },
};
