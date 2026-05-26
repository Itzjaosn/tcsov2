const Application = require("../Database/Models/Application/application");

module.exports = {
  customID: "apply",
  execute: async function (interaction, client) {
    if (interaction.client.database?.isConnected()) {
      const existing = await Application.findOne({
        userId: interaction.user.id,
        status: "pending",
      }).catch(() => null);

      if (existing) {
        return interaction.reply({
          content: "<a:loading:1506059355227947181> You have a pending application. Please wait for a reponse before you apply again.",
          flags: 64,
        });
      }
    }

    return interaction.showModal({
      toJSON: () => ({
        title: "TCSO Entry Application",
        custom_id: "apply",
        components: [
          { type: 1, components: [{ type: 4, custom_id: "q1", label: "Law enforcement experience (IRL or ERLC)?", style: 2, required: true }] },
          { type: 1, components: [{ type: 4, custom_id: "q2", label: "What does a LEO mean to you?", style: 2, required: true }] },
          { type: 1, components: [{ type: 4, custom_id: "q3", label: "Why do you wish to join TCSO?", style: 2, required: true }] },
          { type: 1, components: [{ type: 4, custom_id: "q4", label: "De-escalating an uncompliant suspect?", style: 2, required: true }] },
          { type: 1, components: [{ type: 4, custom_id: "q5", label: "Pro's and cons about yourself?", style: 2, required: true }] },
        ],
      }),
    });
  },
};
