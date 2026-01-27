const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "ip",
  description: "DexioraMC sunucu bilgilerini gösterir",
  execute(message) {
    const embed = new EmbedBuilder()
      .setTitle("🌍 DexioraMC - Sunucu Bilgileri")
      .setDescription(
        "**Sunucu IP:** `5.133.100.199`\n\n" +
        "**Sürüm:** 1.21+"
      )
      .setFooter({
        text: "İyi oyunlar dileriz | DexioraMC Survival",
        iconURL: message.guild.iconURL({ dynamic: true })
      })
      .setColor(0x00ff99);

    message.channel.send({ embeds: [embed] });
  }
};
