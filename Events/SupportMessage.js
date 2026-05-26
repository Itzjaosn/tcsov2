const { handleMessage } = require("./support");

module.exports = {
  name: "messageCreate",
  execute: async (client, message) => { await handleMessage(message); },
};
