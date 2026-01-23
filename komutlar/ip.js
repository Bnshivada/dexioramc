const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "ip",
  description: "KuramaMC sunucu bilgilerini gösterir",
  execute(message) {
    const embed = new EmbedBuilder()
      .setTitle("🌍 KuramaMC - Sunucu Bilgileri")
      .setDescription(
        "**Sunucu IP:** `5.133.100.199`\n\n" +
        "**Sürüm:** 1.21.4 ve Üstü"
      )
      .setFooter({
        text: "İyi oyunlar dileriz | KuramaMC Lifesteal",
        iconURL: message.guild.iconURL({ dynamic: true })
      })
      .setColor(0x00ff99);

    message.channel.send({ embeds: [embed] });
  }
};
