const { handleSelectMenu } = require("../Events/support");

module.exports = {
  customID: "ticket",
  execute: async function (interaction, client, args) {
    return handleSelectMenu(interaction);
  },
};
