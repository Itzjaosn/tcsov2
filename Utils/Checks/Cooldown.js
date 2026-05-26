module.exports = async function CheckCooldown(client, userID, command, cooldown) {
  const cache = client.cache.ns("cooldowns");
  const key = `${userID}:${command}`;
  const timeRemaining = (await cache.get(key)) || 0;
  const remaining = (timeRemaining - Date.now()) / 1000;
  if (remaining > 0) {
    throw [
      `Please wait ${remaining.toFixed(
        1
      )} more seconds before reusing the \`${command}\` command!`,
      "On cooldown",
    ];
  }
  await cache.set(key, Date.now() + cooldown * 1000, cooldown);
};
