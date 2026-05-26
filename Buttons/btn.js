const {
  handleClaimButton,
  handleCloseButton,
} = require("../Events/support");

module.exports = {
  customID: "btn",
  execute: async function (interaction, client, args) {
    const action = args?.[0];
    if (action === "claim") return handleClaimButton(interaction);
    if (action === "close") return handleCloseButton(interaction);
  },
};
